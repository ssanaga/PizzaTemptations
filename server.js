const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require("jwks-rsa");
const { join } = require("path");
const authConfig = require("./auth_config.json");
var axios = require("axios").default;
const bodyParser = require('body-parser');
const cors = require('cors');

//Variable declaration
//let clientAuth = null;
//let UpdateUserInfoUrl = null;

const app = express();

// Below 2 lines are very important to parse the input form
// add router in express app
/*app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cors());

if (!authConfig.domain || !authConfig.audience) {
  throw "Please make sure that auth_config.json is in place and populated";
}

app.use(morgan("dev"));
app.use(helmet());
app.use(express.static(join(__dirname, "public")));

var mgtToken = "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im9NS24yVlVidUdGZ1BwQ0NlMlJEciJ9.eyJpc3MiOiJodHRwczovL2Rldi1seXFldm5zdC51cy5hdXRoMC5jb20vIiwic3ViIjoib2NNOUVpRU1sS0ZaUGN0VlVHdElWYllsbXBSNmY1c0NAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vZGV2LWx5cWV2bnN0LnVzLmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjI5MDUwMzc5LCJleHAiOjE2Mjk5MTQzNzksImF6cCI6Im9jTTlFaUVNbEtGWlBjdFZVR3RJVmJZbG1wUjZmNXNDIiwic2NvcGUiOiJyZWFkOmNsaWVudF9ncmFudHMgY3JlYXRlOmNsaWVudF9ncmFudHMgZGVsZXRlOmNsaWVudF9ncmFudHMgdXBkYXRlOmNsaWVudF9ncmFudHMgcmVhZDp1c2VycyB1cGRhdGU6dXNlcnMgZGVsZXRlOnVzZXJzIGNyZWF0ZTp1c2VycyByZWFkOnVzZXJzX2FwcF9tZXRhZGF0YSB1cGRhdGU6dXNlcnNfYXBwX21ldGFkYXRhIGRlbGV0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgY3JlYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSByZWFkOnVzZXJfY3VzdG9tX2Jsb2NrcyBjcmVhdGU6dXNlcl9jdXN0b21fYmxvY2tzIGRlbGV0ZTp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfdGlja2V0cyByZWFkOmNsaWVudHMgdXBkYXRlOmNsaWVudHMgZGVsZXRlOmNsaWVudHMgY3JlYXRlOmNsaWVudHMgcmVhZDpjbGllbnRfa2V5cyB1cGRhdGU6Y2xpZW50X2tleXMgZGVsZXRlOmNsaWVudF9rZXlzIGNyZWF0ZTpjbGllbnRfa2V5cyByZWFkOmNvbm5lY3Rpb25zIHVwZGF0ZTpjb25uZWN0aW9ucyBkZWxldGU6Y29ubmVjdGlvbnMgY3JlYXRlOmNvbm5lY3Rpb25zIHJlYWQ6cmVzb3VyY2Vfc2VydmVycyB1cGRhdGU6cmVzb3VyY2Vfc2VydmVycyBkZWxldGU6cmVzb3VyY2Vfc2VydmVycyBjcmVhdGU6cmVzb3VyY2Vfc2VydmVycyByZWFkOmRldmljZV9jcmVkZW50aWFscyB1cGRhdGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpkZXZpY2VfY3JlZGVudGlhbHMgY3JlYXRlOmRldmljZV9jcmVkZW50aWFscyByZWFkOnJ1bGVzIHVwZGF0ZTpydWxlcyBkZWxldGU6cnVsZXMgY3JlYXRlOnJ1bGVzIHJlYWQ6cnVsZXNfY29uZmlncyB1cGRhdGU6cnVsZXNfY29uZmlncyBkZWxldGU6cnVsZXNfY29uZmlncyByZWFkOmhvb2tzIHVwZGF0ZTpob29rcyBkZWxldGU6aG9va3MgY3JlYXRlOmhvb2tzIHJlYWQ6YWN0aW9ucyB1cGRhdGU6YWN0aW9ucyBkZWxldGU6YWN0aW9ucyBjcmVhdGU6YWN0aW9ucyByZWFkOmVtYWlsX3Byb3ZpZGVyIHVwZGF0ZTplbWFpbF9wcm92aWRlciBkZWxldGU6ZW1haWxfcHJvdmlkZXIgY3JlYXRlOmVtYWlsX3Byb3ZpZGVyIGJsYWNrbGlzdDp0b2tlbnMgcmVhZDpzdGF0cyByZWFkOmluc2lnaHRzIHJlYWQ6dGVuYW50X3NldHRpbmdzIHVwZGF0ZTp0ZW5hbnRfc2V0dGluZ3MgcmVhZDpsb2dzIHJlYWQ6bG9nc191c2VycyByZWFkOnNoaWVsZHMgY3JlYXRlOnNoaWVsZHMgdXBkYXRlOnNoaWVsZHMgZGVsZXRlOnNoaWVsZHMgcmVhZDphbm9tYWx5X2Jsb2NrcyBkZWxldGU6YW5vbWFseV9ibG9ja3MgdXBkYXRlOnRyaWdnZXJzIHJlYWQ6dHJpZ2dlcnMgcmVhZDpncmFudHMgZGVsZXRlOmdyYW50cyByZWFkOmd1YXJkaWFuX2ZhY3RvcnMgdXBkYXRlOmd1YXJkaWFuX2ZhY3RvcnMgcmVhZDpndWFyZGlhbl9lbnJvbGxtZW50cyBkZWxldGU6Z3VhcmRpYW5fZW5yb2xsbWVudHMgY3JlYXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRfdGlja2V0cyByZWFkOnVzZXJfaWRwX3Rva2VucyBjcmVhdGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiBkZWxldGU6cGFzc3dvcmRzX2NoZWNraW5nX2pvYiByZWFkOmN1c3RvbV9kb21haW5zIGRlbGV0ZTpjdXN0b21fZG9tYWlucyBjcmVhdGU6Y3VzdG9tX2RvbWFpbnMgdXBkYXRlOmN1c3RvbV9kb21haW5zIHJlYWQ6ZW1haWxfdGVtcGxhdGVzIGNyZWF0ZTplbWFpbF90ZW1wbGF0ZXMgdXBkYXRlOmVtYWlsX3RlbXBsYXRlcyByZWFkOm1mYV9wb2xpY2llcyB1cGRhdGU6bWZhX3BvbGljaWVzIHJlYWQ6cm9sZXMgY3JlYXRlOnJvbGVzIGRlbGV0ZTpyb2xlcyB1cGRhdGU6cm9sZXMgcmVhZDpwcm9tcHRzIHVwZGF0ZTpwcm9tcHRzIHJlYWQ6YnJhbmRpbmcgdXBkYXRlOmJyYW5kaW5nIGRlbGV0ZTpicmFuZGluZyByZWFkOmxvZ19zdHJlYW1zIGNyZWF0ZTpsb2dfc3RyZWFtcyBkZWxldGU6bG9nX3N0cmVhbXMgdXBkYXRlOmxvZ19zdHJlYW1zIGNyZWF0ZTpzaWduaW5nX2tleXMgcmVhZDpzaWduaW5nX2tleXMgdXBkYXRlOnNpZ25pbmdfa2V5cyByZWFkOmxpbWl0cyB1cGRhdGU6bGltaXRzIGNyZWF0ZTpyb2xlX21lbWJlcnMgcmVhZDpyb2xlX21lbWJlcnMgZGVsZXRlOnJvbGVfbWVtYmVycyByZWFkOmVudGl0bGVtZW50cyByZWFkOmF0dGFja19wcm90ZWN0aW9uIHVwZGF0ZTphdHRhY2tfcHJvdGVjdGlvbiByZWFkOm9yZ2FuaXphdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJzIGNyZWF0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgcmVhZDpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgdXBkYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGNyZWF0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIHJlYWQ6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcl9yb2xlcyBjcmVhdGU6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIHJlYWQ6b3JnYW5pemF0aW9uX2ludml0YXRpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.VsFpTBNkWBYruxoVlkZWesV92iEFK-lyYphG9210UyuBKcGCYnd1c4Rj1J3OVQPd-rRPb2soZDlTlF8gZJCmMaM7V4-rzwv4605AGt-PGIbOvAXVTixa1Z9VE_0fRQF8EKb6X08lpzFV4WhRRr1b6BbpkBSQVPu7LPfJR8y1sTDDuFTCe1KcIK8j2N_C3P6Pq32lSLp0YLG7soM5MN2Ps-TA7fXqR2tcrsoTEhjJoBfxh67S-PUi-PxOSq2FnXMmS9xNqyXVd2epkzfwugSdJyFipADHbdi4xdRZCZhi70mYWm9fhJEUprcZD5lCrBawZve4BijwBISC4oIk4SWlPg";
  
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

//Sowmya - Declaration of variables
let auth0UserId = null;
var userMetaData = "";


 function getUserInfo (clientAuth) {
  try {
   console.log("Fetching the user info: ");
   var options = {
    method: 'GET',
    url: 'https://dev-lyqevnst.us.auth0.com/userinfo',
    headers: {'authorization': clientAuth, 'content-type': 'application/json'},
    };

    axios.request(options).then(function (response) {
      var userSub = response.data.sub;
      //console.log("User Response data:",response.data);
      console.log("User sub:",userSub);
      auth0UserId = userSub;
     
  })} catch (e) {
    console.error(e);
  }
};

//Reads the user metadata and sets the global variable
function readUserMetaData(){
   
       var options1 = {
        method: 'GET',
        url: `https://dev-lyqevnst.us.auth0.com/api/v2/users/${auth0UserId}`,
        headers: {authorization: mgtToken, 'content-type': 'application/json'},
       };

      axios.request(options1).then(function (response1) {
        console.log("Read user response :",response1.data.user_metadata.orders.order);
        //if(response1.data.user_metadata.orders != undefined){
          userMetaData = response1.data.user_metadata.orders.order;
       // }
      }).catch(function (error) {
        console.error("Read User Metadata:", error);
      });


}

const checkScopes = jwtAuthz([ 'create:orders' ]);
app.get("/api/external", checkJwt, checkScopes, (req, res) => {

  try{
 // app.get("/api/external", checkJwt,  (req, res) => {
   var clientAuth = req.headers.authorization;
    console.log ("Printing Req Auth token",clientAuth);
    getUserInfo(req.headers.authorization);
   res.send({
    msg: "Your access token was successfully validated !", 
  });
   throw {msg:"User does not rights to create order"};
 }
 catch(err){
  throw {msg:"User does not rights to create order"};
 }
});

//Not using this at the moment as i could not figure out how to implement asynch to return the response
//Server was returning null response before it evaluates
app.get("/api/prepareOrderHistory", checkJwt, (req, res) => {
   readUserMetaData();    
  res.send({
    msg: "Order History Read from Auth0 profile"
  });
});



//This function helps to update user meta data 
function updateUserMetaData(str) {
  //Dont understand why its a null now
      console.log("Inside updateUserMetaData function: ",str);
   
      var date = new Date(); 
     
       var options1 = {
        method: 'PATCH',
        url: `https://dev-lyqevnst.us.auth0.com/api/v2/users/${auth0UserId}`,
        headers: {authorization: mgtToken, 'content-type': 'application/json'},
        data: {user_metadata: 
          {
            orders: 
            {
              order : ""+str
            }
          }
        }
      };

      axios.request(options1).then(function (response1) {
        console.log("User Update response :",response1.data);
      }).catch(function (error) {
        console.error("User update error:", error);
      });

}



// Sowmya: Adding code to validate the create order scope of the pizza api 
  app.post('/api/createOrder', function(request, response){
    console.log("Body", request.body);
   console.log("Existing order",userMetaData);

    var date = new Date();
    var cheesepizza = request.body.cheesepizza;
    var nonvegpizza = request.body.nonvegpizza;
    var vegpizza = request.body.vegpizza;
    var str = userMetaData + "," + date +":";
    if(cheesepizza != undefined)
      str = str.concat("CheesePizza");

    if(nonvegpizza != undefined)
      str = str.concat("-NonVegPizza");

    if(vegpizza != undefined)
      str = str.concat("-VegPizza");

    // str = str.concat("}");


    console.log("Existing order",userMetaData);
    console.log("New Order", str);
    //str = "";
    //updateUserMetaData(`${userMetaData} ,Order on ${date}:${str} `);
    //${userMetaData}, ${date}:${str}
    updateUserMetaData(str);
    
     response.send({
    msg: "Your order is validated, and is placed -- access token was successfully validated!" 
  });
});



function getManagementToken() {
  console.log("Step 1 -----> Inside getManagementToken method " );
      var axios = require("axios").default;
       var clientId = "ocM9EiEMlKFZPctVUGtIVbYlmpR6f5sC";
      var clientSecret = "LVz4n8crNT-qNDfGcRHcqJB1cDN1uoUXUvR-ilatYkiFpb6dfOfxsqKOBQQj8wO-";
      var options = {
        method: 'POST',
        url: `https://${authConfig.domain}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          audience: `https://${authConfig.domain}/api/v2/`
        }
      };

      axios.request(options).then(function (response) {
        console.log("Management Token response:",response.data);
        return reponse.data;
      }).catch(function (error) {
        console.error("Management Token Error:",error);
      });
}

//Sowmya - end


app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.get("/*", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.use(function(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ msg: "Invalid token" });
  }
  next(err, req, res);
});

process.on("SIGINT", function() {
  process.exit();
});

module.exports = app;
