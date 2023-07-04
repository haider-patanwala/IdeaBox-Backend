# A Project Listing App's Backend

Developing NodeJS environment `v18.16.0`

Initialized the app in following manner : 

```bash
npm install express
npm install --save-dev nodemon
touch server.js
touch .gitignore
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

## API Index 

### Business

- [ ] Create new Business - POST `/businesses`
- [ ] Retrive all Business - GET `/businesses`
- [ ] Retrive specific Business - GET `/businesses/:id`
- [ ] Update specific Business - PATCH `/businesses/:id`
- [ ] Delete specific Business - DELETE `/businesses/:id`

### Project

- [ ] Create new Project - POST `/projects`
- [ ] Retrive all Projects - GET `/projects`
- [ ] Retrive specific Project - GET `/projects/:id`
- [ ] Update specific Project - PATCH `/projects/:id`
- [ ] Delete specific Project - DELETE `/projects/:id`


### Developer


- [ ] Create new Developer - POST `/developer`
- [ ] Retrieve all Developers - GET `/developer`
- [ ] Retrieve specific Developer - GET `/developer/:id`
- [ ] Update specific Developer - PATCH `/developer/:id`
- [ ] Delete specific Developer - DELETE `/developer
/:id`