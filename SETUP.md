<!--/**
 * Security setup checklist for repository configuration.
 */-->

# ServiMarket Security Setup

## 1. Branch Protection Rules (branch: `desarrollo`)

Navigate to **Settings → Branches → Branch protection rules** and configure:

- Require a pull request before merging
- Require **1** approving review
- Dismiss stale reviews on new commits
- Require status checks to pass:
  - type-check
  - lint-security
  - dependency-audit
  - gitleaks-scan
  - semgrep-sast
- Require branches to be up to date before merging
- Block force pushes
- Block deletions

## 2. GitHub Secrets (Settings → Secrets and variables → Actions)

Add the following secrets:

- `SNYK_TOKEN`
- `SENTRY_DSN`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLAUDE_API_KEY`
- `RAILWAY_TOKEN`
- `ALLOWED_ORIGINS`

## 3. Enable Security Features (Security tab)

Enable:

- Dependabot alerts
- Dependabot security updates
- Secret scanning (push protection)
- CodeQL analysis

## Paid Feature Note

GitHub **required reviewers for environments** may require a paid plan for private repositories.
If unavailable, use a CODEOWNERS-based review requirement plus branch protections to enforce
manual approvals before deployment.
