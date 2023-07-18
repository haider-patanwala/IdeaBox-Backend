## Learnings :

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
4. For sorting, using mongoose `sort()` [ref here](https://mongoosejs.com/docs/api/query.html#Query.prototype.sort()). 
5. Promises .then .catch and aysnc/await are 2 different things for aynshronous behaviouors so one must use any one.
6. Signing JWT token and Verifying it must be done in same manner like the following : 
```javascript
// on login
console.log({ email }); // { email: 'meet@gmail.com' }
const token = jwt.sign({ email }, secret); 

// on verification
const verification = jwt.verify(req.headers.authorization, secret); 
console.log(verification); // { email: 'meet@gmail.com' }
return Developer.findOne({ email: verification.email })
```
OR the following... but this is avoided since we cant check the token type when using a combined authenticator like `roleBasedAuthentication` middleware.
```javascript
console.log(email); // meet@gmail.com
const token = jwt.sign(email, secret); 

// on verification
const verification = jwt.verify(req.headers.authorization, secret); 
console.log(verification); // meet@gmail.com
return Developer.findOne({ email: verification })
```

### <u>API Testing</u> :-

1. Installed packages for testing as dev dependencies.
```bash
npm i -D mocha chai supertest nyc
```
2. Created `/test` folder.
3. When creating `/test` folder, try to mimic the folder structure of the project in it.
4. `Mocha` is gonne look for `test` folder.
5. Enable mocha in the `.eslintrc.js`
6. Added test script in `package.json` and ran `npm run test`.
   1. 
   2. Also added a script for coverage and can run it through `npm run test:cov`
   3. Be careful in naming and avoid typos.
7. To create a test we use `describe()` which describes a "suite"(a group of related test cases) with the given 'title' and `callback fn` containing nested suites.
8. `done()` function is used to handle asynchronous operations in test cases such as making HTTP requests, interacting with databases, or using timers, it's important to notify the testing framework when the asynchronous operations have completed.  
   1. This ensures that the test case doesn't complete prematurely or timeout before the asynchronous operations finish.
   2. It is typically passed as a parameter to the test case function, and it needs to be invoked to signal the completion of the test case.
   3. The testing framework waits for `done()` to be called before moving on to the next test case or completing the test suite.
   4. If `done()` is not called at the end of test suite then an error like following can occur. 
```bash
Error: Timeout of 10000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.
```
9. Ensure the URL paths of test cases are started with a slash like `/developers` otherwise the following error can come :
```bash
Error: ECONNREFUSED: Connection refused
```
10. `.only` used with `decribe.only()` will run only that test suite.
11. `.skip` used with `describe.skip()` will skip that specific test suite.
