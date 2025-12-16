import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";

let mongoServer;
let adminToken;

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Admin API", () => {
  test("get dashboard stats as admin", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalCamions");
  });
});
