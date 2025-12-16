import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Remorque from "../src/models/Remorque.js";
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
  await Remorque.deleteMany({});
  await Camion.deleteMany({});
});

describe("Remorque API", () => {
  test("create remorque as admin", async () => {
    const res = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.marque).toBe("Schmitz");
  });

  test("fail to create remorque as chauffeur", async () => {
    const res = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${chauffeurToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    expect(res.statusCode).toBe(403);
  });

  test("get all remorques", async () => {
    await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    const res = await request(app)
      .get("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("get remorque by id", async () => {
    const createRes = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    const res = await request(app)
      .get(`/api/remorques/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.marque).toBe("Schmitz");
  });

  test("update remorque as admin", async () => {
    const createRes = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    const res = await request(app)
      .put(`/api/remorques/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        capaciteCharge: 25000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.capaciteCharge).toBe(25000);
  });

  test("delete remorque as admin", async () => {
    const createRes = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    const res = await request(app)
      .delete(`/api/remorques/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("attach remorque to camion", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const remorqueRes = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    const res = await request(app)
      .post("/api/remorques/attach")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        remorqueId: remorqueRes.body._id,
        camionId: camionRes.body._id
      });

    expect(res.statusCode).toBe(200);
  });

  test("detach remorque from camion", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const remorqueRes = await request(app)
      .post("/api/remorques")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Schmitz",
        numeroSerie: "SCH123456",
        capaciteCharge: 24000
      });

    await request(app)
      .post("/api/remorques/attach")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        remorqueId: remorqueRes.body._id,
        camionId: camionRes.body._id
      });

    const res = await request(app)
      .delete(`/api/remorques/${remorqueRes.body._id}/detach`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});
