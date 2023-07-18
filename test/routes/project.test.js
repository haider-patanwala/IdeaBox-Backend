const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const projectModel = require("../../models/project"); // only for before and after hooks

let api;
let uid;
let authToken;

describe.only("Organization API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
        done();
      })
      // .then(() => done())
      .catch(done);
  });
  before("Create an organization in before block", (done) => {
    const dummyData = [{
      title: "EduConnect",
      description: "An online education platform that connects students and teachers worldwide",
      featured: true,
      board: "scrum",
      timeframe: "6 months",
      techStack: "MERN",
      bookmark: false,
      fixed_price: 20000,
      project_type: "One time",
      required_personnel: "Web Developer",
    }];
    projectModel.insertMany(dummyData)
      .then(() => done())
      .catch(done);
  });

  // test cases for GET routes
  it("GET all projects", (done) => {
    api.get("/projects")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Projects fetched succcessfully");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.data).to.be.an("array");
        expect(response.body.errors).to.equal(null);

        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a project", (done) => {
    api.post("/projects")
      .attach("photo", "test/resources/project.jpg")
      .field("title", "EduConnect")
      .field("description", "An online education platform that connects students and teachers worldwide")
      .field("featured", true)
      .field("board", "scrum")
      .field("timeframe", "6 months")
      .field("techStack", "MERN")
      .field("fixed_price", 30000)
      .field("project_type", "One time")
      .field("required_personnel", "Web Developer")
      .then((response) => {
        console.log("POST uid is ----------", response.body);
        uid = response.body.data.uid;

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Organization created successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch((e) => done(e));
  });
  // test cases for PATCH route
  it("PATCH the organization", (done) => {
    api.patch(`/projects/${uid}`)
      .set("authorization", authToken)
      .attach("photo", "test/resources/project.jpg")
      .field("featured", false)
      .then((response) => {
        console.log("PATCH token-----------", authToken);
        console.log("PATCH uid-----------", uid);
        console.log("UPDATED --------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Updated organization successfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for DELETE route
  it("DELETE organization", async () => {
    const deletePromise = api.delete(`/projects/${uid}`)
      .set("authorization", authToken)
      .then(async (response) => {
        console.log("DELETE token-----------", authToken);
        console.log("DELETE uid-----------", uid);
        console.log("DELETED-------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message", "Deleted organization successfully.");
        expect(response.body).to.have.property("errors", null);

        await deletePromise;
        await organizationModel.deleteMany({});
      });
  });
});
