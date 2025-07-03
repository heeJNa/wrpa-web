import pluginVue from 'eslint-plugin-vue'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(eslintPluginPrettierRecommended, pluginVue, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'never', // <br>은 허용
          normal: 'never', // <li />, <div /> 등을 막음
          component: 'always', // <MyComponent />는 허용
        },
        svg: 'always',
        math: 'always',
      },
    ],
  },
})
