import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Camion from "../src/models/comion.js";

let mongoServer;
let adminToken;
let chauffeurToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  const uniqueId = Date.now();
  const adminRes = await request(app).post("/api/auth/register")
    .send({ 
      username: `admin${uniqueId}`, 
      email: `admin${uniqueId}@test.com`,
      password: "admin123",
      confirmPassword: "admin123"
    });
  
  await User.findByIdAndUpdate(adminRes.body.user.id, { role: "admin" });
  adminToken = adminRes.body.user.token;
  
  const chauffeurRes = await request(app).post("/api/auth/register")
    .send({ 
      username: `chauffeur${uniqueId}`, 
      email: `chauffeur${uniqueId}@test.com`,
      password: "chauffeur123",
      confirmPassword: "chauffeur123"
    });
  chauffeurToken = chauffeurRes.body.user.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Camion.deleteMany({});
});

describe("Camion API", () => {
  test("create camion as admin", async () => {
    const res = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.immatriculation).toBe("ABC123");
  });

  test("fail to create camion as chauffeur", async () => {
    const res = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${chauffeurToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    expect(res.statusCode).toBe(403);
  });

  test("get all camions", async () => {
    await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const res = await request(app)
      .get("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("get camion by id", async () => {
    const createRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const res = await request(app)
      .get(`/api/camions/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.immatriculation).toBe("ABC123");
  });

  test("update camion as admin", async () => {
    const createRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const res = await request(app)
      .put(`/api/camions/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        kilometrage: 60000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.kilometrage).toBe(60000);
  });

  test("delete camion as admin", async () => {
    const createRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const res = await request(app)
      .delete(`/api/camions/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(201);
  });

  test("get available camions", async () => {
    await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000,
        disponible: true
      });

    const res = await request(app)
      .get("/api/camions/available")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
