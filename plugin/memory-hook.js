// .opencode/plugin/memory-hook.js
//
// Injects a short, deterministic summary of memory.md + context/progress-tracker.md
// into the first user message of every new session. No LLM call, no vector DB —
// just reads two files off disk so the agent never starts a session blind.
//
// /remember restore still exists for the full picture + explicit confirmation.
// This hook only covers the "don't start from zero" gap.

import { readFile } from "node:fs/promises"
import { join } from "node:path"

const injected = new Set()

async function readIfExists(path) {
  try {
    return await readFile(path, "utf-8")
  } catch {
    return null
  }
}

function trimTo(text, maxChars) {
  if (text.length <= maxChars) return text
  return text.slice(0, maxChars) + "\n…(truncated — run /remember restore for the full picture)"
}

function isStubMemory(text) {
  return text.includes("<!-- Auto-filled by")
}

function isStubTracker(text) {
  return text.includes("🔲") && !text.includes("✅")
}

export const MemoryHook = async ({ directory }) => {
  return {
    "chat.message": async (input, { message, parts }) => {
      try {
        if (!Array.isArray(parts)) return
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

        const block = [
          "<!-- auto-injected by memory-hook.js — not written by the user -->",
          "## Session auto-restore",
          "",
          memory ? `### memory.md\n${trimTo(memory, 3000)}` : "_No memory.md yet — first session._",
          "",
          tracker ? `### context/progress-tracker.md\n${trimTo(tracker, 2000)}` : "",
          "",
          memory || tracker
            ? "Before doing anything else this session: summarise what was restored (last session, current state, decisions in place, next up) in your first reply and ask the user to confirm it's correct. Do not start building until they confirm. This is the start-of-session checkpoint — do it every time, not just when something seems off. Run `/remember restore` only if this summary feels incomplete or a prior session ended abnormally."
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
