#!/usr/bin/env node
/**
 * site-factory build
 *
 * Reads businesses.json and emits one complete, self-contained static site
 * per entry into dist/<slug>/. No dependencies, no network calls at build
 * time or run time.
 *
 *   node build.js                 build every business
 *   node build.js <slug> [slug…]  build only the named ones
 *   node build.js --list          print slugs and exit
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const CONFIG = path.join(ROOT, 'businesses.json');

/* ---------------------------------------------------------------- helpers */

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// For values interpolated into a JSON-LD <script> block.
const jsonld = (obj) =>
  JSON.stringify(obj, null, 2).replace(/</g, '\\u003c');

const telHref = (phone) => 'tel:' + String(phone || '').replace(/[^\d+]/g, '');

const has = (v) => v != null && String(v).trim() !== '';

const nonEmpty = (arr) => Array.isArray(arr) && arr.length > 0;

/** Deterministic initials for the logo mark, so rebuilds don't churn. */
function initials(name) {
  const words = String(name)
    .replace(/[^A-Za-z0-9 &]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !/^(the|and|of|a|an|&|co|llc|inc)$/i.test(w));
  if (words.length === 0) return '••';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/* ----------------------------------------------------------------- themes */

function loadThemes() {
  const file = path.join(ROOT, 'themes', 'themes.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/* -------------------------------------------------------------- fragments */

function navHtml(sections) {
  return sections
    .map((s) => `<li><a href="#${esc(s.id)}">${esc(s.label)}</a></li>`)
    .join('\n            ');
}

function hoursHtml(hours) {
  if (!nonEmpty(hours)) return '';
  const rows = hours
    .map(
      (h) => `            <div class="hours-row">
              <dt>${esc(h.days)}</dt>
              <dd>${esc(h.closed ? 'Closed' : `${h.open} – ${h.close}`)}</dd>
            </div>`
    )
    .join('\n');
  return `
        <div class="hours">
          <h3>Hours</h3>
          <dl class="hours-list">
${rows}
          </dl>
        </div>`;
}

function servicesHtml(services, alt) {
  if (!nonEmpty(services)) return '';
  const cards = services
    .map(
      (s) => `          <li class="card">
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.desc)}</p>${
        has(s.price) ? `\n            <p class="price">${esc(s.price)}</p>` : ''
      }
          </li>`
    )
    .join('\n');
  return `
    <section id="services" class="section${alt ? ' alt' : ''}" aria-labelledby="services-h">
      <div class="wrap">
        <h2 id="services-h">What We Do</h2>
        <ul class="cards" role="list">
${cards}
        </ul>
      </div>
    </section>`;
}

function testimonialsHtml(items, alt) {
  // Rendered only when real, attributable quotes are supplied. The factory
  // never invents these.
  if (!nonEmpty(items)) return '';
  const quotes = items
    .map(
      (t) => `          <figure class="quote">
            <blockquote><p>${esc(t.quote)}</p></blockquote>
            <figcaption>— ${esc(t.author)}${
        has(t.source) ? `, <span class="src">${esc(t.source)}</span>` : ''
      }</figcaption>
          </figure>`
    )
    .join('\n');
  return `
    <section id="reviews" class="section${alt ? ' alt' : ''}" aria-labelledby="reviews-h">
      <div class="wrap">
        <h2 id="reviews-h">In Their Words</h2>
        <div class="quotes">
${quotes}
        </div>
      </div>
    </section>`;
}

function galleryHtml(b, alt) {
  const n = Number(b.galleryTiles || 0);
  if (!n) return '';
  const tiles = Array.from({ length: n }, (_, i) => {
    return `          <li class="tile" aria-hidden="true"><span class="tile-slot">Photo ${
      i + 1
    }</span></li>`;
  }).join('\n');
  return `
    <section id="gallery" class="section${alt ? ' alt' : ''}" aria-labelledby="gallery-h">
      <div class="wrap">
        <h2 id="gallery-h">Gallery</h2>
        <p class="note">Drop your photos into <code>img/</code> and swap these placeholders in <code>index.html</code>.</p>
        <ul class="gallery" role="list">
${tiles}
        </ul>
      </div>
    </section>`;
}

function contactHtml(b, alt) {
  const addrParts = [b.street, [b.city, b.state].filter(has).join(', '), b.zip]
    .filter(has)
    .map(esc);
  const address = addrParts.length
    ? `          <address>
            ${addrParts.join('<br>\n            ')}
          </address>`
    : '';

  const phone = has(b.phone)
    ? `          <p class="contact-line"><a class="big-link" href="${esc(
        telHref(b.phone)
      )}">${esc(b.phone)}</a></p>`
    : '';

  const email = has(b.email)
    ? `          <p class="contact-line"><a class="big-link" href="mailto:${esc(
        b.email
      )}">${esc(b.email)}</a></p>`
    : '';

  const social = b.social || {};
  const links = Object.entries(social)
    .filter(([, url]) => has(url))
    .map(
      ([k, url]) =>
        `<li><a href="${esc(url)}" rel="noopener">${esc(
          k[0].toUpperCase() + k.slice(1)
        )}</a></li>`
    );
  const socialHtml = links.length
    ? `\n          <ul class="social" role="list">${links.join('')}</ul>`
    : '';

  return `
    <section id="contact" class="section${alt ? ' alt' : ''}" aria-labelledby="contact-h">
      <div class="wrap contact-grid">
        <div>
          <h2 id="contact-h">Visit or Call</h2>
${[address, phone, email].filter(Boolean).join('\n')}${socialHtml}
        </div>
${hoursHtml(b.hours)}
      </div>
    </section>`;
}

/* ------------------------------------------------------------------ pages */

function buildIndex(b, theme) {
  const sections = [];
  if (nonEmpty(b.services)) sections.push({ id: 'services', label: 'Services' });
  if (has(b.about)) sections.push({ id: 'about', label: 'About' });
  if (Number(b.galleryTiles || 0)) sections.push({ id: 'gallery', label: 'Gallery' });
  if (nonEmpty(b.testimonials)) sections.push({ id: 'reviews', label: 'Reviews' });
  sections.push({ id: 'contact', label: 'Contact' });

  const title = `${b.name}${has(b.city) ? ` — ${b.city}, ${b.state}` : ''}`;
  const desc =
    b.metaDescription ||
    `${b.name}${has(b.tagline) ? ` — ${b.tagline}` : ''}${
      has(b.city) ? ` Serving ${b.city}, ${b.state}.` : ''
    }`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': b.schemaType || 'LocalBusiness',
    name: b.name,
  };
  if (has(b.tagline)) schema.slogan = b.tagline;
  if (has(b.phone)) schema.telephone = b.phone;
  if (has(b.email)) schema.email = b.email;
  if (has(b.street) || has(b.city)) {
    schema.address = { '@type': 'PostalAddress' };
    if (has(b.street)) schema.address.streetAddress = b.street;
    if (has(b.city)) schema.address.addressLocality = b.city;
    if (has(b.state)) schema.address.addressRegion = b.state;
    if (has(b.zip)) schema.address.postalCode = b.zip;
    schema.address.addressCountry = 'US';
  }
  if (has(b.url)) schema.url = b.url;

  const primaryCta = b.cta && has(b.cta.label)
    ? `<a class="btn btn-primary" href="${esc(b.cta.href || '#contact')}">${esc(
        b.cta.label
      )}</a>`
    : has(b.phone)
    ? `<a class="btn btn-primary" href="${esc(telHref(b.phone))}">Call ${esc(
        b.phone
      )}</a>`
    : `<a class="btn btn-primary" href="#contact">Get in Touch</a>`;

  const aboutSection = (alt) => has(b.about)
    ? `
    <section id="about" class="section${alt ? ' alt' : ''}" aria-labelledby="about-h">
      <div class="wrap narrow">
        <h2 id="about-h">${esc(b.aboutHeading || 'Our Story')}</h2>
        ${String(b.about)
          .split(/\n\s*\n/)
          .map((p) => `<p>${esc(p.trim())}</p>`)
          .join('\n        ')}
      </div>
    </section>`
    : '';

  // Stripe light/tinted by the order sections actually render, so an omitted
  // section never leaves two tinted bands touching. A builder that returns ''
  // is simply not pushed, and the next one reuses the same stripe index.
  const parts = [];
  const push = (fn) => {
    const html = fn(parts.length % 2 === 1);
    if (html) parts.push(html);
  };

  push((alt) => servicesHtml(b.services, alt));
  push((alt) => aboutSection(alt));
  push((alt) => galleryHtml(b, alt));
  push((alt) => testimonialsHtml(b.testimonials, alt));
  push((alt) => contactHtml(b, alt));

  const body = parts.join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="${esc(theme.colors.brand)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${theme.colors.brand}"/><text x="32" y="43" font-family="system-ui,sans-serif" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">${initials(
      b.name
    )}</text></svg>`
  )}">
<link rel="stylesheet" href="css/site.css">
<script type="application/ld+json">
${jsonld(schema)}
</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="#top">
      <span class="mark" aria-hidden="true">${esc(initials(b.name))}</span>
      <span class="brand-text">${esc(b.name)}</span>
    </a>
    <button class="nav-toggle" aria-expanded="false" aria-controls="nav">
      <span class="sr-only">Menu</span>
      <span class="bars" aria-hidden="true"></span>
    </button>
    <nav id="nav" aria-label="Main">
      <ul role="list">
            ${navHtml(sections)}
      </ul>
    </nav>
  </div>
</header>

<main id="main">
  <section id="top" class="hero" aria-labelledby="hero-h">
    <div class="wrap hero-inner">
      <p class="eyebrow">${esc(
        b.eyebrow || [b.city, b.state].filter(has).join(', ')
      )}</p>
      <h1 id="hero-h">${esc(b.name)}</h1>
      ${has(b.tagline) ? `<p class="lede">${esc(b.tagline)}</p>` : ''}
      <p class="hero-actions">
        ${primaryCta}
        <a class="btn btn-ghost" href="#contact">Hours &amp; Directions</a>
      </p>
    </div>
  </section>
${body}
</main>

<footer class="site-footer">
  <div class="wrap footer-inner">
    <p>&copy; <span id="year"></span> ${esc(b.name)}. All rights reserved.</p>
    <p class="colophon">${esc(
      [b.city, b.state].filter(has).join(', ')
    )}</p>
  </div>
</footer>

<script src="js/site.js"></script>
</body>
</html>
`;
}

