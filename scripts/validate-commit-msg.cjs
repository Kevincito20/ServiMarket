/**
 * Validate commit messages against Conventional Commits for security compliance.
 */
const fs = require('node:fs');

const filePath = process.argv[2];

if (!filePath) {
  console.error('Commit message file path is required.');
  process.exit(1);
}

const message = fs.readFileSync(filePath, 'utf8').trim();
const pattern = /^(feat|fix|chore|docs|refactor|test|ci|security)(\([\w\-]+\))?: .+/;

if (!pattern.test(message)) {
  console.error(
    'Invalid commit message. Use Conventional Commits: feat|fix|chore|docs|refactor|test|ci|security(scope): description',
  );
  process.exit(1);
}
