# A Project Listing App's Backend

Developing NodeJS environment `v18.16.0`

Initialized the app in following manner : 

```bash
npm install express
npm install --save-dev nodemon
touch server.js
touch .gitignore
npm i mongoose
npm i dotenv
npm i eslint 
```

Did setup of eslint with following options 
```bash
npm init @eslint/config
```

```bash
✔ How would you like to use ESLint? · To check syntax, find problems, and enforce code style
✔ What type of modules does your project use? · commonjs
✔ Which framework does your project use? · none
✔ Does your project use TypeScript? · No 
✔ Where does your code run? · node
✔ How would you like to define a style for your project? · guide
✔ Which style guide do you want to follow? · airbnb
✔ What format do you want your config file to be in? · JavaScript
```

---
## What is Project Listing App ?

> An all-in-one project listing app with a powerful backend, enabling seamless browsing of projects, businesses, and developers while offering extensive project details and developer profiles.
---

## What are the basic functional requirements of the app ? 

*A functional requirement (FR) defines the specific services and behaviors that the software system or its components must provide, encompassing inputs, system behavior, and corresponding outputs.*

1. **Developer** - 
   - Developer should be able to do CRUD operation on their profile
2. **Organization** -
   - Organization should be able to do CRUD operation on their profile
3. **Project** - 
   - Organization should be able to do CRUD operation on their listed projects
4. **Proposal** - 
   - A developer should be able to do CRUD operation on their proposals made to organization's project.
5. **Review**
   - A developer should be able to create, delete review on the organization they've worked with.
   - A organization should be able to create, delete review for the developer they've worked with.

![Schema diagram](<public/Model_schema.png>)

---

## API Index 

### Developer

- [x] Retrieve all Developers - <span style="color:deepskyblue">GET</span> `/developers`
  >  - [x] SORT asc/desc based on '*any*' parameter  - <span style="color:deepskyblue">GET</span> `/developers?sort=city` or `=-city` for descending.
  >  - [x] SEARCH based on '*fname, lname, city, qualification*' parameter of schema - <span style="color:deepskyblue">GET</span> `/developers?city=mum` 
  >    - Or something more complex like `?fname=me&city=che`
  >    - Or `?qualification=BE+in+Comp&sort=fname`
  >  - [x] FILTER based on '*openToWork*' - <span style="color:deepskyblue">GET</span> `/developers?openToWork=true`
- [x] Register new Developer - <span style="color:springgreen">POST</span> `/developers/auth/register` - *generates authToken too.*
- [x] Login Developer - <span style="color:springgreen">POST</span> `/developers/auth/login` - *generates authToken too.*
- [x] Retrieve specific Developer - <span style="color:deepskyblue">GET</span> `/developers/:id`
- [x] Update specific Developer - *Protected* <span style="color:yellow">PATCH</span> `/developers/:id`
- [x] Delete specific Developer - *Protected* <span style="color:red">DELETE</span> `/developers/:id`

### Organization

- [x] Retrive all Organization - <span style="color:deepskyblue">GET</span> `/organizations`
  >  - [x] SORT/FILTER asc/desc based on '*any*' parameter  - <span style="color:deepskyblue">GET</span> `/organizations?sort=name` or `=-name` for descending.
  >  - [x] SEARCH based on '*name, domain*' parameter of schema - <span style="color:deepskyblue">GET</span> `/organizations?domain=it` 
  >    - Or something more complex like `?domain=it&name=raw`
- [x] Register new Organization - <span style="color:springgreen">POST</span> `/organizations/auth/register` - *generates authToken too.*
- [x] Login Organization - <span style="color:springgreen">POST</span> `/organizations/auth/login` - *generates authToken too.*
- [x] Retrive specific Organization - <span style="color:deepskyblue">GET</span> `/organizations/:id`
- [x] Update specific Organization - *Protected* <span style="color:yellow">PATCH</span> `/organizations/:id`
- [x] Delete specific Organization - *Protected* <span style="color:red">DELETE</span> `/organizations/:id`

### Project

- [x] Retrive all Projects - <span style="color:deepskyblue">GET</span> `/projects`
  >  - [x] SORT asc/desc based on '*any*' parameter  - <span style="color:deepskyblue">GET</span> `/projects?sort=createdAt` or `=-createdAt` for descending.
  >  - [x] SEARCH/FILTER based on '*title, techStack*' parameter of schema - <span style="color:deepskyblue">GET</span> `/projects?title=edu` 
  >  - [x] FILTER based on '*featured*' - <span style="color:deepskyblue">GET</span> `/developers?featured=true`
  >    - Or something more complex like `?projects?projects?board=kan&featured=false`
- [x] Create new Project - *Organization Protected* <span style="color:springgreen">POST</span> `/projects`
- [x] Retrive specific Project - <span style="color:deepskyblue">GET</span> `/projects/:id`
- [x] Update specific Project - *Organization Protected* <span style="color:yellow">PATCH</span> `/projects/:id`
- [x] Delete specific Project - *Organization Protected* <span style="color:red">DELETE</span> `/projects/:id`

### Proposals

