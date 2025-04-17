import Redis from "ioredis";
import { MongoClient } from "mongodb";

const redis = new Redis(process.env.REDIS_URL);
const mongo = new MongoClient(process.env.MONGO_URL);
await mongo.connect();
const db = mongo.db("zebius");
const logs = db.collection("logs");

export default async function (fastify) {
  fastify.post("/count", async (request, reply) => {
    await redis.incr("count");
    const count = await redis.get("count");
    await logs.insertOne({ type: "count", value: count, time: new Date() });
    return { count };
  });

  fastify.get("/count", async () => {
    const count = await redis.get("count");
    return { count: count ?? 0 };
  });
}