/* -------------------------------------------------------------------- css */

function buildCss(theme) {
  const c = theme.colors;
  const base = fs.readFileSync(path.join(ROOT, 'themes', 'base.css'), 'utf8');
  const vars = `:root {
  --brand: ${c.brand};
  --brand-ink: ${c.brandInk};
  --accent: ${c.accent};
  --bg: ${c.bg};
  --bg-alt: ${c.bgAlt};
  --surface: ${c.surface};
  --ink: ${c.ink};
  --ink-soft: ${c.inkSoft};
  --line: ${c.line};
  --font-display: ${theme.fonts.display};
  --font-body: ${theme.fonts.body};
  --radius: ${theme.radius};
  --hero-pattern: ${theme.heroPattern || 'none'};
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: ${c.darkBg};
    --bg-alt: ${c.darkBgAlt};
    --surface: ${c.darkSurface};
    --ink: ${c.darkInk};
    --ink-soft: ${c.darkInkSoft};
    --line: ${c.darkLine};
  }
}

:root[data-theme="dark"] {
  --bg: ${c.darkBg};
  --bg-alt: ${c.darkBgAlt};
  --surface: ${c.darkSurface};
  --ink: ${c.darkInk};
  --ink-soft: ${c.darkInkSoft};
  --line: ${c.darkLine};
}
`;
  return vars + '\n' + base;
}

