module.exports = {
  apps: [
    {
      name: 'sobha-proxy',
      script: './src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3030,
      },
      error_file: './src/logs/pm2-error.log',
      out_file: './src/logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};