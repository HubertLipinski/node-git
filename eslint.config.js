import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          tabWidth: 2,
          semi: false,
          bracketSpacing: true,
          printWidth: 120,
          trailingComma: 'all',
          singleQuote: true,
        },
      ],
    },
  },
  {
    ignores: ['dist/**/*'],
  },
]
