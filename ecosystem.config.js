module.exports = {
  apps: [
    // -------------------------------------------------------------------------
    // FRONTEND APPLICATION (Next.js)
    // -------------------------------------------------------------------------
    {
      name: 'lms-client',
      cwd: '.', // Current directory (LMS-CLIENT-CODE)
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 'max', // Use all available CPU cores for best performance
      exec_mode: 'cluster', // Cluster mode for load balancing
      autorestart: true,
      watch: false, // Production should not watch files
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/client-error.log',
      out_file: './logs/client-out.log',
      merge_logs: true
    },

  
  ]
};
