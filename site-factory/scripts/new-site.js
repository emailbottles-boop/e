#!/usr/bin/env node
/**
 * Add a business to businesses.json from the command line.
 *
 *   node scripts/new-site.js --name "Ravensdale Coffee" --category coffee \
 *        --city Ravensdale --state WA [--phone "(425) 555-0100"] [--slug custom-slug]
 *
 * Category scaffolding (services, about, theme) is filled in from
 * scripts/categories.js. Identity facts you do not pass stay blank so the
 * --check gate keeps flagging them until you confirm them with the owner.
 */

const fs = require('fs');
const path = require('path');
const { CATEGORIES, HOURS_PRESETS } = require('./categories.js');

const CONFIG = path.join(__dirname, '..', 'businesses.json');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    out[key] = val;
  }
  return out;
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function hoursFor(category) {
  if (['coffee', 'market', 'autorepair'].includes(category)) return HOURS_PRESETS.earlyservice;
  if (['nails', 'petgrooming', 'professional'].includes(category)) return HOURS_PRESETS.appointment;
  return HOURS_PRESETS.retail;
}

function makeEntry({ name, category, city, state, phone, email, street, zip, slug }) {
  const cat = CATEGORIES[category];
  if (!cat) {
    console.error(
      `Unknown category "${category}". Available: ${Object.keys(CATEGORIES).join(', ')}`
    );
    process.exit(1);
  }
  return {
    slug: slug || slugify(name),
    name,
    category,
    theme: cat.theme,
    schemaType: cat.schemaType,
    tagline: cat.tagline,
    eyebrow: [city, state].filter(Boolean).join(', '),
    street: street || '',
    city: city || '',
    state: state || '',
    zip: zip || '',
    phone: phone || '',
    email: email || '',
    url: '',
    hours: hoursFor(category),
    services: JSON.parse(JSON.stringify(cat.services)),
    aboutHeading: cat.aboutHeading,
    about: cat.about,
    galleryTiles: cat.galleryTiles,
    testimonials: [],
    social: { facebook: '', instagram: '' },
    cta: { label: '', href: '#contact' },
    status: 'draft',
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.name || !args.category) {
    console.log(
      'Usage: node scripts/new-site.js --name "Business Name" --category <cat> \\\n' +
        '         --city City --state WA [--phone ...] [--email ...] [--street ...] [--zip ...] [--slug ...]\n\n' +
        'Categories: ' +
        Object.keys(CATEGORIES).join(', ')
    );
    process.exit(args.help ? 0 : 1);
  }

  const list = fs.existsSync(CONFIG) ? JSON.parse(fs.readFileSync(CONFIG, 'utf8')) : [];
  const entry = makeEntry(args);

  if (list.some((b) => b.slug === entry.slug)) {
    console.error(`Slug "${entry.slug}" is already in businesses.json. Pass --slug to override.`);
    process.exit(1);
  }

  list.push(entry);
  fs.writeFileSync(CONFIG, JSON.stringify(list, null, 2) + '\n');
  console.log(`Added "${entry.name}" as ${entry.slug} (${list.length} total).`);
  console.log(`Next: node build.js ${entry.slug}`);
}

main();
