import eslint from '@eslint/js';
import pluginBan from 'eslint-plugin-ban';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ['**/*.ts'],
    ignores: ['eslint.config.mjs'],
    plugins: {
        ban: pluginBan,
    },
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        ...tseslint.configs.stylistic,
        eslintPluginPrettierRecommended,
    ],
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jest,
        },
        sourceType: 'commonjs',
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
        },
    },
    rules: {
        '@typescript-eslint/no-floating-promises': 'off',
        'ban/ban': [
            2,
            { name: 'fdescribe', message: 'Focussing test suites is not allowed' },
            { name: 'fit', message: 'Focussing a single unit test is not allowed' },
        ],
    },
});
