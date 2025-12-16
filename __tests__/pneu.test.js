import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Pneu from "../src/models/Pneu.js";
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
  await Pneu.deleteMany({});
  await Camion.deleteMany({});
});

describe("Pneu API", () => {
  test("add pneu as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const res = await request(app)
      .post("/api/pneus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Michelin",
        numeroSerie: "MICH123456",
        position: "avant gauche",
        vehiculeType: "Camion",
        vehicule: camionRes.body._id,
        kilometrageActuel: 10000
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.marque).toBe("Michelin");
  });

  test("fail to add pneu as chauffeur", async () => {
    const res = await request(app)
      .post("/api/pneus")
      .set("Authorization", `Bearer ${chauffeurToken}`)
      .send({
        marque: "Michelin",
        numeroSerie: "MICH123456"
      });

    expect(res.statusCode).toBe(403);
  });

  test("get all pneus as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    await request(app)
      .post("/api/pneus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Michelin",
        numeroSerie: "MICH123456",
        position: "avant gauche",
        vehiculeType: "Camion",
        vehicule: camionRes.body._id,
        kilometrageActuel: 10000
      });

    const res = await request(app)
      .get("/api/pneus")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("get pneus by vehicule", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    await request(app)
      .post("/api/pneus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Michelin",
        numeroSerie: "MICH123456",
        position: "avant gauche",
        vehiculeType: "Camion",
        vehicule: camionRes.body._id,
        kilometrageActuel: 10000
      });

    const res = await request(app)
      .get(`/api/pneus/vehicule/Camion/${camionRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("update pneu as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/pneus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Michelin",
        numeroSerie: "MICH123456",
        position: "avant gauche",
        vehiculeType: "Camion",
        vehicule: camionRes.body._id,
        kilometrageActuel: 10000
      });

    const res = await request(app)
      .put(`/api/pneus/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        kilometrageActuel: 15000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.kilometrageActuel).toBe(15000);
  });

  test("delete pneu as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/pneus")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        marque: "Michelin",
        numeroSerie: "MICH123456",
        position: "avant gauche",
        vehiculeType: "Camion",
        vehicule: camionRes.body._id,
        kilometrageActuel: 10000
      });

    const res = await request(app)
      .delete(`/api/pneus/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("get pneus needing maintenance", async () => {
    const res = await request(app)
      .get("/api/pneus/maintenance")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
