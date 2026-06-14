module.exports = {
  apps: [
    {
      name: 'apploye-backend',
      script: './backend/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'apploye-frontend',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 4173',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