/* --------------------------------------------------------------------- js */

const SITE_JS = `// Minimal progressive enhancement. No dependencies.
(function () {
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }
})();
`;

/* ------------------------------------------------------------------ files */

function siteReadme(b) {
  return `# ${b.name} — website

Static site. No build step, no dependencies, no external requests.

## Local preview

    python3 -m http.server 8000

Then open http://localhost:8000

## Deploy (GitHub Pages)

Settings → Pages → Source: **Deploy from a branch** → \`main\` / \`/ (root)\`.

## Editing

- Copy and content: \`index.html\`
- Colors, type, spacing: the \`:root\` block at the top of \`css/site.css\`
- Photos: add to \`img/\` and replace the \`.tile\` placeholders in \`index.html\`

## Status

Draft prepared for review. Placeholder copy and contact details must be
confirmed with the business owner before this goes live.
`;
}

function robots(b) {
  const sitemap = has(b.url) ? `\nSitemap: ${b.url.replace(/\/$/, '')}/sitemap.xml\n` : '\n';
  return `User-agent: *\nAllow: /\n${sitemap}`;
}

function sitemap(b) {
  if (!has(b.url)) return null;
  const loc = b.url.replace(/\/$/, '') + '/';
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(loc)}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`;
}

/* --------------------------------------------------------------- preview */

/** A local contact sheet: every built site, one click away. Not deployed. */
function buildPreviewIndex(built, themes) {
  const rows = built
    .map((b) => {
      const theme = themes[b.theme] || {};
      const c = (theme.colors || {}).brand || '#666';
      const place = [b.city, b.state].filter(has).join(', ');
      const ready = !JSON.stringify(b).match(/REPLACE|PLACEHOLDER|TODO/i);
      return `    <li>
      <a href="${esc(b.slug)}/index.html">
        <span class="swatch" style="background:${esc(c)}" aria-hidden="true">${esc(
        initials(b.name)
      )}</span>
        <span class="meta">
          <strong>${esc(b.slug)}</strong>
          <span>${esc(b.name)}${place ? ` · ${esc(place)}` : ''}</span>
        </span>
        <span class="badge ${ready ? 'ok' : 'draft'}">${ready ? 'ready' : 'needs details'}</span>
      </a>
    </li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>site-factory — ${built.length} drafts</title>
