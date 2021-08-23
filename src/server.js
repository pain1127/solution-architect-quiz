#!/usr/bin/env node

/**
 * Module dependencies.
 */

 const app = require('./app');
 const config = require(`./config/common`);
 const debug = require('debug')('solution-architect-quiz:server');
 const http = require('http');
 
 /**
 * Get port from environment and store in Express.
 */
 
 const port = normalizePort(process.env.PORT || config.port);
 app.set('port', port);
 
 /**
  * Create HTTP server.
 */
 
 const server = http.createServer(app);
 
 /**
 * Listen on provided port, on all network interfaces.
 */
 
 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);
 
 /**
 * Normalize a port into a number, string, or false.
 * @param {string} val value
 * @return {boolean} result
 */
 function normalizePort(val) {
   const port = parseInt(val, 10);
 
   if (isNaN(port)) {
     // named pipe
     return val;
   }
 
   if (port >= 0) {
     // port number
     return port;
   }
 
   return false;
 }
 
 /**
 * Normalize a port into a number, string, or false.
 * @param {string} error string
 */
 function onError(error) {
   if (error.syscall !== 'listen') {
     throw error;
   }
 
   const bind = typeof port === 'string' ?
         'Pipe ' + port :
         'Port ' + port;
 
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
 * Event listener for HTTP server "listening" event.
 */
 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string' ?
         'pipe ' + addr :
         'port ' + addr.port;
   debug('Listening on ' + bind);
 }
 