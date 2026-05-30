#!/usr/bin/env bash
# Create a clean gh-pages branch with only the static site files and push it.
# Usage: ./scripts/publish-gh-pages.sh origin gh-pages

set -euo pipefail

REMOTE=${1:-origin}
BRANCH=${2:-gh-pages}

ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

echo "Creating orphan branch $BRANCH from static site files..."

# Files and folders to include on the published site. Adjust as needed.
INCLUDE=(
  index.html
  CNAME
  favicon.png
  css
  js
  img
  styles.css
  style.css
  README.md
)

# Create orphan branch
git checkout --orphan "$BRANCH"
git reset --hard

for path in "${INCLUDE[@]}"; do
  if git ls-files --error-unmatch "$path" >/dev/null 2>&1; then
    git checkout main -- "$path"
  elif [ -e "$path" ]; then
    git add "$path"
  fi
done

git add -A
git commit -m "Publish site to $BRANCH"
git push -u "$REMOTE" "$BRANCH" --force

git checkout -
echo "Published to $BRANCH on $REMOTE"
