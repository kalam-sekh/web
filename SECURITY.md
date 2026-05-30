If you ever exposed database credentials or other secrets in this repository, follow these steps immediately.

1) Rotate the secret
- In your database provider (Railway), rotate or reset the DB password/connection string.
- Update the `DATABASE_URL` in Railway Project Variables with the new value.

2) Remove secrets from git history (if they were committed)
- Preferred: `git-filter-repo` (faster and safer)
  - See https://github.com/newren/git-filter-repo
- Example (replace <secret> with exact leaked text):

```bash
git clone --mirror https://github.com/youruser/yourrepo.git repo-mirror.git
cd repo-mirror.git
printf '%s==>%s\n' 'LEAKED_SECRET' '[REDACTED]' > replacements.txt
git filter-repo --replace-text replacements.txt
git push --force
```

- After rewriting history, ask all collaborators to re-clone the repo.

3) Remove backend files from public branches
- Keep backend code in a private repo or a private GitHub repo. For GitHub Pages, publish only static site files (use `gh-pages` branch).

4) Verify
- Search repository for `postgresql://` and other secrets:
  - macOS / Linux: `grep -R --line-number -E "postgresql://|your-secret-pattern" .`
  - PowerShell: `Get-ChildItem -Recurse -File | Select-String -Pattern 'postgresql://|your-secret-pattern'`

If you want, I can produce the exact filter-repo commands for your repository and help create the clean `gh-pages` branch.
