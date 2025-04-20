// index.js
import os from "os";
import axios from "axios";
import Fastify from "fastify";
import fastifyRedis from "fastify-redis";
import fastifyMongo from "fastify-mongodb";
import zebius from "./routes/zebius.js";
import zebiusX from "./routes/zebiusX.js";
import status from "./routes/status.js";

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
fastify.register(status, { prefix: "/admin" });

const getInternalIP = () => {
  const interfaces = os.networkInterfaces();
  let ipAddress = "unknown";

  // eth0 인터페이스의 IP를 찾아서 반환
  for (const iface in interfaces) {
    interfaces[iface].forEach((details) => {
      if (details.family === "IPv4" && iface === "eth0") {
        ipAddress = details.address;
      }
    });
  }

  return ipAddress;
};

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    const serverIP = getInternalIP();
    const serverInfo = {
      ip: serverIP,
      on: true,
      time: new Date().toISOString(),
    };
    const webServerIP = `http://${process.env.WEB_IP}:3000/admin/server`;
    await axios.post(webServerIP, serverInfo);
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
