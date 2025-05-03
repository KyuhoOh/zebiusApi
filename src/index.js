// src/index.js
import Fastify from "fastify";
import { redisOn } from "./plugins/redis.js";
import { getInternalIP } from "./utils/network.js";
import zebius from "./routes/zebius.js";
import zebiusX from "./routes/zebiusX.js";
import status from "./routes/status.js";
import { validateParameter, validateParameterX } from "./utils/validation.js";
global.zev = 0;
global.logBuffer = [];

async function registerMonitorServer(status) {
  const myIP = getInternalIP();
  const url = `${process.env.WEB_IP}/register`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip: myIP,
        status,
        port: process.env.APP_PORT,
        time: Date.now(),
      }),
    });
    if (!response.ok) {
      throw new Error(
        `관제 서버 ${status ? "등록" : "해제"} 실패: ${response.status}`
      );
    }
    console.log(
      `관제 서버에 ${status ? "성공적으로 등록" : "성공적으로 해제"}되었습니다.`
    );
  } catch (err) {
    console.error(`관제 서버 ${status ? "등록" : "해제"} 중 오류 발생:`, err);
  }
}

async function startServer() {
  const fastify = Fastify({
    logger: { level: "warn" },
    connectionTimeout: 0,
  });

  fastify.addHook("preHandler", (req, reply, done) => {
    const now = Date.now();
    const isReal = process.env.SUFFIX == "test" ? false : true;
    const params = req.body;

    if (req.url.includes("/api/zebiusX")) {
      const validationResult = validateParameterX(params, isReal, now);

      if (validationResult) {
        return reply.code(validationResult.status).send(validationResult);
      }
    } else if (req.url.includes("/api/zebius")) {
      const validationResult = validateParameter(params, isReal, now);

      if (validationResult) {
        return reply.code(validationResult.status).send(validationResult);
      }
    }
    done();
  });

  await redisOn(fastify);

  const zev = await fastify.redis.get("zev");
  global.zev = Number(zev) || 0;

  fastify.get("/", async () => {
    return { msg: "Welcome to Zebius API Server" };
  });
  fastify.register(zebius, { prefix: "/api" });
  fastify.register(zebiusX, { prefix: "/api" });
  fastify.register(status, { prefix: "/admin" });

  await fastify.listen({ port: process.env.APP_PORT, host: "localhost" });

  console.log(
    `Fastify 서버 실행 중 / zev : ${global.zev} / redis.zev : ${zev}`
  );

  await registerMonitorServer(true); // 서버 등록

  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await registerMonitorServer(false); // 서버 해제
    await fastify.close();
    process.exit(0);
  });
}

startServer();