- [x] Retrieve all proposals - *Dev+Org Protected* <span style="color:deepskyblue">GET</span> `/proposals`
- [x] Create new proposal - *Dev Protected* <span style="color:springgreen">POST</span> `/proposals`
- [x] Update specific proposal - *Dev Protected* <span style="color:yellow">PATCH</span> `/proposals/:id`
- [x] Delete specific proposal - *Dev Protected* <span style="color:red">DELETE</span> `/proposals/:id`

### Review

- [x] Retrieve all reviews - <span style="color:deepskyblue">GET</span> `/reviews`
  >  - [x] SORT asc/desc based on '*any*' parameter  - <span style="color:deepskyblue">GET</span> `/reviews?sort=rating` or `=-rating` for descending.
- [x] Create new review - *Dev+Org Protected* <span style="color:springgreen">POST</span> `/reviews`
- [x] Update specific review - *Protected* <span style="color:yellow">PATCH</span> `/reviews/:id`
- [x] Delete specific review - *Protected* <span style="color:red">DELETE</span> `/reviews/:id`


---

## About Backend Development :

#### Main Project Structure 

1. `server.js` - Entry point for the backend server
2. `/routes` - Folder for all routes
3. `/models` - Folder for all schemas 
4. `/utils` - Folder for extra utility functions
5. `/middleware` - Folder for middlewares
6. `/config` - Folder for any configuration setups
7. `/controllers` - To manage some business logic out of routes.

---

#### Other setups :

```bash
npm i express-fileupload
npm i express-validator
npm i cloudinary
npm i bcryptjs 
npm i jsonwebtoken
```

---

### Some Standard HTTP codes used throughout the project : 

- `201` - Create/Register Resource.
- `200` - OK for Updating/Deleting Resource.
- `400` - Bad Request due to possible syntax errors/invalid request payload/failed the request validation like if the data is missing or if it has a wrong type, etc.
- `422` - Server understands but Unprocessible due to business-logic/input validations related issues.
  - 422 is less severe than 400. The request has reached the server. The server has acknowledged the request has got the basic structure right. But the information in the request body can't be parsed or understood.
  - Difference between the above two is that the syntax of a request entity for a 422 error is correct whereas the syntax of a request that generates a 400 error is incorrect.
- `401` - Unauthorized access to Resource used in access_token verification
- `404` - Resource not found.

---

## Application's capabilites : 

1. [x] Daatabases : MongoDB Atlas is used to house data of Developers, Organizations, Projects, Proposals and Reviews with appropriate Schema. Apart from MongoDB, Cloudinary web service is used to handle and store multimedia.
2. [x] RESTful API : The express API of the application follows all the REST API rules and provides CRUD operations on the API's entites.
3. [x] Sorting & filtering : Approtiate endpoints are powered with the sorting and filtering quering parameters.
4. [x] Verify user paramters : Specific fields like email and password and verified by express-validator.
5. [x] Security : The API's routes are protected with authentication middlwares and SSL by hosting service.
6. [x] Documentation  

---

## RESTful API 

> **The backend follows the concept of RESTful(Representational State Transfer) APIs**

- [x] Accept and respond with JSON
- [x] Standard HTTP status codes
- [x] No use of verbs in URL. Use nouns.
- [x] Plural nouns to name a collection in URL
- [x] Use resource nesting
- [x] Use filtering, sorting to retrieve data
- [x] Well compiled documentation
- [x] Return error details in response body
- [x] Use SSL (done with the help of hosting)
- [x] Secure the API (with several middlewares)


---

#### Learnings :

1. Might get the following errors in console : 
```bash
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
```
To resolve it, look for multiple `res.status()` being sent from one request. Look for `return` statements carefully too and handle it appropriately. Or look for conditional logic like `if..else` blocks.

You can send a response to the client only once when you send more than one time that will generate the error
2. About ExpressJS' `request` object parts : 
   1. `req.body` - Generally used in POST/PUT requests when we need to send data to the server. Remember to use `express.json()` middleware to parse request body else you'll get an error
   2. `req.params` - These are properties attached to the url i.e named route parameters. You prefix the parameter name with a colon ( `:` ) when writing your routes.
   ```javascript
    app.get('/giraffe/:number', (req, res) => {
        console.log(req.params.number)
    })

   ```
   ```bash
    GET  http://localhost:3000/giraffe/1
   ```
   3. `req.query` - Mostly used for searching,sorting, filtering, pagination, e.t.c. It written as key=value preceeded by `?`. We can add multiple queries using `&` operator in the URL.
   ```bash
    GET  http://localhost:3000/animals?page=10
    GET  http://localhost:3000/animals?page=10&section=2
   ```
   ```javascript
    app.get('/animals', ()=>{
        Animals.find(req.query)
        console.log(req.query.page) // 10
    })
   ```
3. For data hosted on MongoDB Atlas, MongoDB offers an improved full-text search solution,  **Atlas Search**, which has its own `$regex` operator.
4. FOr sorting, using mongoose `sort()` [ref here](https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()). 

#### Todo :

developer schema :
1. relation "organization" (new/option)...
2. add "projects" - role.(figure out this)

- Input body Validation
- Ask sir about HTP status code consistency.
