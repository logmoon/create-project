---
title: Issues
state: in_progress
priority: 10
created: 20260629-173203
tags: 
---
# Issues

## Current
- Optional API key for context7
- Projects change while you work on them and currently I feel that once the context files are created you're kind of locked into following them, I should make it something of a rule/ability for the agent to alter context files if needed in a session. Maybe as part of the closing up after all tests.

## Resolved
- Maybe add git stuff into the workflow
- Started fixing after review, didn't say what it found, didn't ask for what I wanted fixed or any decisions I needed to make (occurence: 1)
- Session awareness, we always do one task per session, the order of steps must be followed; get memory, ask about what to do, architect, start building, review, present review, back and forth (What I want fixed, I also go ahead and test on my own, maybe report back issues if found), then, we close up; imprint (if ui) and /remember save, lastly, prompt the user to start a new session and maybe tell me what to say.
- Seems to treat progress md file as a todo and always ends up modifying it, this is wrong, that thing is managed by the remember save.
- I will most likely remove ponytail, it's causing more issues than it's solving currently, and I'm more than certain that removing it will at least lessen the occurences of the issues described above.
