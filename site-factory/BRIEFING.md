# Briefing

State of play for the website business. Read this first when picking the work
back up — it is written to be re-read cold, by me or by anyone else.

Last substantive update: 2026-08-22.

---

## 1. What we are doing

Building websites for small Washington businesses that don't have one, and
pitching them. The work splits three ways:

- **Leads** — real WA businesses with no website, found through public
  directories and review listings.
- **Sites** — a draft site is generated for each lead before the pitch, so the
  conversation starts with something on screen rather than a proposal.
- **Repos** — each finished site gets its own GitHub repo, deployable to Pages.

The generator lives in `site-factory/` in the `emailbottles-boop/e` repo. That
repo's main branch is an unrelated project (Fractured Sky VTT); the website
tooling is confined to `site-factory/` and touches nothing else.

---

## 2. Where the code is

| Thing | Where |
| --- | --- |
| Generator + leads | `emailbottles-boop/e`, branch `claude/website-build-automation-ju1a0h` |
| Open PR | https://github.com/emailbottles-boop/e/pull/1 (draft) |
| Lead call sheet | `site-factory/LEADS.md` — generated, do not hand-edit |
| Lead data | `site-factory/businesses.json` — the one file to edit |
| This doc | `site-factory/BRIEFING.md` |

No CI is configured on that repo, so there are no checks to wait on. PR #1 is
a draft on purpose; it is a working branch, not a finished proposal.

---

## 3. How the generator works

One JSON file in, one complete static site per entry out.

    node build.js                      # build all, writes dist/<slug>/
    node build.js <slug>               # build one
    node scripts/check.js              # what is still unfilled, per business
    node scripts/leads.js              # regenerate LEADS.md
    node scripts/new-site.js --help    # add a business from the CLI
    ./deploy-all.sh                    # DRY RUN — prints plan, touches nothing
    ./deploy-all.sh --yes              # publish each site to its own repo

Each generated site: one page (hero, services, about, gallery, reviews,
contact), themed CSS, ~20 lines of JS, robots.txt, sitemap.xml, and a handoff
README. Semantic landmarks, skip link, focus rings, LocalBusiness JSON-LD,
Open Graph, inline SVG favicon, dark mode, print styles. Zero external
requests — no fonts, no CDNs, no trackers.

Eleven categories: coffee, petgrooming, antiques, thrift, autorepair, nails,
boutique, market, homeservices, restaurant, professional. Ten themes in
`themes/themes.json`.

`deploy-all.sh` defaults to **private** repos, is safe to re-run (existing
repos update rather than get recreated), and refuses to publish anything the
readiness gate still flags.

---

## 4. The rule that matters most

**We do not invent facts about real businesses.**

Name, town and category are what research established. Everything else —
hours, prices, addresses, phone numbers, reviews, founding dates — has to come
from the owner. `scripts/check.js` flags every unfilled field and
`deploy-all.sh` refuses to publish while anything is flagged. `testimonials`
renders only when a real attributable quote is supplied; the generator will
never write one.

Two corollaries that have already come up in practice:

- **"No website found" is not "no website exists."** It means nothing turned
  up in search or in the town's own business directory. Confirm before
  pitching.
- **When sources disagree, record the conflict — do not pick.** Porter
  Antiques lists two different Cole Street addresses; Napavine Espresso two
  different 2nd Ave numbers. Both are written down in `LEADS.md` rather than
  silently resolved into the HTML.

The category scaffolding in `scripts/categories.js` describes what a business
of that type *typically* offers. It is a starting point to edit, not a claim
about any particular shop, and it is deliberately littered with `REPLACE:`
markers so it cannot ship unnoticed.

---

## 5. Current leads

25 businesses, 16 towns, Aberdeen to Cle Elum. Full detail with sources in
`LEADS.md`. Spread: coffee 5 · pet grooming 4 · boutique 4 · antiques 3 ·
auto 2 · market 2 · restaurant 2 · home services 2 · thrift 1.

Three worth calling first:

| Business | Town | Why |
| --- | --- | --- |
| Cicely's Gift Shop | Roslyn | *Northern Exposure* landmark gift shop, 25+ years, in a town people travel to because of the show — and no website. Losing tourist search traffic daily. |
| Sandstone Cafe & Quarry Bar | Tenino | 4.6 stars across 700+ reviews, no web presence at all. |
| Whitehorse Construction | Darrington | Custom homes and remodels — highest ticket on the list, and contractors expect to pay for marketing. Ask for their WA contractor license number for the footer. |

Highest-yield research method by far: town chamber-of-commerce and
visitor-bureau directories. Several state outright which members have no
website. `discoverdarrington.com` and `roselum.com` each produced a whole
batch in one fetch, versus roughly two searches per lead when guessing at
business names.

---

## 6. Prior work — the existing site repos

Roughly 25 local-business site repos already exist under `emailbottles-boop`,
pushed 2026-08-08 through 2026-08-21, mostly **private**. They are separate
one-off repos, not built by this generator. Examples: `newcastle-coffee-company`,
`ravensdale-market`, `poodies-pet-palace`, `auburn-car-repair-offroad`,
`des-moines-nails`, `black-diamond-antiques-more`, `nu-2-u-thrift-store`,
`suburban-soul-boutique`, `st-charles-place-antiques`, `junkers-nest-vintage`,
`tiki-tails-dog-salon`, `foss-grocery-deli`.

Those are South King County businesses (Renton, Auburn, Kent, Federal Way,
Des Moines, Newcastle, Black Diamond, Ravensdale). The new lead list
deliberately reaches into rural WA instead, where web presence is thinner.

**Unknown and worth checking:** whether any of those 25 were ever pitched,
sold, or deployed. Nothing in the repos records their status. If that matters,
ask before assuming any of them is live or paid.

---

## 7. Working a lead

1. Confirm the business is trading and still has no site.
2. Get real name, address, phone, email and hours from the owner.
3. Put them in `businesses.json`.
4. `node build.js <slug>`, open `dist/<slug>/index.html`.
5. `node scripts/check.js` until that slug reports clean.
6. `./deploy-all.sh --only <slug> --yes`.

---

## 8. Open questions

- Are the earlier 25 repos live, pitched, or just drafts?
- Pricing — nothing has been discussed. Tuckaway (dealer mall, needs booth
  pages) and River Time Brewing (needs a changing taplist) are both bigger
  than a one-pager and should not be quoted at one-pager rates.
- No photos exist for any draft. Every site has empty `img/` placeholders, and
  a gift shop or brewery site is weak without them. Worth deciding whether
  photos come from the owner or from a shoot.
