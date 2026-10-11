import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['js/data.js', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.browser, PS: 'writable' } },
    rules: { 'no-unused-vars': ['warn', { args: 'none' }] }
  },
  {
    files: ['sw.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.serviceworker } }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { sourceType: 'module', globals: { ...globals.node } }
  }
];
