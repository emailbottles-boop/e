#!/usr/bin/env node
/**
 * Readiness gate.
 *
 * Reports every entry still carrying scaffolding placeholders or blank
 * identity fields. Nothing should be sent to a business owner, published, or
 * pointed at a domain until its row here is clean.
 *
 *   node scripts/check.js            report on all entries
 *   node scripts/check.js --strict   exit non-zero if anything is unresolved
 */

const fs = require('fs');
const path = require('path');

const CONFIG = path.join(__dirname, '..', 'businesses.json');
const list = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));

const IDENTITY = ['name', 'street', 'city', 'state', 'phone'];

function findPlaceholders(value, trail, hits) {
  if (typeof value === 'string') {
    if (/REPLACE|PLACEHOLDER|TODO/i.test(value)) hits.push(trail);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => findPlaceholders(v, `${trail}[${i}]`, hits));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      findPlaceholders(v, trail ? `${trail}.${k}` : k, hits);
    }
  }
  return hits;
}

let unresolved = 0;
const ready = [];

for (const b of list) {
  const blanks = IDENTITY.filter((f) => !String(b[f] || '').trim());
  const placeholders = findPlaceholders(b, '', []);
  const total = blanks.length + placeholders.length;

  if (total === 0) {
    ready.push(b.slug);
    continue;
  }
  unresolved++;
  console.log(`\n${b.slug}  —  ${total} item(s) to resolve`);
  if (blanks.length) console.log(`  blank identity fields: ${blanks.join(', ')}`);
  if (placeholders.length) {
    const shown = placeholders.slice(0, 6);
    console.log(`  scaffolding text at: ${shown.join(', ')}${
      placeholders.length > 6 ? ` … +${placeholders.length - 6} more` : ''
    }`);
  }
}

console.log(
  `\n${'-'.repeat(60)}\n${ready.length} of ${list.length} ready to send. ${unresolved} still need real details.`
);
if (ready.length) console.log(`ready: ${ready.join(', ')}`);

if (process.argv.includes('--strict') && unresolved > 0) process.exit(1);
