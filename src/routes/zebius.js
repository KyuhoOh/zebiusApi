// src/routes/zebius.js
import { operateEngine } from "../utils/zebiusEngine.js";
import { writeLog } from "../utils/writeLog.js";

const lvA = Number(process.env.A_LV);
const lvB = Number(process.env.B_LV);
const lvT = lvA + lvB;
const TLens = 1 << (lvT - 1);
const TLensMask = TLens - 1;
const ALens = (1 << lvA) - 1;
const ratio = Math.floor(TLens / ALens);
const isDev = process.env.SUFFIX === "dev";
const getNanoTime = () => (isDev ? process.hrtime.bigint() : 0n);

export default async function (fastify, opts) {
  fastify.post("/zebius", async (request, reply) => {
    const t0 = getNanoTime();
    const redis = fastify.redis;
    try {
      const t1 = getNanoTime();
      const { c, r, t, p } = request.body;

      const t2 = getNanoTime();
      global.zev = ((global.zev + p - 1) & TLensMask) + 1;
      const newZev = global.zev;
      const oldZev = (newZev - p + TLens) % TLens;
      const a = Math.floor(newZev / ratio);
      const xa = Math.floor(oldZev / ratio);
      const b = newZev - a;
      const A = oldZev < newZev ? a - xa : a + ALens - xa;
      const B = p - A;

      const t3 = getNanoTime();
      const z = operateEngine(A, B, a, b);

      const t4 = getNanoTime();
      const data = { s: 1, t, c, r, p, z, newZev };
      writeLog(data, redis);
      const t5 = getNanoTime();

      if (isDev) {
        console.log("---- Timing Breakdown ----");
        console.log("Total Elapsed Time:", (t5 - t0).toString(), "ns");
        console.log("Request Parse Time:", (t2 - t1).toString(), "ns");
        console.log("Data Managed Time:", (t3 - t2).toString(), "ns");
        console.log("Engine Calculation Time:", (t4 - t3).toString(), "ns");
        console.log("Log Write Time:", (t5 - t4).toString(), "ns");
      }

      return reply.send({
        data,
      });
    } catch (error) {
      console.error("Error:", error);
      return reply.code(500).send({ message: "Failed to request Zebius" });
    }
  });
}
