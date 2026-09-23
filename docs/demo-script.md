# MyGPT: client pitch script (≈12 minutes)

**Setup before the call**
- `pnpm dev` running; open `http://localhost:3000` in a clean Chrome window, zoom 100%, 1440px+ wide if possible.
- Click **Reset demo data** (bottom of the sidebar) so every screen starts fresh.
- Optional wow: open `/crm` in a second window/tab on another screen. It updates live while you play the chat.
- On the live screen, the **speed** button toggles 1× / 2× / 0.75×. Use 1× for the client.

---

## 0 · Landing `/` (1 min) · §1, §2, §27, §29
**Say:** "MyGPT isn't a chatbot. It's an AI employee. It learns how a business works, talks to its
customers, remembers them, and acts only within the permissions the owner sets."

Scroll to **Build the core once**. "Everything in green is built once and shared by every business: the Brain,
memory, workflows, tools, permissions, CRM and audit. A *Vertical Pack* teaches it an industry. Real estate
is our first pack and the reference implementation, not our identity. Adding dental or restaurants is
configuration, not a rebuild."

Scroll to **Never unlimited authority**. Point at the three classes. **Click:** *Start the walkthrough*.

## 1 · Onboarding `/onboarding` (2 min) · §4, §5, §14
**Say:** "Before it talks to a single customer, MyGPT interviews the owner. This is Sarah, who runs Baycrest
Realty in Miami."

**Click** the green send button 3–4 times (or *Auto-play*). Point at the right panel as it fills:
- "Every answer becomes structured facts in the **Business Brain**, each tagged with its source."
- "It loaded the Real Estate Pack and *discovered* the capabilities this business needs."
- After the "never promise…" answer: "Those just became **human-only** permissions."

**Click** *Skip to end*. **Say:** "It finishes with a practical readiness checklist, not a vanity score. It
noticed the website is from 2019 and drafted a new one, but it won't publish without approval."

**Click** *Review the Business Brain*.

## 2 · Business Brain `/brain` (1.5 min) · §3, §5, §10, §22
**Say:** "This is the single source of truth. Every AI reply retrieves from here first."
- Click the **AI draft** tile: "AI-written content is clearly separated. Customers never see drafts as fact."
- Point at a **volatile** fact (Listing prices): "Prices and availability expire. Anything not re-confirmed in
  14 days is withheld."
- **Permissions** tab: "Three columns: what it does alone, what needs sign-off, what only humans do."
- **Inventory** tab: point at the orange **Stale** listing (BCR-1033). "Remember this one."
- (Optional) **Vertical Pack** tab: "This is all the real-estate-specific part. Swap it for dental and the
  rest is unchanged."

**Click** *Next: Live conversation*.

## 3 · Live conversation `/live` (3 min) · §6, §7, §11, §15, §28 ← the centrepiece
**Say:** "Three columns: the customer's WhatsApp on the left, MyGPT's brain in the middle, the CRM on the right.
Hannah first messaged 12 days ago. She liked a house, but the HOA fee put her off, and she was waiting
on a mortgage."

**Click** *Customer sends a voice note*. While it plays:
- "Voice note in. It's **transcribed**, then goes through the *same* pipeline as text."
- "It **recognizes her** by phone. It doesn't start over, it continues from memory."
- "Budget went from 1.8 to 2 million dollars, and she now needs a guest suite. It noticed the change."
- Knowledge step: "It searched the inventory and found three matches. **BCR-1033 was excluded**: availability
  is 23 days stale, so it won't be offered as current."
- Watch the CRM on the right flash green: "The CRM updated itself. Nobody typed that."
- Read the reply: "It even remembered the HOA objection from 12 days ago."
- "It asks **one** qualifying question, because financing is missing."

**Click** *Customer replies*. "Mortgage approved. Now it can book. The permission check says booking viewings is
**autonomous** for this business, so it checks James's calendar and offers slots."

**Click** *Customer picks a slot*.
- "Both bookings were **confirmed by the calendar before** it told her. It never claims an action it didn't
  complete."
- "Budget confirmed, financing confirmed, viewing booked: that's the owner's **high-intent** rule. So it
  escalates to James."
- Point at the red **handoff briefing** in the CRM: "James gets a concise brief and a recommended next action.
  He doesn't have to read the chat."
- "Six audit records written."

**Click** *Next: CRM*.

## 4 · CRM & Leads `/crm` (1 min) · §6, §12, §16
**Say:** "Hannah moved to *Viewing scheduled* and *High intent* on her own. The radio icon means it was updated
live." Point at **Why this priority**: "Evidence, not a black-box lead score." Scroll the **memory timeline**:
"The owner sees the relationship at a glance."

Click another lead (Daniel Wright): "Every lead has a next action, owned either by the AI or a human."

## 5 · Activity & Audit `/activity` (1.5 min) · §16, §21, §24
**Say:** "This is the owner's daily brief: what the AI employee did today." Point at the **LIVE** entries at
the top. **Click** *High-intent lead escalated to James* to expand:
"Every action is traceable: trigger, the customer context it used, which Brain facts, which tool, arguments,
result and approval status."

**Click** the *Issues & guardrails* filter: "It refused a prompt-injection attempt, declined to share wire instructions,
and escalated a question it couldn't answer instead of guessing."

## 6 · Approvals `/approvals` (1.5 min) · §10, §13
**Say:** "Some things it prepares but never does alone."
- Price change card: "The seller asked by voice note to drop the price. MyGPT prepared the exact change with
  evidence and comparables. Nothing happens until Sarah approves." **Click Approve**, and it moves to
  *Decision history* and appears in the audit trail.
- Website card: "The website it drafted at onboarding. It's never auto-published."
- Human-only card ($8.3M offer): "Accepting an offer is human-only. MyGPT can't do it even with approval. It
  briefs the agent instead."

## Close (30 s)
"One business, one day: onboarding, memory, matching, booking, escalation, audit and approval, all on a core
that isn't real-estate specific. The next vertical is a configuration pack, not a new product."

---

### If something goes wrong
- **Yellow "API isn't responding" box** → the backend isn't running. Run `pnpm dev` from the repo root.
- **Chat already played** → *Restart* on the live screen (resets all demo data).
- **Approvals already approved** → sidebar *Reset demo data*.
