/*
  Helper functions for various tasks
*/
// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
// Object to keep all of the funcitons
let helpers = {};

// Parse a string to an object without throwing an error
helpers.parseJsonToObject = (str) => {
  try{
    const obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
};

// hash a password to sha256
helpers.hashPassword = (str) => {
  return typeof(str) == 'string' && str.length > 0 ? crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex') : false;
}

// Create a random string of requested size
helpers.createRandomString = (num) => {
  num = typeof(num) == 'number' && num > 0 ? num : false;
  if(num){
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let buffer = '';
    for(let i = 0; i<num; i++){
      buffer += chars[Math.floor(Math.random()*chars.length)];
    }
    return buffer;
  }else{
    return false;
  }
}

// Charge to an account using Stripe
helpers.stripe = function(email, amount,currency,description,source,callback){
  // Configure the request payload
  var payload = {
    'amount' : amount,
    'currency' : currency,
    'description' : description,
    'source' : source,
  }

  // Stringify the payload
  var stringPayload = querystring.stringify(payload);

  // Configure the request details
  var requestDetails = {
    'protocol' : 'https:',
    'hostname' : 'api.stripe.com',
    'method' : 'POST',
    'auth' : config.stripe.secretKey,
    'path' : '/v1/charges',
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' : Buffer.byteLength(stringPayload)
    }
}
// Instantiate the request object
  var req = https.request(requestDetails,function(res){
    // Grab the status of the sent request
    var status = res.statusCode;
    // Callback successfully if the request went through
    if(status==200 || status==201){
      callback(false);
    } else {
      callback('Status code return was '+status);
    }
  });

  // Bind to the error event so it doesn't get the thrown
  req.on('error',function(e){
    callback(e);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
}

// Send confirmation email using MailGun
// Send the email by mailgun API
helpers.mailgun = function(to, text,callback){
  // Configure the request payload
  const payload = {
    'from' : config.mailgun.sender,
    'to' : to,
    'subject' : 'Order confirmation',
    'text' : text
  }

  // Stringify the payload
  const stringPayload = querystring.stringify(payload);

  // Configure the request details
  const requestDetails = {
    'protocol' : 'https:',
    'hostname' : 'api.mailgun.net',
    'method' : 'POST',
    'auth' : config.mailgun.apiKey,
    'path' : '/v3/'+config.mailgun.domainName,
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' : Buffer.byteLength(stringPayload)
    }
  }

  // Instantiate the request object
  const req = https.request(requestDetails,function(res){
    // Grab the status of the sent request
    const status = res.statusCode;
    // Callback successfully if the request went through
    if(status==200 || status==201){
      callback(false);
    } else {
      callback('Status code return was '+status);
    }
  });

  // Bind to the error event so it doesn't get the thrown
  req.on('error',function(e){
    callback(e);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
}


// Export the module
module.exports = helpers;
