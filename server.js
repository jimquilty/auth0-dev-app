const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { join } = require("path");
const morgan = require("morgan");
const axios = require("axios").default;
const request = require("request");
const app = express();
const authConfig = require("./auth_config.json");
const { token } = require("morgan");
var bodyParser = require("body-parser");

app.use(morgan("dev"));
// Serve static assets from the /public folder
app.use(express.static(join(__dirname, "public")));

// Jwt Middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"]
});

// Order History Function
function recHist(callback) {
  
  const options = { method: 'POST',
  url: 'https://dev-9obe8yjx.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: '{"client_id":"ydKZ55jgSiLCzPQiPoDTO6IgjA8OXk4v","client_secret":"A-loyk_cEbT_rJY4Eg45ywDPcW12tDIZRJt-SD22UhsnSNGhGAIzPwkOBCLdbzvm","audience":"https://dev-9obe8yjx.us.auth0.com/api/v2/","grant_type":"client_credentials"}' };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      result = JSON.parse(body);
      var resultToken = result.access_token
      return callback(resultToken);
    } else {
      return callback(null, error);;
    }
  });

};

// Order History Endpoint
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.post("/api/orderhistory", (req, res) => {
  
  const bodyData = req.body
  const user_id = bodyData.userid
  const order_time = bodyData.datetime
  const order_num = "Order_" + Math.floor(100000 + Math.random() * 900000)
  
  recHist(function(result){
    const options = { 
      method: 'PATCH',
      json: true,
      url: 'https://dev-9obe8yjx.us.auth0.com/api/v2/users/' + user_id,
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': 'Bearer ' + result
      },
      body: {
        'app_metadata': {
            [order_num] : [order_time]
        }
      }
    }

    request(options, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
        res.send({
          msg: "recorded"
        })
      } else {
        console.log(error)
        res.send({
          msg: "error"
        })
      }
    });
  })
});

// API Endpoint
app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "success"
  });
});

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// Listen on port 3000
app.listen(3001, () => console.log("Application running on port 3001"));

// Error Handling
app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }

  next(err, req, res);
});

module.exports = app;