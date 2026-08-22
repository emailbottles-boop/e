#!/usr/bin/env bash
#
# Build every site in businesses.json and publish each one to its own GitHub
# repository.
#
# Dry run (default — prints the plan, touches nothing):
#     ./deploy-all.sh
#
# For real:
#     ./deploy-all.sh --yes
#
# Options:
#     --yes            actually create repos and push (otherwise dry run)
#     --public         create public repos (default: private)
#     --pages          try to turn on GitHub Pages for each repo
#     --force          publish even if scripts/check.js still flags placeholders
#     --only <slug>    just this one (repeatable)
#
# Safe to re-run: a repo that already exists is updated, not recreated.

set -euo pipefail

cd "$(dirname "$0")"

APPLY=0
VISIBILITY="--private"
PAGES=0
FORCE=0
ONLY=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes|-y)   APPLY=1 ;;
    --public)   VISIBILITY="--public" ;;
    --pages)    PAGES=1 ;;
    --force)    FORCE=1 ;;
    --only)     ONLY+=("$2"); shift ;;
    -h|--help)  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

# ---------------------------------------------------------------- preflight
for cmd in node git gh; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Missing required command: $cmd" >&2; exit 1; }
done

gh auth status >/dev/null 2>&1 || {
  echo "GitHub CLI is not authenticated. Run:  gh auth login" >&2
  exit 1
}

OWNER="$(gh api user --jq .login)"
echo "GitHub account: $OWNER"
echo

# ------------------------------------------------------------------- gating
if [[ $FORCE -eq 0 ]]; then
  if ! node scripts/check.js --strict >/dev/null 2>&1; then
    echo "Some entries still contain placeholder text or blank contact details."
    echo "Run  node scripts/check.js  to see what is missing."
    echo
    echo "Nothing here should reach a business owner with 'REPLACE:' still in it."
    echo "Once the details are confirmed, re-run. To publish anyway (drafts to a"
    echo "private repo, for your eyes only), add --force."
    exit 1
  fi
fi

# -------------------------------------------------------------------- build
echo "Building sites..."
if [[ ${#ONLY[@]} -gt 0 ]]; then
  node build.js "${ONLY[@]}"
  SLUGS=("${ONLY[@]}")
else
  node build.js
  mapfile -t SLUGS < <(node build.js --list)
fi
echo

if [[ $APPLY -eq 0 ]]; then
  echo "=============================================================="
  echo " DRY RUN — nothing was created or pushed."
  echo "=============================================================="
  echo
  echo "Would publish ${#SLUGS[@]} repo(s) to $OWNER (${VISIBILITY#--}):"
  for s in "${SLUGS[@]}"; do
    if gh repo view "$OWNER/$s" >/dev/null 2>&1; then
      echo "  update  $OWNER/$s"
    else
      echo "  create  $OWNER/$s"
    fi
  done
  echo
  echo "Re-run with --yes to go ahead."
  exit 0
fi

# ------------------------------------------------------------------ publish
created=0; updated=0; failed=0

for slug in "${SLUGS[@]}"; do
  dir="dist/$slug"
  [[ -d "$dir" ]] || { echo "!! $slug — no build output, skipping"; failed=$((failed+1)); continue; }

  echo "-- $slug"
  (
    cd "$dir"
    git init -q -b main 2>/dev/null || git init -q
    git add -A
    git -c user.email="${GIT_AUTHOR_EMAIL:-$(git config user.email || echo noreply@example.com)}" \
        -c user.name="${GIT_AUTHOR_NAME:-$(git config user.name || echo "$OWNER")}" \
        commit -q -m "Build $slug site" || true

    if gh repo view "$OWNER/$slug" >/dev/null 2>&1; then
      git remote remove origin 2>/dev/null || true
      git remote add origin "https://github.com/$OWNER/$slug.git"
      git push -u origin main --force-with-lease 2>/dev/null \
        || git push -u origin main --force
      echo "   updated  https://github.com/$OWNER/$slug"
    else
      gh repo create "$OWNER/$slug" $VISIBILITY --source=. --remote=origin --push
      echo "   created  https://github.com/$OWNER/$slug"
    fi

    if [[ $PAGES -eq 1 ]]; then
      gh api -X POST "repos/$OWNER/$slug/pages" \
        -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 \
        && echo "   pages    https://$OWNER.github.io/$slug/" \
        || echo "   pages    not enabled (already on, or not available for this repo)"
    fi
  ) && {
    if gh repo view "$OWNER/$slug" >/dev/null 2>&1; then updated=$((updated+1)); else created=$((created+1)); fi
  } || { echo "   FAILED"; failed=$((failed+1)); }
done

echo
echo "=============================================================="
printf " done — %d published, %d failed\n" "$((created+updated))" "$failed"
echo "=============================================================="
