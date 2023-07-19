const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const developerModel = require("../../models/developer"); // only for before and after hooks
require("dotenv").config();

const devAuthToken = process.env.DEV_AUTH_TOKEN;

let api;
let uid;
let authToken;

describe("Developer API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
        // done();
      })
      .then(() => done())
      .catch(done);
  });
  before("Creaate a developer in before block", (done) => {
    const dummyData = [
      {
        fname: "Meet",
        lname: "Makwana",
        email: "meetm@gmail.com",
        password: "12345678",
        phone: 9876543210,
        qualification: "BE in Computer",
        skills: [
          "HTML",
          "CSS",
          "JavaScript",
          "MERN",
          "Git",
        ],
        city: "Mumbai",
        openToWork: true,
        linkedin: "http://linkedin.com/in/meetmakwana19",
        github: "http://github.com/meetmakwana19",
        profile_pic: "http://res.cloudinary.com/dulptytgu/image/upload/v1689539554/qcyvdqkfcoll6d2uqhyc.jpg",
        technical_role: "Full Stack Web Developer",
      },
    ];
    developerModel.insertMany(dummyData)
      .then(() => done())
      .catch(done);
  });

  // SHIFTING THE PURGING LOGIC AT THE END OF DELETE ROUTE'S TEST CASE SINCE THIS GETS FIRED BEFORE PATCH/DELETE COMPLETES EXECUTION WITH THE ACCESS_TOKEN GENERATE BY PREVIOUS' POST OPERATION.
  // DUE TO ASYNC NATURE OF AFTER(), IT DELETES THE DEVELOPER FIRST ONLY AND THE VERIFICATION OF ACCESS_TOKEN FAILS FOR THE CONSEQUENT PATCH/DELETE TEST CASES.

  // --------IGNORE from here
  // after("Purge the dummy data after testing is completed by the describe() interface", async () => {
  //   console.log("I SHOULD BE EXECUTED AFTER DELETE");
  //   await developerModel.deleteMany({});
  // });
  // --------IGNORE till here

  // test cases for GET all route
  it("GET all developers", async () => {
    await api
      .get("/developers")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("message", "Developers fetched successfully");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.data).to.be.an("array");
        expect(response.body.errors).to.equal(null);
      });
  });

  // test cases for GET all route
  it("GET all developers by searching city", async () => {
    await api
      .get("/developers?city=kan")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data[0]).to.has.property("city", "Kanpur");
      });
  });

  // test cases for GET all route
  it("GET all developers by searching fname", async () => {
    await api
      .get("/developers?fname=ank")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data[0]).to.has.property("fname", "Ankit");
      });
  });

  // test cases for GET all route
  it("GET all developers by searching lname", async () => {
    await api
      .get("/developers?lname=tiwa")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data[0]).to.has.property("lname", "Tiwari");
      });
  });

  // test cases for GET all route
  it("GET all developers by searching qualification", async () => {
    await api
      .get("/developers?qualification=m.sc")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data[0]).to.has.property("qualification", "M.Sc in Information Technology");
      });
  });

  // test cases for GET all route
  it("GET all developers by searching openToWork and sorting", async () => {
    await api
      .get("/developers?openToWork=true&sort=fname")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data[0]).to.has.property("openToWork", true);
      });
  });

  // test cases for POST route
  it("POST a developer", (done) => {
    api.post("/developers/auth/register")
      .attach("photo", "test/resources/developer.jpg")
      .field("fname", "Meet")
      .field("lname", "Makwana")
      .field("email", "meetmm@gmail.com")
      .field("password", "12345678")
      .field("phone", "9876543210")
      .field("qualification", "BE in Computer")
      .field("skills", [
        "HTML",
        "CSS",
        "JavaScript",
        "MERN",
        "Git",
      ])
      .field("city", "Mumbai")
      .field("openToWork", true)
      .field("linkedin", "http://linkedin.com/in/meetmakwana19")
      .field("github", "http://github.com/meetmakwana19")
      .field("technical_role", "Full Stack Web Developer")
      .then((response) => {
        // saving uid and access_token for the next PATCH and DELETE request
        authToken = response.body.data.access_token;
        uid = response.body.data.developer.uid;
        console.log("POST authToken is ----------", authToken);
        console.log("POST uid is ----------", uid);
        console.log("POSTED ----------", response.body);

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Developer created successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);
        expect(response.body.data).to.have.property("access_token");
        expect(response.body.data).to.have.property("developer");
        done();
      })
      .catch(done);
    // --------IGNORE from here
    //  Allowing done() to be passed as a reference rather than invoking it immediately. like catch(done())
    // This allows the console.log() to work properly in the above then block.
    // .catch((done) => done());
    // --------IGNORE till here
  });

  // test cases for POST route
  it("POST a developer without photo file", (done) => {
    api.post("/developers/auth/register")
      .field("fname", "Tony")
      .field("lname", "Stark")
      .field("email", "tony@gmail.com")
      .field("password", "12345678")
      .field("phone", "9876543210")
      .then((response) => {
        // saving uid and access_token for the next PATCH and DELETE request
        // authToken = response.body.data.access_token;
        // uid = response.body.data.developer.uid;
        console.log("POSTED without photo----------", response.body);

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Developer created successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);
        expect(response.body.data).to.have.property("access_token");
        expect(response.body.data).to.have.property("developer");
        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a developer without password", (done) => {
    api.post("/developers/auth/register")
      .field("fname", "Tony")
      .field("lname", "Stark")
      .field("email", "tony@gmail.com")
      .then((response) => {
        console.log("POSTED without pw----------", response.body);

        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("message", "Developer registration failed. Please provide a password.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "password : Password should be atleast 8 and maximum 16 characters");

        done();
      })
      .catch(done);
  });

  // test cases for Login route
  it("LOG IN  a developer", (done) => {
    api.post("/developers/auth/login")
      .field("email", "ankit@gmail.com")
      .field("password", "12345678")
      .then((response) => {
        console.log("LOGIN----------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Developer login successful.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);
        expect(response.body.data).to.have.property("access_token");
        expect(response.body.data).to.have.property("developer");
        done();
      })
      .catch(done);
  });

  // test cases for Login route
  it("LOG IN  a developer with wrong password", (done) => {
    api.post("/developers/auth/login")
      .field("email", "ankit@gmail.com")
      .field("password", "12345677")
      .then((response) => {
        console.log("LOGIN wrong password----------", response.body);

        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error logging in Developer.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "Error: Incorrect Password.");
        done();
      })
      .catch(done);
  });

  // test cases for Login route
  it("LOG IN  a developer with wrong email", (done) => {
    api.post("/developers/auth/login")
      .field("email", "anki@gmail.com")
      .field("password", "12345678")
      .then((response) => {
        console.log("LOGIN wrong email----------", response.body);

        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error logging in Developer.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("error", "Error: Developer not found.");
        done();
      })
      .catch(done);
  });

  // test cases for PATCH route
  it("PATCH a developer", (done) => {
    api.patch(`/developers/${uid}`)
      .set("authorization", `${authToken}`)
      .attach("photo", "test/resources/developer.jpg")
      .field("qualification", "BTech in Computer")
      .field("city", "Delhi")
      .field("openToWork", false)
      .then((response) => {
        console.log("PATCH token-----------", authToken);
        console.log("PATCH uid-----------", uid);
        console.log("UPDATED --------------", response.body);
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Developer updated successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch(done);
  });

  // test cases for PATCH route
  it("PATCH a developer without photo", (done) => {
    api.patch(`/developers/${uid}`)
      .set("authorization", `${authToken}`)
      .field("openToWork", false)
      .then((response) => {
        console.log("UPDATED without photo--------------", response.body);
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Developer updated successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch(done);
  });

  // test cases for isDeveloperAuthenticated error
  it("PATCH a developer with expired access_token", (done) => {
    api.patch(`/developers/${uid}`)
      .set("authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1AZ21haWwuY29tIiwiaWF0IjoxNjg5NzE2MTQ5fQ.nx5ilISQCZpZPjd5g6_EHMHiG83-SzD_wbtpugyFxFs")
      .field("openToWork", false)
      .then((response) => {
        console.log("UPDATED with expired access_token--------------", response.body);
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error in authentication operation.");
        expect(response.body).to.have.property("error", "Error: Session expired. Please login again..");
        done();
      })
      .catch(done);
  });

  // test cases for isDeveloperAuthenticated error
  it("PATCH a developer without access_token", (done) => {
    api.patch(`/developers/${uid}`)
      .field("openToWork", false)
      .then((response) => {
        console.log("UPDATED with expired access_token--------------", response.body);
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("redirect", false);

        done();
      })
      .catch(done);
  });

  // test cases for isDeveloperAuthenticated error
  it("PATCH a developer with wrong uid", (done) => {
    api.patch(`/developers/${uid}xx`)
      .set("authorization", `${authToken}`)
      .field("openToWork", false)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error updating developer.");
        expect(response.body).to.have.property("error", "Error: Developer not found.");

        done();
      })
      .catch(done);
  });

  // test cases for GET route
  it("GET a specific developer", (done) => {
    api.get(`/developers/${uid}`)
      .then((response) => {
        console.log("GOT --------------", response.body);
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Developer fetched successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch(done);
  });

  // test cases for GET route
  it("GET a specific developer with wrong uid", (done) => {
    api.get(`/developers/${uid}xx`)
      .then((response) => {
        console.log("GOT wrong --------------", response.body);
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Error fetching developer.");
        expect(response.body).to.have.property("error", "Error: Developer not found");
        done();
      })
      .catch(done);
  });

  // test cases for DELETE route
  it("DELETE a developer", async () => {
    const deletePromise = api.delete(`/developers/${uid}`)
      .set("authorization", `${authToken}`)
      .then(async (response) => {
        console.log("DELETED Developer-------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message", "Developer deleted successfully.");
        expect(response.body).to.have.property("errors", null);
      });
    // remember to call the promise and delete method outside the promise definition over here
    await deletePromise;

    // await developerModel.deleteMany({});

    // deleting just the recently added one which was inserted by our test suite.
    // We need atleast one developer in test db as the access_token is used in the proposal.test.js & review.test.js
    // if all documents are deleted then there would be nothing to verify the access_token used in proposal.test.js & review.test.js
    await developerModel.findOneAndDelete({}, { sort: { _id: -1 } })
      .then((result) => {
        console.log("Deleting the recently added document------->", result);
      })
      .catch((error) => {
        console.log("Error in deleting the recently added document------->", error);
      });

    // then and catch logic is not needed when using async/await
    // .then(() => done())
    // .catch(done);
  });

  // test cases for DELETE route
  it("DELETE a developer with wrong uid", async () => {
    const deletePromise = api.delete(`/developers/${uid}xx`)
      .set("authorization", devAuthToken)
      .then(async (response) => {
        console.log("DELETED Developer-------------", response.body);

        expect(response.status).to.equal(422);

        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("message", "Error deleting developer.");
        expect(response.body).to.have.property("error", "Error: Developer not found.");
      });
    // remember to call the promise and delete method outside the promise definition over here
    await deletePromise;

    // await developerModel.deleteMany({});

    // deleting just the recently added one which was inserted by our test suite.
    // We need atleast one developer in test db as the access_token is used in the proposal.test.js & review.test.js
    // if all documents are deleted then there would be nothing to verify the access_token used in proposal.test.js & review.test.js
    await developerModel.findOneAndDelete({}, { sort: { _id: -1 } })
      .then((result) => {
        console.log("Deleting the recently added document------->", result);
      })
      .catch((error) => {
        console.log("Error in deleting the recently added document------->", error);
      });

    // then and catch logic is not needed when using async/await
    // .then(() => done())
    // .catch(done);
  });

  it("Produce express-validator error", (done) => {
    api.post("/developers/auth/register")
      .send({
        password: "1234567",
      })
      .then((response) => {
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("message", "Developer registration failed. Please check your inputs.");
        expect(response.body).to.have.property("error");
        expect(response.body.error).to.equal("email : Enter a valid email");
        done();
      })
      .catch((error) => {
        console.log("Errors----", error);
        done(error);
      });
  });

  it("Produce internal server error", (done) => {
    api.post("/developers/auth/register")
      .send("fname") // sending a wrong JSON payload with just key
      // so setting content-type header is essesntial to throw an error, without it the error wont be thrown.
      .set("Content-Type", "application/json")
      .then((response) => {
        console.log("got----------", response);
        expect(response.status).to.equal(400);

        expect(response.body).to.have.property("message", "Internal Server Error.");
        expect(response.body).to.have.property("error", "Unexpected token f in JSON at position 0");
        // expect(response.body.error).to.equal("email : Enter a valid email");
        done();
      })
      .catch((error) => {
        console.log("Errors----", error);
        done(error);
      });
  });
});
