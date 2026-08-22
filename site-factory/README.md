# site-factory

Turns one JSON file into 25 finished, self-contained local-business websites,
then publishes each to its own GitHub repo with a single command.

No dependencies. No build toolchain. Node and `gh` are all it needs.

---

## The two commands

Build every site locally and open the contact sheet:

    node build.js && open dist/index.html      # macOS
    node build.js && start dist\index.html     # Windows
    node build.js && xdg-open dist/index.html  # Linux

Publish all of them, each to its own private repo:

    ./deploy-all.sh --yes

`deploy-all.sh` with no flags is a **dry run** — it prints exactly which repos
it would create or update and touches nothing.

---

## What each generated site contains

    dist/<slug>/
      index.html      one page: hero, services, about, gallery, reviews, contact
      css/site.css    themed from the palette, light + dark, fully responsive
      js/site.js      mobile nav and copyright year — 20 lines, no libraries
      img/            drop photos here
      robots.txt
      sitemap.xml     when a url is set
      README.md       handoff notes for the owner
      .nojekyll

Every page ships with semantic landmarks, a skip link, visible focus rings,
`LocalBusiness` JSON-LD for local search, Open Graph tags, an inline SVG
favicon, and print styles. Zero external requests — no fonts, no CDNs, no
trackers — so the sites load instantly and work offline.

---

## Filling in a real business

Add one from the command line:

    node scripts/new-site.js --name "Ravensdale Roasters" --category coffee \
      --city Ravensdale --state WA --phone "(425) 555-0142"

Or edit `businesses.json` directly. Then rebuild just that one:

    node build.js ravensdale-roasters

Categories: `coffee`, `petgrooming`, `antiques`, `thrift`, `autorepair`,
`nails`, `boutique`, `market`, `homeservices`, `restaurant`, `professional`.

Themes: `coffee`, `pets`, `vintage`, `thrift`, `auto`, `salon`, `boutique`,
`market`, `trade`, `professional` — palettes and type live in
`themes/themes.json`, shared layout in `themes/base.css`.

---

## The readiness gate

    node scripts/check.js

Lists every entry still holding scaffolding text or missing contact details:

    coffee-kent  —  8 item(s) to resolve
      blank identity fields: street, phone
      scaffolding text at: name, hours[0].open, services[4].desc

`deploy-all.sh` runs this first and **refuses to publish** anything still
flagged. `--force` overrides it for private drafts.

This gate exists on purpose. The category scaffolding describes what a
business of that type *typically* offers — it is a starting point to edit, not
a claim about any particular shop. Hours, prices, phone numbers, addresses and
reviews have to come from the owner. `testimonials` renders only when real,
attributable quotes are supplied; the generator never writes one.

---

## The leads

`businesses.json` is loaded with 73 real Washington businesses that appear to
have no website — found through public directory and review listings, spread
across 41 towns and six regions, from the Olympic Peninsula to the Palouse.

    node scripts/leads.js    # regenerate LEADS.md

`LEADS.md` is the call sheet: where each lead came from, what its current web
presence is, and what to confirm before pitching. It regenerates from
`businesses.json`, so it cannot drift.

**No lead is confirmed.** "No website found" means none turned up in search or
in the town's own business directory — not that none exists. Call or walk in
first.

---

## Files

    build.js                 generator — reads businesses.json, writes dist/
    businesses.json          the one file you edit
    deploy-all.sh            build + publish every site to its own repo
    themes/themes.json       palettes, type pairings, hero treatments
    themes/base.css          shared layout and components
    scripts/categories.js    per-category section scaffolding
    scripts/new-site.js      add a business from the command line
    scripts/check.js         readiness gate
    scripts/add-batch.js     merge a batch of scouted leads into the config
    scripts/leads.js         regenerate LEADS.md from businesses.json
    BRIEFING.md              state of play — read this first when picking work back up
    scripts/seed.js          one-time: lay down blank slots
    LEADS.md                 the call sheet — sources and what to confirm

## deploy-all.sh flags

    --yes            actually publish (default is a dry run)
    --public         public repos (default: private)
    --pages          try to enable GitHub Pages on each repo
    --force          publish despite unresolved placeholders
    --only <slug>    just one site (repeatable)

Re-running is safe: existing repos are updated, not recreated.
