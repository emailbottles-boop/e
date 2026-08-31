#!/usr/bin/env node
/**
 * Build every site and publish each to its own GitHub repo.
 *
 * Cross-platform: this is the real implementation, and deploy-all.sh /
 * deploy-all.cmd are one-line wrappers around it. Keeping the logic in Node
 * rather than in shell means Windows and macOS run the identical code path.
 *
 *   node scripts/deploy.js                 dry run — prints the plan
 *   node scripts/deploy.js --yes           actually publish
 *   node scripts/deploy.js --only <slug>   just one (repeatable)
 *   --public   public repos (default: private)
 *   --pages    try to enable GitHub Pages
 *   --force    publish despite unresolved placeholders
 *
 * Safe to re-run: an existing repo is updated, not recreated.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

/* ------------------------------------------------------------------ args */

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const only = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--only' && argv[i + 1]) only.push(argv[++i]);
}

const APPLY = has('--yes') || has('-y');
const VISIBILITY = has('--public') ? '--public' : '--private';
const PAGES = has('--pages');
const FORCE = has('--force');
const OPEN = has('--open');

if (has('--help') || has('-h')) {
  console.log(
    'Usage: node scripts/deploy.js [--yes] [--public] [--pages] [--force] [--only <slug>]\n\n' +
      '  --yes          actually create repos and push (otherwise dry run)\n' +
      '  --public       create public repos (default: private)\n' +
      '  --pages        try to enable GitHub Pages for each repo\n' +
      '  --force        publish even if check.js still flags placeholders\n' +
      '  --open         open each published repo in the browser afterwards\n' +
      '  --only <slug>  just this one (repeatable)'
  );
  process.exit(0);
}

/* ----------------------------------------------------------------- shell */

// shell:true lets Windows resolve gh.cmd / git.cmd from PATH the same way the
// shells do; without it spawnSync cannot find them.
function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', shell: true, ...opts });
}

function quiet(cmd, args, opts = {}) {
  const r = run(cmd, args, { stdio: 'pipe', ...opts });
  return r.status === 0;
}

function loud(cmd, args, opts = {}) {
  const r = run(cmd, args, { stdio: 'inherit', ...opts });
  return r.status === 0;
}

function capture(cmd, args, opts = {}) {
  const r = run(cmd, args, { stdio: 'pipe', ...opts });
  return r.status === 0 ? String(r.stdout).trim() : null;
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}

/* ------------------------------------------------------------- preflight */

for (const bin of ['node', 'git', 'gh']) {
  if (!quiet(bin, ['--version'])) {
    die(
      bin === 'gh'
        ? 'Missing required command: gh\nInstall the GitHub CLI from https://cli.github.com'
        : `Missing required command: ${bin}`
    );
  }
}

if (!quiet('gh', ['auth', 'status'])) {
  die('GitHub CLI is not authenticated. Run:  gh auth login');
}

const OWNER = capture('gh', ['api', 'user', '--jq', '.login']);
if (!OWNER) die('Could not determine the GitHub account from `gh api user`.');
console.log(`GitHub account: ${OWNER}\n`);

/* ---------------------------------------------------------------- gating */

if (!FORCE) {
  const gate = run('node', [path.join(ROOT, 'scripts', 'check.js'), '--strict'], {
    stdio: 'pipe',
    cwd: ROOT,
  });
  if (gate.status !== 0) {
    console.log('Some entries still contain placeholder text or blank contact details.');
    console.log('Run  node scripts/check.js  to see what is missing.\n');
    console.log("Nothing here should reach a business owner with 'REPLACE:' still in it.");
    console.log('Once the details are confirmed, re-run. To publish anyway (drafts to a');
    console.log('private repo, for your eyes only), add --force.');
    process.exit(1);
  }
}

/* ----------------------------------------------------------------- build */

console.log('Building sites...');
const buildArgs = [path.join(ROOT, 'build.js'), ...only];
if (!loud('node', buildArgs, { cwd: ROOT })) die('Build failed.');

