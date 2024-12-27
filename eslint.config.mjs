import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import * as importPlugin from 'eslint-plugin-import';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        ignores: [
            'dist/**/*.ts',
            'dist/**',
            "**/*.mjs",
            "eslint.config.mjs",
            "**/*.js"
        ],
        extends: [importPlugin.flatConfigs?.recommended],
        rules: {
            "import/extensions": ["error", "always"],
            "import/no-unresolved": ["off"]
        }
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);