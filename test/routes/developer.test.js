const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const developerModel = require("../../models/developer");

let api;

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

  after("Purge the dummy data after testing is completed by the describe() interface", (done) => {
    developerModel.deleteMany({})
      .then(() => done())
      .catch(done);
  });

  // test cases for GET all route
  it("GET all developers", (done) => {
    api
      .get("/developers")
      .then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("message", "Developers fetched successfully");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.data).to.be.an("array");
        expect(response.body.errors).to.equal(null);
        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a developer", (done) => {
    api.post("/developers/auth/register")
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
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors");
        done();
      })
      .catch(done());
  });
});
