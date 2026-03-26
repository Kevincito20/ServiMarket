/**
 * Security-focused lint-staged configuration for staged checks.
 */
const runTypeCheck = (files) => {
  if (!files.length) {
    return [];
  }

  return 'tsc --noEmit --pretty false --incremental false';
};

module.exports = {
  '*.{ts,tsx}': ['eslint --max-warnings 0 --no-warn-ignored', 'prettier --write', runTypeCheck],
  '*.{md,json,yml,yaml}': ['prettier --write'],
};
