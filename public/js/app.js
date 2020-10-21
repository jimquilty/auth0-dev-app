let auth0 = null;

// Login Button Function
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl)
    await auth0.loginWithRedirect({
      redirect_uri: window.location.origin
    });
  } catch (err) {
    console.log("Log in failed", err);
  }
};

// Logout Button Function
const logout = async () => {
  try {
    console.log("Logging out");
    auth0.logout({
      returnTo: window.location.origin
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

// Get App Auth Configuration
const fetchAuthConfig = () => fetch("/auth_config.json")

// Initialize Auth0 Client
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    audience: config.audience
  });
};

// Call API Function
const callApi = async () => {
  try {
    const token = await auth0.getTokenSilently();

    const response = await fetch("/api/external", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const responseData = await response.json();

    const responseElement = document.getElementById("api-call-result");

    responseElement.innerText = JSON.stringify(responseData, {}, 2);
  } catch (e) {
    console.error(e);
  }
};

window.onload = async () => {
  await configureClient();

  updateUI();

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    return;
  }

  // Redirect after successful authentication
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.handleRedirectCallback();

    updateUI();

    window.history.replaceState({}, document.title, "/");
  }

};

const updateUI = async () => {
  try {
    const isAuthenticated = await auth0.isAuthenticated();

    // Show appropriate buttons depending on authentication status
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
    document.getElementById("btn-call-api").disabled = !isAuthenticated;

    // Show content only to logged in Users
    if (isAuthenticated) {
      document.getElementById("gated-content").classList.remove("hidden");

      document.getElementById(
        "ipt-access-token"
      ).innerHTML = await auth0.getTokenSilently();

      document.getElementById("ipt-user-profile").textContent = JSON.stringify(
        await auth0.getUser()
      );
    } else {
      document.getElementById("gated-content").classList.add("hidden");
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }
};
