// index.js
import Fastify from "fastify";
import fastifyRedis from "fastify-redis";
import fastifyMongo from "fastify-mongodb";
import zebius from "./routes/zebius.js";
import zebiusX from "./routes/zebiusX.js";
import admin from "./routes/admin.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyRedis, {
  host: "redis",
  port: 6379,
});

fastify.register(fastifyMongo, {
  url: "mongodb://mongo:27017/zebius",
});

fastify.get("/", async (request, reply) => {
  return { message: "Hello, this is Zebius-API-Server" };
});
fastify.register(zebius, { prefix: "/api/v1" });
fastify.register(zebiusX, { prefix: "/api/v1" });
fastify.register(admin);

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Fastify server running on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await fastify.close();
  process.exit(0);
});
