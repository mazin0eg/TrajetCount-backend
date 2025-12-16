import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Trajet from "../src/models/Trajet.js";
import Pneu from "../src/models/Pneu.js";
import Camion from "../src/models/comion.js";

let mongoServer;
let chauffeurToken;
let chauffeurId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  const uniqueId = Date.now();
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
  await Pneu.deleteMany({});
  await Camion.deleteMany({});
});

describe("Chauffeur API", () => {
  test("get mes trajets as chauffeur", async () => {
    const res = await request(app)
      .get("/api/chauffeur/trajets")
      .set("Authorization", `Bearer ${chauffeurToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("get mon trajet by id as chauffeur", async () => {
    const camion = await Camion.create({
      immatriculation: "ABC123",
      marque: "Mercedes",
      kilometrage: 50000
    });

    const trajet = await Trajet.create({
      pointDepart: "Paris",
      destination: "Lyon",
      camion: camion._id,
      chauffeur: chauffeurId
    });

    const res = await request(app)
      .get(`/api/chauffeur/trajets/${trajet._id}`)
      .set("Authorization", `Bearer ${chauffeurToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("get mes pneus as chauffeur", async () => {
    const res = await request(app)
      .get("/api/chauffeur/pneus")
      .set("Authorization", `Bearer ${chauffeurToken}`);

    expect(res.statusCode).toBe(200);
  });

  test("update pneu status as chauffeur", async () => {
    const camion = await Camion.create({
      immatriculation: "ABC123",
      marque: "Mercedes",
      kilometrage: 50000
    });

    const pneu = await Pneu.create({
      marque: "Michelin",
      numeroSerie: "MICH123456",
      position: "avant gauche",
      vehiculeType: "Camion",
      vehicule: camion._id,
      kilometrageActuel: 10000
    });

    const res = await request(app)
      .put(`/api/chauffeur/pneus/${pneu._id}`)
      .set("Authorization", `Bearer ${chauffeurToken}`)
      .send({
        statut: "usé"
      });

    expect(res.statusCode).toBe(200);
  });
});
