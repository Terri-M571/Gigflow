/**
 * GigFlow Main Entry Point
 * 
 * NOTE: Render may be configured to run \
ode server.js\ instead of \
pm start\.
 * To ensure the correct server runs regardless of configuration, this file
 * proxies directly to the real backend server.
 */

process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION:', reason);
});

try {
    require('./backend/server.js');
} catch (error) {
    console.error('FAILED TO START BACKEND SERVER:', error);
    process.exit(1);
}
