---
name: debug
description: When something goes wrong during a build, diagnose what type of failure it is before deciding how to respond. Targeted fix, hard reset, or full rethink — the right response depends on the right diagnosis. Reproduces before theorizing, and hands confirmed fixes to /test.
---

Not every problem is a bug. Not every bug needs debugging. The instinct when something breaks is
to keep prompting — describe it, get a fix, get another broken version, describe that, repeat. The
session gets longer, the context gets polluted, and the code gets worse. Usually the problem isn't
the code — it's not knowing what type of failure this actually is.

This skill diagnoses first, then prescribes. Those are two separate steps and they don't swap.

---

## Step 1 — Describe What Went Wrong

The developer describes the problem. The skill listens before doing anything else.

Ask:

```
Describe what is wrong. Be specific:
- What did you expect to happen?
- What happened instead?
- How many times have you tried to fix it already?
```

The number of fix attempts matters — it tells you whether this is a fresh problem or a session that has already gone wrong.

---

## Step 2 — Identify the Failure Mode

### Failure Mode 1 — A specific thing is broken

**Signs:** isolated to one component/function/route, the rest of the project works, this is the first or second attempt, the error or wrong behaviour is clear and specific.

**Response:** Targeted fix — go to Step 3A.

### Failure Mode 2 — The session has gone wrong

**Signs:** multiple fix attempts have made things worse, fixes are patching fixes, context is full of failed attempts, it's no longer clear what the original problem was.

**What it means:** the session is polluted. More prompting compounds the damage — the feature needs rebuilding in a clean context, not patching further.

**Response:** Hard reset — go to Step 3B.

### Failure Mode 3 — The foundation is wrong

**Signs:** the code runs but the behaviour is fundamentally wrong, a core requirement/library API/architectural pattern was misunderstood, the implementation itself — not a piece of it — is wrong.

**What it means:** not a debugging problem. Fixing individual pieces won't help because the approach is incorrect.

**Response:** Rethink — go to Step 3C.

Tell the developer which mode this is before proceeding:

```
This looks like Failure Mode [1/2/3] — [name].

[One sentence explaining why you identified it this way.]

Here is how we handle this:
```

---

## Step 3A — Targeted Fix

For Failure Mode 1.

### Reproduce it first

Before theorizing about why, confirm you can actually trigger the failure — run the code path,
the failing test, or the exact steps the developer described. A root cause diagnosed against a
failure you haven't actually seen happen is a guess wearing the costume of an explanation.

If it won't reproduce, say so and find out why before going further — it may not be Failure Mode 1
after all.

### Find the root cause

Read only the code directly relevant to the problem — not the whole codebase. Identify the actual reason the problem exists, not a symptom of it.

```
Root cause: [specific explanation of why this is happening]

This is different from the symptom because: [explanation]
```

### Suggest a precise fix

The fix that addresses the root cause — not a workaround, not a patch on top of broken code.

```
Fix: [what needs to change and why]

This will resolve the root cause because: [explanation]
```

Wait for the developer to confirm before making any changes.

### If the fix does not work

Stop. Don't suggest another fix immediately — re-examine the root cause diagnosis, since a fix that
didn't work usually means the diagnosis was wrong. Diagnose again from the beginning.

If two diagnoses have both been wrong, this may actually be Failure Mode 2 or 3. Re-evaluate.

### Lock it in

Once the fix is confirmed working, offer — don't force — to hand it to `/test` for a regression
test, so this doesn't come back silently:

```
Fixed and confirmed. Want me to write a regression test for this with /test so it stays fixed?
```

---

## Step 3B — Hard Reset

For Failure Mode 2.

### Acknowledge the situation honestly

```
This session has gone too far in the wrong direction
to recover by patching. The right move is a clean start.

This is not a failure — it is the correct response
to a polluted context. A fresh session with clear intent
will be faster than continuing here.
```

### Save what is worth keeping

```
## Reset Note — [Feature Name]

### What we were building
[Original feature description]

### What went wrong
[Honest summary of how the session went off track]

### What to avoid next time
[Specific approaches or patterns that did not work]

### Starting point for next session
[Where to begin fresh — what to keep, what to discard]
```

### Instruct the developer

```
Next steps:

1. Save this reset note somewhere accessible
2. End this session completely
3. Start a fresh session
4. Begin with /remember restore if memory exists
5. Approach [feature name] again with the reset note as context

Do not continue in this session.
```

---

## Step 3C — Rethink

For Failure Mode 3.

### Name the wrong assumption

```
The core issue is not a bug — it is a wrong assumption:

Assumed: [what was assumed]
Reality: [what is actually true]

This means the current implementation cannot be fixed
by patching. The approach needs to change.
```

### Propose the correct approach

```
Correct approach: [description]

Key difference from current approach: [explanation]

What needs to be discarded: [what cannot be salvaged]
What can be kept: [what is still valid]
```

### Do not start rebuilding immediately

```
Does this diagnosis match your understanding?

If yes — we can start fresh with the correct approach.
If no — tell me what I am getting wrong.
```

Only after the developer confirms does any rebuilding begin.

---

## The Principle

The worst thing you can do when something is broken is keep doing the same thing faster.

Diagnose first. Reproduce before theorizing. Respond correctly for the failure you actually have —
and once it's fixed, hand it to `/test` so it's a regression that can't happen silently again.
