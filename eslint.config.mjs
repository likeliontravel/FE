import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import tsParser from '@typescript-eslint/parser';

const compat = new FlatCompat();

export default [
  js.configs.recommended,
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:prettier/recommended'
  ),
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'lf' }],
      semi: ['error', 'always'],
      quotes: ['error', 'double'],
      indent: ['error', 2],
      'no-unused-vars': ['warn'],
      'no-console': ['warn'],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': ['warn'],
    },
  },
];
