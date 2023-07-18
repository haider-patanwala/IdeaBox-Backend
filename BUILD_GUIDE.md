## Project Setup Guide for a Developer :

1. Initialized the app in following manner : 

```bash
npm install express
npm install --save-dev nodemon
touch server.js
touch .gitignore
npm i mongoose
npm i dotenv
npm i eslint 
```

2. Did setup of eslint with following options 
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
3. #### Other setups :

```bash
npm i express-fileupload
npm i express-validator
npm i cloudinary
npm i bcryptjs 
npm i jsonwebtoken
npm i cors
```

---

### Main Project Structure 

1. `server.js` - Entry point for the backend server
2. `/routes` - Folder for all routes
3. `/models` - Folder for all schemas 
4. `/utils` - Folder for extra utility functions
5. `/middleware` - Folder for middlewares
6. `/config` - Folder for any configuration setups
7. `/controllers` - To manage some business logic out of routes.

---

👉🏻👉🏻 [Here](Learnings.md) are the learnings learnt from while developing this project.
