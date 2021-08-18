# PizzaTemptations
This application uses Auth0 Authentication and Authorization service to verify user identity, and be able to place an order

There are 3 important files:
server.js acts acts as the Backend API
app.sj/ui.js is the browser side running script
index.html file has the UI page

How to run it:
1. Download the code to a folder
2. Navigate to that folder in a terminal and run npm start
3. Go to client and hit localhost:3000
4. You should be able to the home pizza page

Authentication Usecase:
1. Click on the login button, which redirects to Auth0 Authentication page 
2. User provides a local login, or Social Provider login 
3. After authentication is complete, Auth0 returns back to call back URL: http://localhost:3000


Authorization Usecase:
1. Before placing an order, please go to 2nd tab - Check Access and click on button "Check user scope"
2. Also click on button "Read UserMetadata"
3. Go to CreateOrder tab , select the menu items and click on "Create Order & Submit"
4. This is place an order, you can see this in Order History tab, when you say Print Order History

