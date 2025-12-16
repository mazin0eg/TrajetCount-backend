import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app.js";
import User from "../src/models/User.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("User API", () => {
  test("register a new user", async () => {
    const uniqueId = Date.now();
    const res = await request(app).post("/api/auth/register")
      .send({ 
        username: `mazine${uniqueId}`, 
        email: `mazine${uniqueId}@test.com`,
        password: "mazine123",
        confirmPassword: "mazine123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(res.body.user.token).toBeDefined();
  });

  test("login the user", async () => {
    await request(app).post("/api/auth/register")
      .send({ 
        username: "mazine", 
        email: "mazine@test.com",
        password: "mazine123",
        confirmPassword: "mazine123"
      });

    const res = await request(app).post("/api/auth/login")
      .send({ 
        email: "mazine@test.com", 
        password: "mazine123" 
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("get the user", async () => {
    await request(app).post("/api/auth/register")
      .send({ 
        username: "mazine", 
        email: "mazine@test.com",
        password: "mazine123",
        confirmPassword: "mazine123"
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ 
        email: "mazine@test.com", 
        password: "mazine123" 
      });

    const accessToken = loginRes.body.token;
    expect(accessToken).toBeDefined();

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("mazine");
  });

  test("fail register with mismatched passwords", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ 
        username: "test", 
        email: "test@test.com",
        password: "pass123",
        confirmPassword: "pass456"
      });

    expect(res.statusCode).toBe(400);
  });

  test("fail login with wrong password", async () => {
    await request(app).post("/api/auth/register")
      .send({ 
        username: "mazine", 
        email: "mazine@test.com",
        password: "mazine123",
        confirmPassword: "mazine123"
      });

    const res = await request(app).post("/api/auth/login")
      .send({ 
        email: "mazine@test.com", 
        password: "wrongpassword" 
      });

    expect(res.statusCode).toBe(401);
  });

  test("fail login with non-existent user", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ 
        email: "notfound@test.com", 
        password: "pass123" 
      });

    expect(res.statusCode).toBe(404);
  });

  test("fail register with existing username", async () => {
    await request(app).post("/api/auth/register")
      .send({ 
        username: "mazine", 
        email: "mazine@test.com",
        password: "mazine123",
        confirmPassword: "mazine123"
      });

    const res = await request(app).post("/api/auth/register")
      .send({ 
        username: "mazine", 
        email: "other@test.com",
        password: "pass123",
        confirmPassword: "pass123"
      });

    expect(res.statusCode).toBe(401);
  });
});
