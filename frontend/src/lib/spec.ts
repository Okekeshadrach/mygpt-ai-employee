/** Spec section titles so every screen can cite what it demonstrates. */
export const SPEC_SECTIONS: Record<string, string> = {
  '§1': 'Product vision',
  '§2': 'MyGPT Core + Vertical Packs',
  '§3': 'Universal Business Brain',
  '§4': 'Onboarding: build the Brain first',
  '§5': 'Business Playbook',
  '§6': 'Persistent Customer Memory',
  '§7': 'Universal AI agent / orchestration',
  '§8': 'Universal workflow engine',
  '§9': 'Universal tool layer',
  '§10': 'Permissions, approvals & human control',
  '§11': 'WhatsApp + website agent · voice notes',
  '§12': 'Lightweight universal CRM',
  '§13': 'Website generator (approval before publish)',
  '§14': 'Asset generation & missing assets',
  '§15': 'Real Estate Vertical Pack',
  '§16': 'AI Activity Feed · evidence-based priority',
  '§19': 'Global / worldwide requirements',
  '§20': 'Security & multi-tenancy',
  '§21': 'Audit trail & observability',
  '§22': 'Knowledge freshness & versioning',
  '§24': 'Reliability rules',
  '§25': 'V1 scope',
  '§27': 'Critical architecture test',
  '§28': 'End-to-end “wow” scenario',
  '§29': 'Product philosophy',
};

/** Pitch order: the sidebar and "next" buttons follow this. */
export const WALKTHROUGH = [
  { href: '/', label: 'The platform', short: 'Platform', spec: ['§1', '§2'] },
  { href: '/onboarding', label: 'Onboarding builds the Brain', short: 'Onboarding', spec: ['§4', '§5'] },
  { href: '/brain', label: 'Business Brain', short: 'Business Brain', spec: ['§3', '§22'] },
  { href: '/live', label: 'Live conversation', short: 'Live conversation', spec: ['§7', '§28'] },
  { href: '/crm', label: 'CRM & Leads', short: 'CRM & Leads', spec: ['§6', '§12'] },
  { href: '/activity', label: 'Activity & Audit', short: 'Activity & Audit', spec: ['§16', '§21'] },
  { href: '/approvals', label: 'Approvals', short: 'Approvals', spec: ['§10', '§13'] },
] as const;
