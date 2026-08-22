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
| Ruled out | `site-factory/RULED-OUT.md` — check before re-scouting anywhere |
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

**73 businesses across 41 towns and 6 regions.** Full detail with sources in
`LEADS.md`. Every entry carries its source URLs; none is confirmed.

| Region | Leads |
| --- | --- |
| South/Central Puget Sound | 25 |
| Northeast WA | 10 |
| Palouse / SE WA | 10 |
| Southwest WA | 10 |
| Olympic Peninsula | 9 |
| Northwest WA | 9 |

Categories: coffee 12 · restaurant 10 · boutique 10 · thrift 9 · antiques 7 ·
market 7 · auto 6 · pet grooming 5 · home services 5 · nails 2.

### Call these first

| Business | Town | Why |
| --- | --- | --- |
| Joyce General Store | Joyce | Open since 1911, described as the longest continually operating general store in WA, still houses the post office, ~60,000 items in ~2,000 sq ft — on the Highway 112 tourist route with no page of its own. Best story on the list. |
| Trestle Coffee | Tekoa | Most urgent. New owners took over in 2025 from the previous cafe in the same building — and the **predecessor brand still owns the searchable web presence for that address** while the current business has only Instagram. New ownership means budget decisions are being made now. |
| Cicely's Gift Shop | Roslyn | *Northern Exposure* landmark, 25+ years, in a town people travel to because of the show. No website. |
| Colfax Body Repair | Colfax | A direct competitor in the same small town already runs a real site. They do 24-hour towing — the thing people search for on a phone at the roadside, which is what a Facebook page handles worst. |
| Etc. Mercantile | Kalama | Gift shop that is *also* a FedEx and UPS authorized shipping outlet with private mailboxes. Shipping customers search for that, and it appears nowhere they control. |
| Dog Gone Groomer | Sequim | They already tried to have a web presence and it went stale on a free Blogspot. ~40 years' experience; direct competitor runs a real site with online booking. |
| The Carlisle | Onalaska | 4.1 across 216 reviews, #1 of 4 in town, steak and prime rib — menu exists only on five scraped aggregator sites they do not control. |
| Sandstone Cafe | Tenino | 4.6 across 700+ reviews, no web presence at all. |
| Whitehorse Construction | Darrington | Custom homes and remodels — highest ticket on the list. Get their WA contractor licence number for the footer. |

### Traps already cleared — do not re-litigate

Three domains look like they belong to a lead and do not:

- `kimsuniqueboutique.com` → a hematite jewellery seller in Cincinnati, Ohio.
- `outdoorventure.com` → Outdoor Venture Corporation, a **military tent
  manufacturer** in Stearns, Kentucky.
- `classyclosetconsignmentandboutique.com` and friends → Iowa businesses.

Two name collisions that will waste a call: **Foothills Automotive** (a
well-established unrelated shop of the same name in Granite Falls, NORTH
CAROLINA, which dominates search) and **The Curiosity Shop** (collides with Ye
Olde Curiosity Shop in Seattle and others).

### Leads that need a different pitch shape

- **The Nail Nook** (Kalama) — a group of individual nail artists sharing a
  space, each running their own business. There may be no single decision-maker
  and no single budget. Find out who holds the lease; a "meet the artists" page
  with per-artist booking links is the shape that fits.
- **Thrifty Grandmothers** (Colfax) — all-volunteer charity shop. Lead with
  donations and volunteer sign-up, not commerce. Decisions go through a
  committee.
- **Back to Basics** and **Concrete Laundromat** (Concrete) — listed at the
  **identical address and identical phone**. Almost certainly one owner.
  Confirm, and consider pitching as a single client.
- **Justice General Store** (Onalaska) — a convenience store. Sell hours,
  location and presence, not e-commerce. Do not over-scope.
- **Tekoa Market** — visible reviews complain about prices and produce. Frame
  around weekly specials and deli ordering, not brand polish.

### Bellingham

Scouted exhaustively (424 chamber pages, 1,430 directory listings, the full
Fairhaven roster). Two picked and built:

- **The Barbershop at Fairhaven** — ~25 years at one address, 34 Yelp reviews,
  a WhatcomTalk feature that already wrote the brand story, and appointment-only
  booking, so every appointment currently costs a phone call.
- **Kim's Grooming** — est. 2007, 5-star, reviewers say to book well ahead. The
  no-website read is confirmed by a source rather than inferred: Whatcom Local
  renders "Website: Not listed".

Twelve more qualified Bellingham leads are in the scout's report but not yet in
the config — ask and I'll add them.

Method note: an empty "website" cell in a Bellingham directory is **weak
evidence**; most Fairhaven businesses with an empty cell do own domains. Every
Bellingham lead was individually search-verified instead.

### Coverage gap

**Pacific County (Long Beach peninsula, Ilwaco, Ocean Park, Raymond, South
Bend) yielded nothing** — and not for lack of looking. Its tourism economy
means businesses there are unusually well-websited; every shop on the Evergreen
Coast visitor directory had a link. Don't re-scout it.

Also: `business.lbchamber.com` and `business.castlerock.org` look like the
right chamber directories but are **Long Beach, California and Castle Rock,
Colorado**. Do not use them.

### What actually works for finding leads

Town chamber-of-commerce and visitor-bureau directories, by a wide margin.
Several state outright which members have no website, and some render a website
column so an empty cell is itself evidence. `discoverdarrington.com`,
`roselum.com`, `concrete-wa.com`, `exploretekoa.com` and `forkswa.com` each
produced a whole batch from one fetch, versus roughly two searches per lead
when guessing at business names.

One caveat learned the hard way: a directory that shows no website field for
**any** member proves nothing. That was true of the Colville Chamber, so the
read on Arden Second Hand rests on independent searches instead.

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

- Are the earlier 25 repos live, pitched, or just drafts? Nothing records it.
- **73 leads is more than one person can work.** No prioritisation beyond the
  "call these first" table exists. Worth deciding whether to work a region at a
  time (travel and referrals compound locally) or cherry-pick the strongest
  stories statewide.
- Pricing — nothing has been discussed anywhere. Several leads are clearly
  bigger than a one-pager and must not be quoted like one: Tuckaway (dealer
  mall, needs booth pages), River Time Brewing (changing taplist), The Nail
  Nook (per-artist booking), Colfax Body Repair (24-hour towing implies
  urgency-driven design).
- No photos exist for any draft. Every site has empty `img/` placeholders. For
  the inventory-driven leads — gift shops, antique malls, vintage and thrift —
  a site without photographs is weak. Decide whether photos come from the owner
  or a shoot, and price that in.
- Several leads are geographically remote from South King County (Republic,
  Metaline Falls, Pomeroy, Forks). Worth deciding whether these are phone/email
  pitches or not worth the drive.
