const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const developerModel = require("../../models/developer"); // only for before and after hooks

let api;
let uid;
let authToken;

describe("Developer API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
      })
      .then(() => done())
      .catch(done);
  });
  before("Creaate a developer in before block", (done) => {
    const dummyData = [
      {
        fname: "Meet",
        lname: "Makwana",
        email: "meet@gmail.com",
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
  // after("Purge the dummy data after testing is completed by the describe() interface", async () => {
  //   console.log("I SHOULD BE EXECUTED AFTER DELETE");
  //   await developerModel.deleteMany({});
  // });

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

  // test cases for POST route
  it("POST a developer", async () => {
    await api.post("/developers/auth/register")
      .attach("photo", "test/resources/developer.jpg")
      .field("fname", "Meet")
      .field("lname", "Makwana")
      .field("email", "meetm@gmail.com")
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
      });
    //  Allowing done() to be passed as a reference rather than invoking it immediately. like catch(done())
    // This allows the console.log() to work properly in the above then block.
  });

  // test cases for PATCH route
  it("PATCH a developer", async () => {
    await api.patch(`/developers/${uid}`)
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
      });
  });

  // test cases for DELETE route
  it("DELETE a developer", async () => {
    console.log("DELETE token-----------", authToken);
    console.log("DELETE uid-----------", uid);

    const deletePromise = api.delete(`/developers/${uid}`)
      .set("authorization", `${authToken}`)
      .then(async (response) => {
        console.log("DELETED-------------", response);
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("data", "Developer deleted successfully.");
        expect(response.body).to.have.property("errors", null);

        await deletePromise;
        await developerModel.deleteMany({});
        // .then(() => done())
        // .catch(done);
      });
  });
});
