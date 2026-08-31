#!/usr/bin/env node
/**
 * Generate LEADS.md — the call sheet.
 *
 * One row per business: where the lead came from, what its current web
 * presence is, and what has to be confirmed before pitching. Regenerated from
 * businesses.json so it can never drift from the config.
 *
 *   node scripts/leads.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'businesses.json'), 'utf8'));

const IDENTITY = ['name', 'street', 'city', 'state', 'phone'];

function unresolved(b) {
  const blanks = IDENTITY.filter((f) => !String(b[f] || '').trim()).length;
  const ph = (JSON.stringify({ ...b, lead: undefined }).match(/REPLACE/g) || []).length;
  return blanks + ph;
}

const byTown = {};
for (const b of list) (byTown[b.city] = byTown[b.city] || []).push(b);

let out = `# Leads

${list.length} Washington businesses with no website found, across ${
  Object.keys(byTown).length
} towns. A draft site is built for each one in \`dist/<slug>/\`.

**Nothing here is confirmed.** Every lead was found through public directory
and review listings. "No website found" means none turned up in search or in
the town's own business directory — not that none exists. Call or walk in
before you pitch.

Category scaffolding on each site describes what a business of that type
typically offers. Hours, prices, addresses, phone numbers and reviews are
blank on purpose; they have to come from the owner.

---

`;

for (const town of Object.keys(byTown).sort()) {
  out += `## ${town}, WA\n\n`;
  for (const b of byTown[town]) {
    const lead = b.lead || {};
    out += `### ${b.name}\n\n`;
    out += `- **Type:** ${b.category}\n`;
    out += `- **Draft:** \`dist/${b.slug}/index.html\`\n`;
    out += `- **Repo slug:** \`${b.slug}\`\n`;
    if (lead.web) out += `- **Current web presence:** ${lead.web}\n`;
    if (lead.verify) out += `- **Confirm before pitching:** ${lead.verify}\n`;
    if (lead.sources && lead.sources.length) {
      out += `- **Sources:** ${lead.sources.map((s) => `<${s}>`).join(' · ')}\n`;
    }
    out += `- **Still to fill in:** ${unresolved(b)} field(s) — see \`node scripts/check.js\`\n\n`;
  }
}

out += `---

## Working a lead

1. Confirm the business is trading and still has no site.
2. Get the real name, address, phone, email and hours from the owner.
3. Put them in \`businesses.json\` (or run \`node scripts/new-site.js --help\`).
4. \`node build.js <slug>\` and open \`dist/<slug>/index.html\`.
5. \`node scripts/check.js\` until that slug reports clean.
6. \`./deploy-all.sh --only <slug> --yes\` to publish it.
`;

fs.writeFileSync(path.join(ROOT, 'LEADS.md'), out);
console.log(`Wrote LEADS.md — ${list.length} leads across ${Object.keys(byTown).length} towns.`);
