import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Trajet from "../src/models/Trajet.js";
import Camion from "../src/models/comion.js";

let mongoServer;
let adminToken;
let chauffeurToken;
let chauffeurId;

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
  chauffeurId = chauffeurRes.body.user.id;
  chauffeurToken = chauffeurRes.body.user.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Trajet.deleteMany({});
  await Camion.deleteMany({});
});

describe("Trajet API", () => {
  test("create trajet as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const res = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.pointDepart).toBe("Paris");
  });

  test("fail to create trajet as chauffeur", async () => {
    const res = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${chauffeurToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon"
      });

    expect(res.statusCode).toBe(403);
  });

  test("get all trajets", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    const res = await request(app)
      .get("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("get trajet by id", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    const res = await request(app)
      .get(`/api/trajets/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.pointDepart).toBe("Paris");
  });

  test("update trajet as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    const res = await request(app)
      .put(`/api/trajets/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        destination: "Marseille"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.destination).toBe("Marseille");
  });

  test("delete trajet as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    const res = await request(app)
      .delete(`/api/trajets/${createRes.body._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("start trajet as chauffeur", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    const res = await request(app)
      .patch(`/api/trajets/${createRes.body._id}/start`)
      .set("Authorization", `Bearer ${chauffeurToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("complete trajet as chauffeur", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id,
        chauffeur: chauffeurId
      });

    await request(app)
      .patch(`/api/trajets/${createRes.body._id}/start`)
      .set("Authorization", `Bearer ${chauffeurToken}`);

    const res = await request(app)
      .patch(`/api/trajets/${createRes.body._id}/complete`)
      .set("Authorization", `Bearer ${chauffeurToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("assign trajet to chauffeur as admin", async () => {
    const camionRes = await request(app)
      .post("/api/camions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        immatriculation: "ABC123",
        marque: "Mercedes",
        kilometrage: 50000
      });

    const createRes = await request(app)
      .post("/api/trajets")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        pointDepart: "Paris",
        destination: "Lyon",
        camion: camionRes.body._id
      });

    const res = await request(app)
      .post("/api/trajets/assign")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        trajetId: createRes.body._id,
        chauffeurId: chauffeurId
      });

    expect(res.statusCode).toBe(200);
  });
});
