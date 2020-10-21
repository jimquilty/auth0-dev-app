const express = require("express");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const { join } = require("path");
const morgan = require("morgan");
const app = express();
const authConfig = require("./auth_config.json");

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

// API Endpoint
app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!"
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
app.listen(3000, () => console.log("Application running on port 3000"));

// Error Handling
app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }

  next(err, req, res);
});

module.exports = app;