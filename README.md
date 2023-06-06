# Kjetil_Skarstein-Hatlen_EP_CA_AUG22FT

## Description
This is an e-commerce backend API project of an online store, built with Node.js, Express.js, MySQL, and Sequelize. 
The application provides a set of endpoints to facilitate user authentication, product browsing, cart management, and order placement. 
It also includes special functionality for admin users, such as managing product listings, reviewing orders and many more. 
The project incorporates JWT for user authentication. Testing is facilitated with Jest and Supertest. 
It's a compact demonstration of my skills in backend development.


## Installation and usage
1. Open terminal and run this command ```git clone https://github.com/Skarstein-Hatlen/Kjetil_Skarstein-Hatlen_DAB_CA_AUG22FT```
2. Create a .env file in the root directory with the required environment variables (see the "ENV configuration" section below).
3. Start server by running ```npm install``` in the terminal.(This will add the database schmea and tables.)
4. Use an API client like Postman to interact with the API. You can find the API documentation PDF in the documentation folder.
2. Use the /setup endpoint in postman to populate the database and add Admin user.
5. Use Signup to create a user and Login to get the Bearer Token.
6. Put the Bearer token where it is requested/needed by the documentation
7. Some endpoints are only for Admin user and can therefore only use the Admin Bearer token.


## Unit testing
1. Remember that tables needs to be created before testing, tables will automatically be created when running npm start in terminal.
2. Run npm test
3. Test result will now be displayed in the console.


## Dependencies
- bcrypt: Hashing passwords securely.
- body-parser: Handle HTTP POST request in Express.js.
- cookie-parser: Parse cookie header and populate req.cookies with an object keyed by the cookie names.
- debug: node.js debugging utility.
- dotenv: Loads environment variables from .env file into process.env.
- ejs: HTML markup with plain JavaScript.
- express: Web framework for Node.js.
- http-errors: Create HTTP error objects.
- jsonwebtoken: JSON Web Tokens for securely transmitting information between parties.
- morgan: HTTP request logger for Node.js.
- mysql2: MySQL client for Node.js.
- node-fetch: For making server-side web API calls.
- sequelize: ORM tool for MySQL.
- jest: JavaScript testing framework.
- supertest: Library for testing Node.js servers.


## Endpoints

#### Auth
- POST /login - Allows users to log in with their credentials and obtain a JWT token.
- POST /signup - Registers new users by providing their information.

#### Item
- GET /items - Retrieves all items from the database.
- POST /item - Adds a new item to the database.
- PUT /item/:id - Updates an existing item based on its ID.
- DELETE /item/:id - Deletes an item from the database.

#### Category
- GET /categories - Retrieves all categories from the database.
- POST /category - Adds a new category to the database.
- PUT /category/:id - Updates the name of a category based on its ID.
- DELETE /category/:id - Deletes a category from the database.

#### Cart
- GET /cart - Retrieves cart for the logged-in user.
- GET /allcarts - Retrieves all existing carts, including their items and user information.
- POST /cart_item - Adds an item to the user's cart.
- PUT /cart_item/:id - Updates the quantity of a specific item in the user's cart.
- DELETE /cart_item/:id - Removes an item from the user's cart.
- DELETE /cart/:id - Deletes all items from the user's cart.

#### Orders
- GET /orders - Retrieves orders for the logged-in user.
- GET /allorders - Retrieves all existing orders, including items and user information.
- POST /checkout - Place an order for the entire user's cart
- POST /order/:id - Places an order for an item in the user's cart.
- PUT /order/:id - Updates the status of an order.

#### Utility
- POST /setup - Populates the database with initial data and creates an admin user.
- POST /search - Searches for items in the database based on specified criteria.


## Documnetation
Most of the documentation will be found in the documentation folder in the root folder.
However I will leave a link to the Postmand documentation here because of the examples i made for some of the endpoints.
The examples are not shown in the PDF for some reason.

Documentation link:
https://documenter.getpostman.com/view/25216429/2s93sW7a5f

Examples for the search endpoint found in the documentation:

Partial item name
```
{
    "searchQuery": "top"
}
```

Specific category
```
{
    "categoryName": "Toys"
}
```
Specific SKU
```
{
    "sku": "KT125"
}
```

Partial item name, Specific category
```
{
    "searchQuery": "ball",
    "categoryName": "Sporting Goods"
}
```


## Acknowledgment
- Noroff - Modules from the BED courses.
- Stackoverflow - Finding different solutions when stuck.
- Youtube - For same reason as Stackoverflor, see different solutions when stuck.
- Google - Searching up solutions when stuck or unsure.
- Chatgpt - Finding minor syntax when stuck.


## ENV configuration
- ADMIN_USERNAME = "admin"
- ADMIN_PASSWORD = "P@ssw0rd"
- DATABASE_NAME = "stocksalesdb"
- DIALECT = "mysql"
- DIALECTMODEL = "mysql2"
- PORT = "3000"
- HOST = "localhost"
- JWT_SECRET = "2839934343ad7bac8f39e2c2bc83bba92978ef8695fa4a5cd00b94bc86d830bc"