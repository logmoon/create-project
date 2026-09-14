// .opencode/plugin/memory-hook.js
//
// Injects a short, deterministic summary of memory.md + context/progress-tracker.md
// into the first user message of every new session. No LLM call, no vector DB —
// just reads files (and, for the branch check, git) off disk so the agent never
// starts a session blind.
//
// /remember restore still exists for the full picture + explicit confirmation.
// This hook only covers the "don't start from zero" gap.
//
// Primary-session only: OpenCode fires chat.message for subagent-run turns too
// (e.g. @reviewer gets its own turn with input.agent === "reviewer"). Without
// the check below, a subagent's first turn got this restore checkpoint injected
// and tried to stop and ask "does this look right?" — but a subagent has no
// developer to ask, so it just stalled instead of doing its actual job. Fixed
// by reading opencode.json once for every agent whose mode is "subagent" and
// skipping injection for any of them.

import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { execSync } from "node:child_process"

const injected = new Set()

async function readIfExists(path) {
  try {
    return await readFile(path, "utf-8")
  } catch {
    return null
  }
}

function trimTo(text, maxChars) {
  if (!text) return text
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + "\n…(truncated — run /remember restore for the full picture)"
}

function isStubMemory(text) {
  return text.includes("<!-- Auto-filled by")
}

function isStubTracker(text) {
  return text.includes("🔲") && !text.includes("✅")
}

// Pulls one section's body out of a markdown file by its "## Heading" so the
// auto-restore block carries only what's actively relevant (In Progress, Up
// Next) instead of the whole file — including the "Done" log, which only
// grows and is rarely needed just to resume work.
function extractSection(text, heading) {
  if (!text) return null
  const re = new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, "i")
  const match = text.match(re)
  if (!match) return null
  const body = match[1].replace(/^-{3,}\s*$/gm, "").trim()
  return body || null
}

function extractExpectedBranch(memoryText) {
  if (!memoryText) return null
  const match = memoryText.match(/Branch:\s*(\S+)/i)
  return match && match[1] ? match[1] : null
}

function currentGitBranch(directory) {
  try {
    const out = execSync("git branch --show-current", {
      cwd: directory,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim()
    return out || null
  } catch {
    return null
  }
}

let subagentNamesCache = null

async function getSubagentNames(directory) {
  if (subagentNamesCache) return subagentNamesCache
  const names = new Set()
  try {
    const raw = await readFile(join(directory, "opencode.json"), "utf-8")
    const config = JSON.parse(raw)
    for (const [name, def] of Object.entries(config.agent || {})) {
      if (def && def.mode === "subagent") names.add(name)
    }
  } catch {
    // opencode.json missing or unparsable — fall back to the one subagent
    // this project ships by default so the fix degrades safely, not silently.
    names.add("reviewer")
  }
  subagentNamesCache = names
  return names
}

export const MemoryHook = async ({ directory }) => {
  const subagentNames = await getSubagentNames(directory)

  return {
    "chat.message": async (input, { message, parts }) => {
      try {
        if (!Array.isArray(parts)) return

        // Skip entirely for subagent turns — see header comment.
        if (input.agent && subagentNames.has(input.agent)) return

        const sessionID = input.sessionID
        if (!sessionID || injected.has(sessionID)) return
        injected.add(sessionID)

        const memory = await readIfExists(join(directory, "memory.md"))
        const tracker = await readIfExists(join(directory, "context", "progress-tracker.md"))
        if (!memory && !tracker) return

        // Fresh session: both files exist but are scaffold stubs with no prior work.
        // Skip the checkpoint — nothing to summarise.
        if (memory && tracker && isStubMemory(memory) && isStubTracker(tracker)) {
          parts.unshift({
            type: "text",
            text: [
              "<!-- auto-injected by memory-hook.js — not written by the user -->",
              "Fresh session. Ready.",
            ].join("\n"),
            id: "prt_" + (input.sessionID || "anon") + "-restore",
            sessionID: input.sessionID || "",
            messageID: message?.id || "",
            synthetic: true,
          })
          return
        }

        const trackerInProgress = trimTo(extractSection(tracker, "In Progress"), 800)
        const trackerUpNext = trimTo(extractSection(tracker, "Up Next"), 800)
        const trackerBlocked = trimTo(extractSection(tracker, "Blocked"), 400)

        // Deterministic drift check — no LLM judgment, just compare the branch
        // memory.md says it was saved on against the branch we're actually on.
        const expectedBranch = extractExpectedBranch(memory)
        const actualBranch = currentGitBranch(directory)
        const driftNote =
          expectedBranch && actualBranch && expectedBranch !== actualBranch
            ? `**Heads up:** memory.md was saved on branch \`${expectedBranch}\`, but this repo is currently on \`${actualBranch}\`. Might be a normal branch switch, or it might mean this memory is stale — worth a quick check before assuming it's current.`
            : null

        const trackerBlockParts = [
          trackerInProgress ? `### progress-tracker.md — In Progress\n${trackerInProgress}` : null,
          trackerUpNext ? `### progress-tracker.md — Up Next\n${trackerUpNext}` : null,
          trackerBlocked ? `### progress-tracker.md — Blocked\n${trackerBlocked}` : null,
        ].filter(Boolean).join("\n\n");

        const block = [
          "<!-- auto-injected by memory-hook.js — not written by the user -->",
          "## Session auto-restore",
          "",
          memory ? `### memory.md\n${trimTo(memory, 2000)}` : "_No memory.md yet — first session._",
          "",
          trackerBlockParts,
          driftNote ? `\n${driftNote}` : "",
          "",
          memory || tracker
            ? "Before doing anything else this session: summarise what was restored (last session, current state, decisions in place, next up) in your first reply and ask the user to confirm it's correct. Do not start building until they confirm. This is the start-of-session checkpoint — do it every time, not just when something seems off. Run `/remember restore` only if this summary feels incomplete, a prior session ended abnormally, or you want the fuller history in memory-log.md."
            : "",
        ].filter(Boolean).join("\n")

        parts.unshift({
          type: "text",
          text: block,
          id: "prt_" + (input.sessionID || "anon") + "-restore",
          sessionID: input.sessionID || "",
          messageID: message?.id || "",
          synthetic: true,
        })
      } catch (err) {
        console.warn("[memory-hook] failed to inject session restore:", err)
      }
    },
  }
}
