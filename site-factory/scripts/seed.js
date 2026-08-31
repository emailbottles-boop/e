#!/usr/bin/env node
/**
 * One-time seed: lay down 25 empty pitch slots spread across the categories
 * and South King County cities this shop already works in.
 *
 * Every slot is intentionally blank on identity. Fill in a real business with
 * scripts/new-site.js or by editing businesses.json, then run
 * `node scripts/check.js` to confirm nothing scaffolded is left.
 */

const fs = require('fs');
const path = require('path');
const { CATEGORIES, HOURS_PRESETS } = require('./categories.js');

const CONFIG = path.join(__dirname, '..', 'businesses.json');

const SLOTS = [
  ['coffee', 'Kent'], ['coffee', 'Covington'], ['coffee', 'Enumclaw'], ['coffee', 'Burien'],
  ['petgrooming', 'Maple Valley'], ['petgrooming', 'Federal Way'], ['petgrooming', 'Burien'],
  ['antiques', 'Enumclaw'], ['antiques', 'Kent'], ['antiques', 'Issaquah'],
  ['thrift', 'Tukwila'], ['thrift', 'Covington'],
  ['autorepair', 'Kent'], ['autorepair', 'Maple Valley'],
  ['nails', 'Covington'], ['nails', 'Burien'],
  ['boutique', 'Issaquah'], ['boutique', 'Enumclaw'], ['boutique', 'Maple Valley'],
  ['market', 'Black Diamond'], ['market', 'Enumclaw'],
  ['homeservices', 'Kent'], ['homeservices', 'Auburn'],
  ['professional', 'Renton'], ['professional', 'Federal Way'],
];

function hoursFor(category) {
  if (['coffee', 'market', 'autorepair', 'restaurant'].includes(category)) return HOURS_PRESETS.earlyservice;
  if (['nails', 'barber', 'petgrooming', 'professional'].includes(category)) return HOURS_PRESETS.appointment;
  return HOURS_PRESETS.retail;
}

const seen = {};
const list = SLOTS.map(([category, city]) => {
  const cat = CATEGORIES[category];
  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
  seen[category + citySlug] = (seen[category + citySlug] || 0) + 1;
  const n = seen[category + citySlug];

  return {
    slug: `${category}-${citySlug}${n > 1 ? `-${n}` : ''}`,
    name: 'REPLACE: Business Name',
    category,
    theme: cat.theme,
    schemaType: cat.schemaType,
    tagline: cat.tagline,
    eyebrow: `${city}, WA`,
    street: '',
    city,
    state: 'WA',
    zip: '',
    phone: '',
    email: '',
    url: '',
    hours: JSON.parse(JSON.stringify(hoursFor(category))),
    services: JSON.parse(JSON.stringify(cat.services)),
    aboutHeading: cat.aboutHeading,
    about: cat.about,
    galleryTiles: cat.galleryTiles,
    testimonials: [],
    social: { facebook: '', instagram: '' },
    cta: { label: '', href: '#contact' },
    status: 'slot',
  };
});

fs.writeFileSync(CONFIG, JSON.stringify(list, null, 2) + '\n');
console.log(`Seeded ${list.length} slots into businesses.json`);
