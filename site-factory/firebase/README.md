# Firebase — only if a site needs a backend

**The generated sites do not use Firebase.** They are static HTML/CSS/JS with
zero external requests and deploy to GitHub Pages. Nothing here is wired in.

Reach for this only when a specific site needs something static hosting cannot
do. In practice that is one thing: **a booking or contact form.**

That is a real need for some of these leads — The Barbershop at Fairhaven is
appointment-only, so every booking currently costs the owner a phone call, and
Kim's Grooming books out far enough ahead that reviewers warn about it. A form
that captures a request is the highest-value feature either site could carry.

## The rule that matters

A booking form collects customer names, phone numbers and email addresses.
The starter rules most tutorials open with —

    allow read, write: if true;

— let anyone on the internet download every booking your client has ever
taken. That is a privacy breach involving your client's customers, caused by
your code, and it is the single most common way small Firebase projects leak.

`firestore.rules` here is built the other way round:

- the public may **create** a booking and nothing else
- only the signed-in owner may **read** them
- submitted customer details are immutable; the owner can only move `status`
  and add `ownerNotes`
- every field is length- and type-checked, so nobody can write a
  multi-megabyte document or inject fields your dashboard will later render
- `createdAt` must equal the server clock, so submissions cannot be backdated
- anything not explicitly matched is denied

Set the owner claim once, from a trusted environment — never from the browser,
and never from a field inside the document, since the client controls those:

    admin.auth().setCustomUserClaims(uid, { admin: true })

## Storage

Photos for these sites live in the git repo, so Storage is usually unnecessary.
Only enable it if the owner uploads photos through a dashboard. An unused
bucket with open rules is a liability — open buckets are actively scanned for.

## If you use it

    npm install -g firebase-tools
    firebase login
    firebase init            # in a copy of dist/<slug>/, with these rules
    firebase deploy

`firebase.json` sets long cache lifetimes on images and fonts, short ones on
CSS/JS, and adds `nosniff` and a referrer policy.

**Test the rules before shipping.** The emulator will catch a permissive rule
that production will not:

    firebase emulators:start --only firestore

## Choosing between hosting options

GitHub Pages is fine and free for a static site with no form, which is every
site in this repo today. Move a site to Firebase Hosting when it gains a form
or anything else needing a backend — not before.
