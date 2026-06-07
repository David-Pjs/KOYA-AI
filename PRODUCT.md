# Koya AI — Product Context

**register: product** (this is a working tool teachers use, not a marketing site; design serves the task)

## What it is, in one breath

A veteran teacher's instrument. A teacher writes five questions on the board, marks the papers by hand like always, types in how many got each one wrong, and Koya tells her the one gap underneath the whole class, where that gap came from, and exactly what to do in the next forty minutes.

Not "learning analytics." Not a dashboard. A diagnosis, the way a good doctor reads symptoms.

## The user (write for this exact person)

**Mrs. Adeyemi.** Twenty-six years teaching Mathematics at a public secondary school in Lagos. SS2, 52 students in one room. Chalk, a blackboard, a government scheme-of-work booklet held together with tape, a stack of exercise books she marks at night. No projector. No student laptops. Power is not guaranteed. Her phone is the only smart device in the room.

She is not impressed by technology and she has no time. She has seen a hundred "edtech" tools that assumed a laptop per child and a stable internet line. She trusts what respects her judgment and saves her time.

What she actually says:
- "Most of them scattered on number three."
- "The back row didn't even attempt it."
- "I taught it well, but the marks are not showing."

What she actually needs, in order:
1. Which children are lost.
2. *Why* (the real reason, not the symptom on today's topic).
3. What to do tomorrow morning, on paper, with no devices.

## The real problem (the thing judges must feel)

Students fail end-of-term and WAEC/NECO exams not because they skipped class, but because a gap from two years ago was never found. A child failing SS2 simultaneous equations in Week 9 often actually has a negative-integers gap from JSS2. Nobody caught it. The teacher moved on. The debt compounded silently until the exam exposed it at scale.

ChatGPT made it worse: students now produce correct-looking answers with no understanding behind them. The gap is invisible until it is catastrophic.

This is not a content problem. Every country has a curriculum; every school has textbooks. The missing layer is **diagnosis** at the scale of one teacher and sixty-something students with no tools.

## The one loop (what we are building, nothing more)

1. **Setup.** Teacher gives the subject, the class, the week's topic, how many students. Optionally photographs the page of her scheme-of-work booklet; Koya reads it so the questions match exactly what her curriculum expects.
2. **Five questions for the board.** Koya generates five short questions that each probe one *prerequisite* skill the topic secretly depends on. Designed for paper, designed to show working, designed so a copied ChatGPT answer can't fake understanding.
3. **She teaches and marks as normal.** Ten minutes, pen and paper, the way she already works.
4. **She enters the counts.** For each question: how many of the 52 got it wrong. One number each. Steppers so she can do it with her thumb.
5. **The reveal.** Koya reads the pattern across all five questions and names the single dominant gap, traces it to the exact earlier class and term it came from, splits the 52 into Foundation / Core / Advanced, and hands her one ready-to-run paper activity per group, plus the one thing to change tomorrow.

Demo path, end to end: SS2 Mathematics, First Term Week 9, Simultaneous Equations, 52 students.

## What we are deliberately NOT building

No student app. No parent portal. No payments. No school-management system. No login wall in the demo. One loop, done with total conviction.

## Voice and copy rules

Write like the veteran teacher talks to a trusted colleague, not like a startup landing page.

- Concrete over abstract. "37 of your 52 can't subtract negative numbers" beats "misconception detected."
- Name the classroom: JSS2, SS2, First Term, Week 9, WAEC, the back row, exercise books, the board, chalk.
- Respect her time and intelligence. No exclamation marks. No hype. No "revolutionary," "powerful," "seamless," "leverage," "unlock," "AI-powered."
- Numbers are characters. A real count landing on screen is the emotional beat, not a decorative big-number stat.
- No em dashes.

## Anti-references (if it looks like these, start over)

- Generic SaaS dashboard with sidebar + KPI cards.
- Blue/purple gradient edtech with a smiling-stock-photo hero.
- Fake trust stats ("38% passed WAEC", "10,000+ teachers") on a product that has no users yet.
- Anything that assumes a device per student or reliable internet in the room.
- Buzzword marketing copy standing in for a real explanation.

## What "winning" looks like

A judge watches the count get entered, sees the diagnosis land, and thinks: *a real teacher in a real Lagos classroom would use this on Monday.* Problem understood deeply, solution fits the actual constraints, the AI does something genuinely hard (reading the pattern and tracing the root gap) that would be worse or impossible without it.
