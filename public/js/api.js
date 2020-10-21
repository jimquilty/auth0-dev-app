var webAuth = new auth0.WebAuth({
  clientID: 'UStnX1VrLOHTu0VXdcXN5EldM5nFLrbI',
  domain: 'dev-9obe8yjx.us.auth0.com',
  redirectUri: 'http://example.com',
  audience: `https://dev-9obe8yjx.us.auth0.com/api/v2/`,
  scope: 'read:current_user update:current_user_metadata',
  responseType: 'token id_token'
});
  
  // Call User API Function
  const userApi = async () => {
    try {
        // Authorize Auth0 Client
        webAuth.authorize({
            audience: 'https://pizza42.totallygeeked.com',
            scope: 'read:current_user update:current_user_metadata',
            responseType: 'token',
            redirectUri: 'http://localhost:3000'
        });

        webAuth.parseHash({ hash: window.location.hash }, function(err, authResult) {
          if (err) {
            return console.log(err);
          }
        
          webAuth.client.userInfo(authResult.accessToken, function(err, user) {
            // Now you have the user's information
          });
        })
        
    } catch (e) {
      console.error(e);
    }
  };