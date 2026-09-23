import type { OnboardingScript } from '../../domain/demo';

/** Replay of the onboarding interview that built Baycrest's Brain (spec §4). */
export const onboardingFixture = (): OnboardingScript => ({
  ownerName: 'Sarah',
  businessName: 'Baycrest Realty',
  turns: [
    {
      id: 'o1', role: 'ai',
      text: 'Hi Sarah 👋 I’m MyGPT. Before I speak to a single customer, I need to learn how Baycrest Realty works. This takes about 10 minutes, and you can skip anything and come back to it.\n\nFirst: in a sentence or two, what does the business do?',
    },
    {
      id: 'o2', role: 'owner',
      text: 'We’re a residential brokerage in Miami. Sales and rentals in Coral Gables, Coconut Grove, Brickell and Miami Beach. We also manage rentals for landlords.',
      facts: [
        { category: 'identity', label: 'What we do', value: 'Residential sales & rentals: Coral Gables, Coconut Grove, Brickell, Miami Beach', status: 'owner_verified' },
        { category: 'offerings', label: 'Property management', value: 'For landlords', status: 'owner_verified' },
      ],
      capabilities: ['Real Estate Pack loaded'],
    },
    {
      id: 'o3', role: 'ai',
      text: 'Got it. I’ve loaded the **Real Estate Pack**, so I now understand properties, viewings, buyers, tenants, sellers and landlords.\n\nWhere does your listing inventory live today, and how often does it change?',
    },
    {
      id: 'o4', role: 'owner',
      text: 'A Google Sheet the agents update. About 40 active listings. Prices and availability change a lot.',
      facts: [
        { category: 'offerings', label: 'Active listings', value: '38 listings imported from Google Sheets', status: 'imported' },
        { category: 'pricing', label: 'Listing prices', value: 'Volatile: re-confirm every 14 days', status: 'imported' },
      ],
      capabilities: ['Inventory sync', 'Property matching'],
    },
    {
      id: 'o5', role: 'ai',
      text: 'Imported 38 listings ✅ I’ll treat price and availability as **volatile**: anything not re-confirmed within 14 days won’t be presented to customers as current.\n\nWhen can customers view properties, and who covers which areas?',
    },
    {
      id: 'o6', role: 'owner',
      text: 'Viewings Monday to Saturday, 10 to 4. James covers Coral Gables and South Miami, Oliver does Brickell, Miami Beach and Key Biscayne. Emily handles all the rentals.',
      facts: [
        { category: 'hours', label: 'Viewing hours', value: 'Mon–Sat 10 AM–4 PM', status: 'owner_verified' },
        { category: 'team', label: 'James Carter', value: 'Coral Gables & South Miami sales', status: 'owner_verified' },
        { category: 'team', label: 'Oliver Bennett', value: 'Brickell, Miami Beach, Key Biscayne', status: 'owner_verified' },
        { category: 'team', label: 'Emily Clarke', value: 'All rentals', status: 'owner_verified' },
      ],
      capabilities: ['Viewing scheduling', 'Area-based agent routing'],
    },
    {
      id: 'o7', role: 'ai',
      text: 'Perfect. How do you tell a serious lead from someone just browsing?',
    },
    {
      id: 'o8', role: 'owner',
      text: 'If they know their budget, have their money sorted (cash or a mortgage pre-approval) and want to see a place, that’s hot. Tell the agent immediately.',
      facts: [
        { category: 'playbook', label: 'High-intent definition', value: 'Budget + financing confirmed + viewing requested → alert agent', status: 'owner_verified' },
        { category: 'playbook', label: 'Qualification fields', value: 'Intent, budget, area, bedrooms, timeline, financing', status: 'owner_verified' },
      ],
      capabilities: ['Lead qualification', 'High-intent escalation'],
    },
    {
      id: 'o9', role: 'ai',
      text: 'Noted, that’s now in your **Business Playbook**. What should I never do or promise?',
    },
    {
      id: 'o10', role: 'owner',
      text: 'Never promise a price reduction. Never discuss payments or send wire instructions, and don’t give legal advice. Anything with money goes to a human.',
      facts: [
        { category: 'policies', label: 'Price negotiation', value: 'Never promise a reduction', status: 'owner_verified' },
        { category: 'policies', label: 'Payments & wire instructions', value: 'Never, so hand over to a human', status: 'owner_verified' },
      ],
      permissions: [
        { label: 'Request or move money', class: 'human_only' },
        { label: 'Legal advice / contracts', class: 'human_only' },
      ],
    },
    {
      id: 'o11', role: 'ai',
      text: 'Those are now **human-only**. I can’t do them even if a customer insists.\n\nWhat can I do on my own, and what needs your sign-off first?',
    },
    {
      id: 'o12', role: 'owner',
      text: 'Book viewings and update the CRM yourself. Price changes, discounts and anything we publish, like the website or broadcasts, I approve first.',
      permissions: [
        { label: 'Book viewings', class: 'autonomous' },
        { label: 'Update CRM & memory', class: 'autonomous' },
        { label: 'Change listing prices', class: 'approval_required' },
        { label: 'Fee discounts', class: 'approval_required' },
        { label: 'Publish website / broadcasts', class: 'approval_required' },
      ],
    },
    {
      id: 'o13', role: 'ai',
      text: 'Done. How should I sound with your customers?',
    },
    {
      id: 'o14', role: 'owner',
      text: 'Warm but professional. Short messages. A bit of emoji on WhatsApp is fine. Reply in Spanish if they write in Spanish, and always say you’re our AI assistant if they ask.',
      facts: [
        { category: 'communication', label: 'Tone', value: 'Warm, professional, concise', status: 'owner_verified' },
        { category: 'communication', label: 'Languages', value: 'English and Spanish', status: 'owner_verified' },
        { category: 'communication', label: 'AI disclosure', value: 'Always confirm it’s AI if asked', status: 'owner_verified' },
      ],
    },
    {
      id: 'o15', role: 'ai',
      text: 'Last one: what are your fees?',
    },
    {
      id: 'o16', role: 'owner',
      text: '2.5% on the buyer side for sales. For rentals, one month’s rent as the leasing fee. HOA fees vary by community. I’ll send those later.',
      facts: [
        { category: 'pricing', label: 'Buyer representation', value: '2.5% of purchase price', status: 'owner_verified' },
        { category: 'pricing', label: 'Rental fees', value: 'One month’s rent leasing fee', status: 'owner_verified' },
        { category: 'pricing', label: 'HOA fees by community', value: 'Collected from listings, awaiting your confirmation', status: 'pending_confirmation' },
      ],
    },
    {
      id: 'o17', role: 'ai',
      text: 'Thank you, Sarah. Your **Business Brain** is built: 43 facts, a Playbook and a permission policy.\n\nI’ve also noticed your website is from 2019 and you have no FAQ page, so I’ve **drafted** both for you to review. They won’t go live until you approve them.\n\nHere’s what’s left before launch 👇',
      capabilities: ['Website generator (draft)', 'FAQ drafts', 'Follow-up automation'],
    },
  ],
  readiness: [
    { id: 'r1', label: 'Business identity & services', status: 'ready', detail: '5 facts · owner-verified', spec: '§3' },
    { id: 'r2', label: 'Inventory connected', status: 'ready', detail: '38 listings synced from Google Sheets', spec: '§15' },
    { id: 'r3', label: 'Team & area coverage', status: 'ready', detail: '3 agents mapped to areas', spec: '§3' },
    { id: 'r4', label: 'Viewing hours & availability', status: 'ready', detail: 'Mon–Sat 10 AM–4 PM', spec: '§3' },
    { id: 'r5', label: 'Business Playbook', status: 'ready', detail: 'Qualification, high-intent rule, follow-up cadence', spec: '§5' },
    { id: 'r6', label: 'Permission policy', status: 'ready', detail: '7 autonomous · 4 approval · 4 human-only', spec: '§10' },
    { id: 'r7', label: 'Communication style', status: 'ready', detail: 'Warm, concise, English/Spanish, AI disclosure on', spec: '§3' },
    { id: 'r8', label: 'HOA fees per community', status: 'needs_attention', detail: 'AI collected from listings, needs your confirmation', spec: '§3' },
    { id: 'r9', label: 'Stale listings', status: 'needs_attention', detail: '1 listing not re-confirmed in 14+ days (hidden until confirmed)', spec: '§22' },
    { id: 'r10', label: 'Website', status: 'needs_attention', detail: 'AI draft ready. Publishing needs your approval', spec: '§13' },
    { id: 'r11', label: '2026 holiday closures', status: 'missing', detail: 'Old calendar expired. Upload closures', spec: '§22' },
  ],
});
