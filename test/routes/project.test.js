const request = require("supertest"); // for HTTP requests testing
const { expect } = require("chai");
const server = require("../../server");
const projectModel = require("../../models/project"); // only for before and after hooks
require("dotenv").config();

const authToken = process.env.ORG_AUTH_TOKEN;

let api;
let uid;
let uid2;

describe("Project API", () => {
  before("Initialize API in before block", (done) => {
    server
      .then((resultedApp) => {
        api = request(resultedApp);
        done();
      })
      // .then(() => done())
      .catch(done);
  });
  before("Create a project in before block", (done) => {
    const dummyData = [{
      title: "EduConnect",
      description: "An online education platform that connects students and teachers worldwide",
      board: "scrum",
      timeframe: "6 months",
      techStack: "MERN",
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

  // test cases for GET routes
  it("GET all projects by searching, filtering and sorting", (done) => {
    api.get("/projects?title=ai&techStack=python&board=agil&featured=false&sort=createdAt")
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Projects fetched succcessfully");
        expect(response.body).to.has.property("data");
        expect(response.body.data[0]).to.has.property("title", "AI-powered Recommendation System");
        expect(response.body.data[0]).to.has.property("techStack", "Python, TensorFlow, Elasticsearch");
        expect(response.body.data[0]).to.has.property("board", "agile");
        expect(response.body.data[0]).to.has.property("featured", false);

        done();
      })
      .catch(done);
  });

  // test cases for POST route
  it("POST a project", (done) => {
    api.post("/projects")
      .set("authorization", authToken)
      .attach("photo", "test/resources/project.jpg")
      .field("title", "EduConnect")
      .field("description", "An online education platform that connects students and teachers worldwide")
      .field("featured", true)
      .field("board", "scrum")
      .field("timeframe", "6 months")
      .field("techStack", "MERN")
      .field("fixed_price", "30000")
      .field("project_type", "One time")
      .field("required_personnel", "Web Developer")
      .then((response) => {
        console.log("POST uid is ----------", response.body);
        uid = response.body.data.uid;

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Created a project successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch((e) => {
        console.log("Error POSTING : ", e);
        done(e);
      });
  });

  // test cases for POST route
  it("POST a project without photo", (done) => {
    api.post("/projects")
      .set("authorization", authToken)
      .field("title", "EduConnect")
      .field("description", "An online education platform that connects students and teachers worldwide")
      .then((response) => {
        uid2 = response.body.data.uid;
        console.log("ui2----", uid2);

        expect(response.status).to.equal(201);

        expect(response.body).to.have.property("message", "Created a project successfully.");
        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("errors", null);

        done();
      })
      .catch((e) => {
        console.log("Error POSTING : ", e);
        done(e);
      });
  });

  // test cases for GET routes
  it("GET specific project", (done) => {
    api.get(`/projects/${uid}`)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message", "Fetched project successfully.");
        expect(response.body).to.has.property("data");
        expect(response.body).to.has.property("errors");
        expect(response.body.errors).to.equal(null);

        done();
      })
      .catch(done);
  });

  // test cases for GET routes
  it("GET specific project with wrong uid", (done) => {
    api.get(`/projects/${uid}xx`)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message", "Error fetching project.");
        expect(response.body).to.not.have.property("data");
        expect(response.body).to.has.property("error", "Error: Project not found");

        done();
      })
      .catch(done);
  });

  // test cases for PATCH route
  it("PATCH the project with wrong uid", (done) => {
    api.patch(`/projects/${uid}xx`)
      .set("authorization", authToken)
      .field("featured", false)
      .then((response) => {
        expect(response.status).to.equal(422);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Error updating project.");
        expect(response.body).to.have.property("error", "Error: Project not found.");
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for PATCH route
  it("PATCH the project", (done) => {
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
        expect(response.body).to.have.property("message", "Project updated succcessfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch((e) => done(e));
  });
  // test cases for PATCH route
  it("PATCH the project without photo", (done) => {
    api.patch(`/projects/${uid}`)
      .set("authorization", authToken)
      .field("featured", false)
      .then((response) => {
        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("message");
        expect(response.body).to.have.property("message", "Project updated succcessfully.");
        expect(response.body).to.have.property("errors", null);
        done();
      })
      .catch((e) => done(e));
  });

  // test cases for DELETE route
  it("DELETE project", async () => {
    const deletePromise = api.delete(`/projects/${uid}`)
      .set("authorization", authToken)
      .then(async (response) => {
        console.log("DELETE token-----------", authToken);
        console.log("DELETE uid-----------", uid);
        console.log("DELETED Project-------------", response.body);

        expect(response.status).to.equal(200);

        expect(response.body).to.have.property("data");
        expect(response.body).to.have.property("message", "Deleted project successfully.");
        expect(response.body).to.have.property("errors", null);
      });
    await deletePromise;

    // await projectModel.deleteMany({});

    // deleting just the recently added one which was inserted by our test suite.
    // We need atleast one project in test db as the access_token of project is used in the proposal.test.js & review.test.js
    // if all documents are deleted then there would be nothing to verify the org's access_token upon in proposal.test.js & review.test.js
    await projectModel.findOneAndDelete({}, { sort: { _id: -1 } })
      .then((result) => {
        console.log("Deleting the recently added document------->", result);
      })
      .catch((error) => {
        console.log("Error in deleting the recently added document------->", error);
      });
  });
  // test cases for DELETE route
  it("DELETE project with wrong uid", async () => {
    const deletePromise = api.delete(`/projects/${uid}`)
      .set("authorization", authToken)
      .then(async (response) => {
        console.log("respone-----", response.body);
        expect(response.status).to.equal(422);

        expect(response.body).to.not.have.property("data");
        expect(response.body).to.have.property("message", "Error deleting project.");
        expect(response.body).to.have.property("error", "Error: Project not found.");
      });
    await deletePromise;

    // await projectModel.deleteMany({});

    // deleting just the recently added one without photo which was inserted by our test suite.
    // We need atleast one project in test db as the access_token of project is used in the proposal.test.js & review.test.js
    // if all documents are deleted then there would be nothing to verify the org's access_token upon in proposal.test.js & review.test.js
    await projectModel.findOneAndDelete({}, { sort: { _id: -1 } })
      .then((result) => {
        console.log("Deleting the recently added document------->", result);
      })
      .catch((error) => {
        console.log("Error in deleting the recently added document------->", error);
      });
  });
});
