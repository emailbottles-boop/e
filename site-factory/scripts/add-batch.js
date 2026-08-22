#!/usr/bin/env node
/**
 * Merge a batch of scouted leads into businesses.json.
 *
 *   node scripts/add-batch.js <batch.json>
 *
 * The batch file is a JSON array of:
 *   { slug, name, category, city, web, sources: [...], verify, region }
 *
 * Category scaffolding is filled in from scripts/categories.js. Identity
 * fields are left blank on purpose — everything a scout reports about a phone
 * number, address or set of hours belongs in `verify` for a human to confirm,
 * never in the fields that render into the page.
 *
 * Duplicate slugs are skipped rather than overwritten, so re-running a batch
 * is safe.
 */

const fs = require('fs');
const path = require('path');
const { CATEGORIES, HOURS_PRESETS } = require('./categories.js');

const CONFIG = path.join(__dirname, '..', 'businesses.json');

const batchPath = process.argv[2];
if (!batchPath) {
  console.error('Usage: node scripts/add-batch.js <batch.json>');
  process.exit(1);
}

const hoursFor = (c) =>
  ['coffee', 'market', 'autorepair', 'restaurant'].includes(c)
    ? HOURS_PRESETS.earlyservice
    : ['nails', 'petgrooming', 'professional'].includes(c)
    ? HOURS_PRESETS.appointment
    : HOURS_PRESETS.retail;

const list = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

let added = 0;
const skipped = [];

for (const e of batch) {
  for (const f of ['slug', 'name', 'category', 'city']) {
    if (!e[f]) {
      console.error(`Batch entry missing "${f}": ${JSON.stringify(e).slice(0, 120)}`);
      process.exit(1);
    }
  }
  const cat = CATEGORIES[e.category];
  if (!cat) {
    console.error(
      `Unknown category "${e.category}" for ${e.slug}. Available: ${Object.keys(CATEGORIES).join(', ')}`
    );
    process.exit(1);
  }
  if (list.some((b) => b.slug === e.slug)) {
    skipped.push(e.slug);
    continue;
  }

  list.push({
    slug: e.slug,
    name: e.name,
    category: e.category,
    theme: cat.theme,
    schemaType: cat.schemaType,
    tagline: cat.tagline,
    eyebrow: `${e.city}, WA`,
    street: '',
    city: e.city,
    state: 'WA',
    zip: '',
    phone: '',
    email: '',
    url: '',
    hours: JSON.parse(JSON.stringify(hoursFor(e.category))),
    services: JSON.parse(JSON.stringify(cat.services)),
    aboutHeading: cat.aboutHeading,
    about: cat.about,
    galleryTiles: cat.galleryTiles,
    testimonials: [],
    social: { facebook: '', instagram: '' },
    cta: { label: '', href: '#contact' },
    status: 'draft',
    lead: {
      web: e.web || '',
      sources: e.sources || [],
      verify: e.verify || '',
      ...(e.region ? { region: e.region } : {}),
    },
  });
  added++;
}

fs.writeFileSync(CONFIG, JSON.stringify(list, null, 2) + '\n');
console.log(`Added ${added}${skipped.length ? `, skipped ${skipped.length} duplicate(s): ${skipped.join(', ')}` : ''}.`);
console.log(`${list.length} total in businesses.json`);
