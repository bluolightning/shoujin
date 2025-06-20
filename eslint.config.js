import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']},
    {languageOptions: {globals: globals.browser}},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        files: ['**/*.{jsx,tsx}'],
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'no-unused-vars': 'warn',
        },
    },
    {
        // Prevent 'unexpected any' errors in manually added  Mantine files
        files: ['src/components/MantineComponents/**/*.{js,ts,jsx,tsx}'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
];
