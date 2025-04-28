import Fastify from "fastify";
import { setupCluster } from "./workers/cluster.js";
import { redisOn } from "./plugins/redis.js";
import { mongoOn } from "./plugins/mongo.js";
import { getInternalIP } from "./utils/network.js";
import zebius from "./routes/zebius.js";
import zebiusX from "./routes/zebiusX.js";
import status from "./routes/status.js";

async function startServer() {
  const fastify = Fastify({
    logger: { level: "warn" },
    connectionTimeout: 0,
  });

  await redisOn(fastify);
  await mongoOn(fastify);

  fastify.get("/", async () => {
    return { msg: "Welcome to Zebius API Server" };
  });

  fastify.register(zebius, { prefix: "/api/v1" });
  fastify.register(zebiusX, { prefix: "/api/v1" });
  fastify.register(status, { prefix: "/admin" });

  await fastify.listen({ port: process.env.APP_PORT, host: "localhost" });

  const myIP = getInternalIP();
  console.log(
    `Fastify 서버 실행 중: http://localhost:${process.env.APP_PORT} (IP: ${myIP})`
  );

  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await fastify.close();
    process.exit(0);
  });
}

setupCluster(startServer);