<style>
  :root { color-scheme: light dark; --line:#8883; --soft:#7a7a7a; }
  body { font: 16px/1.6 system-ui, sans-serif; margin: 0; padding: 2.5rem 1.25rem; }
  .wrap { width: min(100% - 1rem, 46rem); margin-inline: auto; }
  h1 { font-size: 1.5rem; margin: 0 0 .35rem; }
  p.sub { color: var(--soft); margin: 0 0 2rem; }
  ul { list-style: none; padding: 0; margin: 0; }
  li + li { margin-top: .5rem; }
  a { display: flex; align-items: center; gap: .9rem; text-decoration: none;
      color: inherit; border: 1px solid var(--line); border-radius: 10px;
      padding: .75rem .9rem; }
  a:hover { border-color: currentColor; }
  .swatch { display: grid; place-items: center; width: 2.4rem; height: 2.4rem;
            border-radius: 8px; color: #fff; font-size: .78rem; font-weight: 700; flex: none; }
  .meta { display: flex; flex-direction: column; margin-right: auto; min-width: 0; }
  .meta span { color: var(--soft); font-size: .85rem; }
  .badge { font-size: .72rem; font-weight: 700; text-transform: uppercase;
           letter-spacing: .06em; padding: .25rem .5rem; border-radius: 5px; flex: none; }
  .badge.ok { background: #1a7f4b22; color: #1a7f4b; }
  .badge.draft { background: #a8620022; color: #a86200; }
</style>
</head>
<body>
<div class="wrap">
  <h1>site-factory</h1>
  <p class="sub">${built.length} draft${built.length === 1 ? '' : 's'} built locally. Nothing here is published.</p>
  <ul>
${rows}
  </ul>
</div>
</body>
</html>
`;
}

/* -------------------------------------------------------------- validation */

function validate(b, i, themes) {
  const errs = [];
  if (!has(b.slug)) errs.push(`entry ${i}: missing "slug"`);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(b.slug || ''))
    errs.push(`entry ${i} (${b.slug}): slug must be lowercase letters, digits and hyphens`);
  if (!has(b.name)) errs.push(`entry ${i} (${b.slug}): missing "name"`);
  if (has(b.theme) && !themes[b.theme])
    errs.push(
      `entry ${i} (${b.slug}): unknown theme "${b.theme}" — available: ${Object.keys(
        themes
      ).join(', ')}`
    );
  return errs;
}

/* ------------------------------------------------------------------- main */

function main() {
  const argv = process.argv.slice(2);
  const themes = loadThemes();

  if (!fs.existsSync(CONFIG)) {
    console.error(`No businesses.json found at ${CONFIG}`);
    process.exit(1);
  }

  let list;
  try {
    list = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  } catch (e) {
    console.error(`businesses.json is not valid JSON: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(list)) {
    console.error('businesses.json must be a JSON array.');
    process.exit(1);
  }

  if (argv.includes('--list')) {
    list.forEach((b) => console.log(b.slug));
    return;
  }

  const errors = list.flatMap((b, i) => validate(b, i, themes));
  if (errors.length) {
    console.error('Config errors:\n  ' + errors.join('\n  '));
    process.exit(1);
  }

  const seen = new Set();
  for (const b of list) {
    if (seen.has(b.slug)) {
      console.error(`Duplicate slug: ${b.slug}`);
      process.exit(1);
    }
    seen.add(b.slug);
  }

  const only = argv.filter((a) => !a.startsWith('--'));
  const targets = only.length ? list.filter((b) => only.includes(b.slug)) : list;

  if (only.length && targets.length !== only.length) {
    const found = new Set(targets.map((t) => t.slug));
    console.error('Unknown slug(s): ' + only.filter((s) => !found.has(s)).join(', '));
    process.exit(1);
  }

  fs.mkdirSync(DIST, { recursive: true });

  // On a full build, drop output for slugs no longer in the config so a
  // removed or renamed business cannot linger in dist/ and get reviewed or
  // shipped by mistake.
  if (!only.length) {
    const keep = new Set(list.map((b) => b.slug));
    for (const name of fs.readdirSync(DIST)) {
      const p = path.join(DIST, name);
      if (!fs.statSync(p).isDirectory() || keep.has(name)) continue;
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`pruned dist/${name}  (no longer in businesses.json)`);
    }
  }

  for (const b of targets) {
    const theme = themes[b.theme] || themes[Object.keys(themes)[0]];
    const out = path.join(DIST, b.slug);

    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(path.join(out, 'css'), { recursive: true });
    fs.mkdirSync(path.join(out, 'js'), { recursive: true });
    fs.mkdirSync(path.join(out, 'img'), { recursive: true });

    fs.writeFileSync(path.join(out, 'index.html'), buildIndex(b, theme));
    fs.writeFileSync(path.join(out, 'css', 'site.css'), buildCss(theme));
    fs.writeFileSync(path.join(out, 'js', 'site.js'), SITE_JS);
    fs.writeFileSync(path.join(out, 'README.md'), siteReadme(b));
    fs.writeFileSync(path.join(out, 'robots.txt'), robots(b));
    fs.writeFileSync(path.join(out, '.nojekyll'), '');
    fs.writeFileSync(
      path.join(out, 'img', '.gitkeep'),
      ''
    );
    const sm = sitemap(b);
    if (sm) fs.writeFileSync(path.join(out, 'sitemap.xml'), sm);

    console.log(`built  dist/${b.slug}  (theme: ${b.theme || 'default'})`);
  }

  fs.writeFileSync(path.join(DIST, 'index.html'), buildPreviewIndex(targets, themes));

  console.log(`\n${targets.length} site(s) written to dist/`);
  console.log(`Open dist/index.html to review them all.`);
}

main();
