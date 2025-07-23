module.exports = {
  apps: [
    {
      name: 'wrpa-web',
      script: '.output/server/index.mjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        NUXT_RPA_AUTH_API_URL: 'http://woori-rpa-master:9991',
        NUXT_RPA_API_URL: 'http://woori-auth:9998',
        NUXT_PUBLIC_APP_NAME: 'WRPA-Web',
      },
    },
  ],
}
