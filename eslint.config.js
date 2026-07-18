import antfu from '@antfu/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(antfu(
  { vue: true },
  {
    rules: {
      // Allow trailing space in comments, for possible JSDoc formattings
      'style/no-trailing-spaces': ['error', { ignoreComments: true }],
      // Relaxes inline statements a bit
      'style/max-statements-per-line': ['error', { max: 2 }],
      'no-console': 'off',
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'App', 'Register', '[id]', '[url]'],
        },
      ],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['/^icon-/'],
        },
      ],
      'unocss/order-attributify': 'off',
      'vue/no-static-inline-styles': 'off',
      'complexity': 'off',
      'max-params': 'off',
      '@typescript-eslint/complexity': 'off',
    },
  },
  // Allow trailing space for markdown formatting
  {
    files: ['**/*.md'],
    rules: {
      'style/no-trailing-spaces': 'off',
    },
  },
))
