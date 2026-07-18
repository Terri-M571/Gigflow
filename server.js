/**
 * GigFlow Main Entry Point
 * 
 * NOTE: Render may be configured to run \
ode server.js\ instead of \
pm start\.
 * To ensure the correct server runs regardless of configuration, this file
 * proxies directly to the real backend server.
 */

require('./backend/server.js');