const listed = capture('node', [path.join(ROOT, 'build.js'), '--list'], { cwd: ROOT });
if (listed === null) die('Could not list slugs from build.js.');
const allSlugs = listed.split(/\r?\n/).filter(Boolean);
const slugs = only.length ? only : allSlugs;

const unknown = slugs.filter((s) => !allSlugs.includes(s));
if (unknown.length) die(`Unknown slug(s): ${unknown.join(', ')}`);
console.log();

/* --------------------------------------------------------------- dry run */

const repoExists = (slug) => quiet('gh', ['repo', 'view', `${OWNER}/${slug}`]);

if (!APPLY) {
  console.log('==============================================================');
  console.log(' DRY RUN — nothing was created or pushed.');
  console.log('==============================================================\n');
  console.log(`Would publish ${slugs.length} repo(s) to ${OWNER} (${VISIBILITY.slice(2)}):`);
  for (const slug of slugs) {
    console.log(`  ${repoExists(slug) ? 'update' : 'create'}  ${OWNER}/${slug}`);
  }
  console.log('\nRe-run with --yes to go ahead.');
  process.exit(0);
}

/* --------------------------------------------------------------- publish */

let published = 0;
let failed = 0;
const opened = [];

for (const slug of slugs) {
  const dir = path.join(DIST, slug);
  if (!fs.existsSync(dir)) {
    console.log(`!! ${slug} — no build output, skipping`);
    failed++;
    continue;
  }

  console.log(`-- ${slug}`);
  const cwd = { cwd: dir };

  if (!fs.existsSync(path.join(dir, '.git'))) {
    if (!quiet('git', ['init', '-q', '-b', 'main'], cwd)) {
      quiet('git', ['init', '-q'], cwd);
    }
  }
  quiet('git', ['add', '-A'], cwd);
  // An empty commit is fine on a re-run where nothing changed.
  quiet('git', ['commit', '-q', '-m', `"Build ${slug} site"`], cwd);

  let ok;
  if (repoExists(slug)) {
    quiet('git', ['remote', 'remove', 'origin'], cwd);
    quiet('git', ['remote', 'add', 'origin', `https://github.com/${OWNER}/${slug}.git`], cwd);
    ok = loud('git', ['push', '-u', 'origin', 'main', '--force-with-lease'], cwd);
    if (ok) console.log(`   updated  https://github.com/${OWNER}/${slug}`);
  } else {
    ok = loud(
      'gh',
      ['repo', 'create', `${OWNER}/${slug}`, VISIBILITY, '--source=.', '--remote=origin', '--push'],
      cwd
    );
    if (ok) console.log(`   created  https://github.com/${OWNER}/${slug}`);
  }

  if (!ok) {
    console.log('   FAILED');
    failed++;
    continue;
  }
  published++;
  opened.push(slug);

  if (PAGES) {
    const on = quiet(
      'gh',
      ['api', '-X', 'POST', `repos/${OWNER}/${slug}/pages`,
       '-f', '"source[branch]=main"', '-f', '"source[path]=/"'],
      cwd
    );
    console.log(
      on
        ? `   pages    https://${OWNER}.github.io/${slug}/`
        : '   pages    not enabled (already on, or not available for this repo)'
    );
  }
}

if (OPEN && opened.length) {
  console.log(`\nOpening ${opened.length} repo(s) in your browser...`);
  for (const slug of opened) {
    // Best effort: a browser that will not launch should not fail the deploy.
    if (!quiet('gh', ['repo', 'view', `${OWNER}/${slug}`, '--web'])) {
      console.log(`   could not open ${slug} — https://github.com/${OWNER}/${slug}`);
    }
  }
}

console.log('\n==============================================================');
console.log(` done — ${published} published, ${failed} failed`);
console.log('==============================================================');
process.exit(failed > 0 ? 1 : 0);
