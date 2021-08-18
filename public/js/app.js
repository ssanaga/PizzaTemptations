// The Auth0 client, initialized in configureClient()
let auth0 = null;
//var axios = require("axios").default;

/**
 * Starts the authentication flow
 */
const login = async (targetUrl) => {
  try {
    console.log("Logging in", targetUrl);

    const options = {
      redirect_uri: window.location.origin
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Executes the logout flow
 */
const logout = () => {
  try {
    console.log("Logging out");
    auth0.logout({
      returnTo: window.location.origin
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/**
 * Retrieves the auth configuration from the server
 */
const fetchAuthConfig = () => fetch("/auth_config.json");

/**
 * Initializes the Auth0 client
 */
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId,
    audience: config.audience
  });
};

/**
 * Checks to see if the user is authenticated. If so, `fn` is executed. Otherwise, the user
 * is prompted to log in
 * @param {*} fn The function to execute if the user is logged in
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

/**
 * Calls the API endpoint with an authorization token
 * 1. Its calling the external API to verify if the token issued for the correct audience
 * 2. 
 */
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
    console.log("Call API Response",responseData);


 
    responseElement.innerText = JSON.stringify(responseData, {}, 2);
    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
    eachElement(".result-block", (c) => c.classList.add("show"));

  } catch (e) {
    console.error("Error returned from API");
    hideCreateOrder = true;
    hideOrderHistory = true;
    document.getElementById("content-create-order").style.display="none";
  }
};


const callSetUserMetaData = async () => {
  try {
    const token = await auth0.getTokenSilently();
   

    //Making another call to the server to set the usermetadata variable
    //Instead of this, we can improve this when we move the form post call on create Order from index html to app js into a method
    //At that time, in app client - we can first make the getUserMetadata call wait for it, then make the user history update call
     const response1 = await fetch("/api/prepareOrderHistory", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const responseData1 = await response1.json();
    console.log("User metadata set on the server",responseData1);

    const responseElement = document.getElementById("api-call-usermetadata-result");
    
    responseElement.innerText = JSON.stringify(responseData1, {}, 2);
    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
    eachElement(".result-block", (c) => c.classList.add("show"));

  } catch (e) {
    console.error(e);
  }
};


 const getUserInfo = async (token) => {
  try {
   console.log("Step 2 ----> Fetchcing the user info: ");
   const response = await fetch("https://dev-lyqevnst.us.auth0.com/userinfo",{
    method: 'GET',
    headers: {
      'authorization': `Bearer ${token}`, 
      'content-type': 'application/json'
      }
    });

    const responseData = await response.json();
    console.log("Fetching user info Response",responseData.sub);
    return responseData.sub;
    } catch (e) {
    console.error(e);
  }
};

const readUserMetaData = async (auth0UserId) =>{
   
   try {
   console.log("Inside read metadata");
   
   
   var mgtToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im9NS24yVlVidUdGZ1BwQ0NlMlJEciJ9.eyJpc3MiOiJodHRwczovL2Rldi1seXFldm5zdC51cy5hdXRoMC5jb20vIiwic3ViIjoib2NNOUVpRU1sS0ZaUGN0VlVHdElWYllsbXBSNmY1c0NAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LWx5cWV2bnN0LnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjI5MDUwMzc5LCJleHAiOjE2Mjk5MTQzNzksImF6cCI6Im9jTTlFaUVNbEtGWlBjdFZVR3RJVmJZbG1wUjZmNXNDIiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.VsFpTBNkWBYruxoVlkZWesV92iEFK-lyYphG9210UyuBKcGCYnd1c4Rj1J3OVQPd-rRPb2soZDlTlF8gZJCmMaM7V4-rzwv4605AGt-PGIbOvAXVTixa1Z9VE_0fRQF8EKb6X08lpzFV4WhRRr1b6BbpkBSQVPu7LPfJR8y1sTDDuFTCe1KcIK8j2N_C3P6Pq32lSLp0YLG7soM5MN2Ps-TA7fXqR2tcrsoTEhjJoBfxh67S-PUi-PxOSq2FnXMmS9xNqyXVd2epkzfwugSdJyFipADHbdi4xdRZCZhi70mYWm9fhJEUprcZD5lCrBawZve4BijwBISC4oIk4SWlPg";
   const response = await fetch(`https://dev-lyqevnst.us.auth0.com/api/v2/users/`.concat(auth0UserId),{
        method: 'GET',
        headers: {authorization: mgtToken, 'content-type': 'application/json'},
       });

    const responseData = await response.json();
    console.log("Fetching user metadata Response",responseData.user_metadata);
    return responseData.user_metadata.orders;
    } catch (e) {
    console.error(e);
  }

};

/**
 * Calls the API endpoint with an authorization token to get the order history
 */
 
const callOrderHistory = async () => {
  try {
    const token = await auth0.getTokenSilently();

    var userId = await getUserInfo(token);
    console.log("Printing userid in callOrderHistory",userId);

    var metadata = await readUserMetaData(userId);
    console.log("Order History:",metadata);
    const responseElement = document.getElementById("call-order-history-result");
    responseElement.innerText = JSON.stringify(metadata, {}, 2);
    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
    eachElement(".result-block", (c) => c.classList.add("show"));
  } catch (e) {
    console.error(e);
  }
};



  // Reason i'm not using this method is -- i dont know how to fetch the button form click from the index to this method and send to server
  // So using the index html to directly send to server
 const callCreateOrder = async () => {
  try {
    const token = await auth0.getTokenSilently();
    console.log(">Inside create order call");

    var userId = await getUserInfo(token);
    console.log("Printing userid ",userId);

    const response = await fetch("/api/createOrder", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        userId : `userid: ${userId}`
      },
      body: JSON.stringify({
        userId : `userid: ${userId}`

      })
     });

    const responseData = await response.json();
    const responseElement = document.getElementById("call-create-order-result");
    responseElement.innerText = JSON.stringify(responseData, {}, 2);
    //responseElement.innerText = JSON.stringify(responseData);

    document.querySelectorAll("pre code").forEach(hljs.highlightBlock);
    eachElement(".result-block", (c) => c.classList.add("show"));

   } catch (e) {
    console.error(e);
  }
};


// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL
  if (!showContentFromUrl(window.location.pathname)) {
    showContentFromUrl("/");
    window.history.replaceState({ url: "/" }, {}, "/");
  }

  const bodyElement = document.getElementsByTagName("body")[0];

  // Listen out for clicks on any hyperlink that navigates to a #/ URL
  bodyElement.addEventListener("click", (e) => {
    if (isRouteLink(e.target)) {
      const url = e.target.getAttribute("href");

      if (showContentFromUrl(url)) {
        e.preventDefault();
        window.history.pushState({ url }, {}, url);
      }
    } else if (e.target.getAttribute("id") === "call-api") {
      e.preventDefault();
      callApi();
    }

    //Sowmya - adding this snippet
    else if (e.target.getAttribute("id") === "call-create-order") {
      e.preventDefault();
      callCreateOrder();
    }

    else if (e.target.getAttribute("id") === "call-order-history") {
      e.preventDefault();
      callOrderHistory();
    }

     else if (e.target.getAttribute("id") === "call-set-usermetadata") {
      e.preventDefault();
      callSetUserMetaData();
    }
    //Sowmya - Closing this snippet
  });

  const isAuthenticated = await auth0.isAuthenticated();

  if (isAuthenticated) {
    console.log("> User is authenticated");
    window.history.replaceState({}, document.title, window.location.pathname);
    updateUI();
    return;
  }

  console.log("> User not authenticated");

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    console.log("> Parsing redirect");
    try {
      const result = await auth0.handleRedirectCallback();

      if (result.appState && result.appState.targetUrl) {
        showContentFromUrl(result.appState.targetUrl);
      }

      console.log("Logged in!");
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }

  updateUI();
};
