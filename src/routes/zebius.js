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
    const redis = fastify.redis;
    const t0 = getNanoTime();
    const { c, r, t, p } = request.body;
    const t1 = getNanoTime();
    global.zev = ((global.zev + p - 1) & TLensMask) + 1;
    const newZev = global.zev;
    const oldZev = (newZev - p + TLens) & TLensMask;
    const a = Math.floor(newZev / ratio);
    const xa = Math.floor(oldZev / ratio);
    const b = newZev - a;
    const A = oldZev < newZev ? a - xa : a + ALens - xa;
    const B = p - A;
    const t2 = getNanoTime();
    const z = operateEngine(A, B, a, b);
    const t3 = getNanoTime();
    const data = { s: 1, t, c, r, p, z, newZev };
    writeLog(data, redis);
    const t4 = getNanoTime();

    if (isDev) {
      const lapTime = {
        total: t4 - t0,
        t1_t0: t1 - t0,
        t2_t1: t2 - t1,
        t3_t2: t3 - t2,
        t4_t3: t4 - t3,
      };
      const lapTimeForJson = Object.fromEntries(
        Object.entries(lapTime).map(([key, value]) => [key, value.toString()])
      );
      data.lapTime = lapTimeForJson;
    }

    return reply.send({
      ...data,
    });
  });
}
