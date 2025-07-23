module.exports = {
  apps: [
    {
      name: 'wrpa-web',
      script: '.output/server/index.mjs',
      cwd: '/app',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
