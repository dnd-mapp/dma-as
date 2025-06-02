import nx from '@nx/eslint-plugin';
import pluginBan from 'eslint-plugin-ban';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['**/dist'],
    },
    {
        files: ['**/*.ts', '**/*.js'],
        plugins: {
            ban: pluginBan,
        },
        extends: [...nx.configs['flat/base'], ...nx.configs['flat/typescript'], ...nx.configs['flat/javascript']],
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
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint\\.config\\.mjs$'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*']
                        }
                    ]
                }
            ],
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'ban/ban': [
                2,
                { name: 'fdescribe', message: 'Focussing test suites is not allowed' },
                { name: 'fit', message: 'Focussing a single unit test is not allowed' },
            ],
        },
    }
);
