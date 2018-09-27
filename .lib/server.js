/*
  All of the server logic for starting the server and receiving data
*/

// Dependencied
const StringDecoder=require('string_decoder').StringDecoder;
const      handlers=require('./handlers'    );
const       helpers=require('./helpers'     );
const        config=require('./config'      );
const         https=require('https'         );
const          http=require('http'          );
const          path=require('path'          );
const           url=require('url'           );
const            fs=require('fs'            );
// Create an object to store the servers
let server = {}

// Create a http server
server.httpServer = http.createServer((req, res)=>{
  server.unifiedServer(req, res);
});

// Define the https server options
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// Create a https server
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res)=>{
  server.unifiedServer(req, res);
});

// Create a unified server that handles both http and https logic
server.unifiedServer = (req, res) => {
  // Parse the url
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const pathname = parsedUrl.pathname;
  const trimmedPath = pathname.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', data => {
    buffer += decoder.write(data)
  });
  req.on('end', ()=>{
    buffer += decoder.end();

    // Check the router for a matching path for a handler. If one is not found, direct to the handlers.notFound function
    let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      'trimmedPath'      : trimmedPath,
      'queryStringObject': queryStringObject,
      'method'           : method,
      'headers'          : headers,
      'payload'          : helpers.parseJsonToObject(buffer)
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, (statusCode, payload)=>{
      // Use the statusCode returned from the handler, or default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // parse payload object to string
      const payloadString = JSON.stringify(payload);

      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};


// Define a router
server.router = {
  'ping'  : handlers.ping,
  'users' : handlers.users,
  'tokens': handlers.tokens,
  'menu'  : handlers.menu
}

// Init script
server.init = () => {
  // Start the http server listening on port 5000
  server.httpServer.listen(config.httpPort, ()=>{
    console.log(`we are listening on port ${config.httpPort}`)
  });

  // Start the https server listening on port 5001
  server.httpsServer.listen(config.httpsPort, ()=>{
    console.log(`we are listening on port ${config.httpsPort}`);
  })
}

// Export the module
module.exports = server;
