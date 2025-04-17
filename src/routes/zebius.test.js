// src/routes/zebius.test.js
import { operateEngine, validateParameter } from "../apiUtilities.js";
import { writeLog } from "../writeLog.js";

const lvA = Number(process.env.A_LV);
const lvB = Number(process.env.B_LV);
const lvT = lvA + lvB;
const TLens = 1 << (lvT - 1);
const ALens = (1 << lvA) - 1;
const ratio = Math.floor(TLens / ALens);

export default async function (fastify, opts) {
  fastify.post("/zebius-test", async (request, reply) => {
    const startWatch = Number(process.hrtime.bigint()) / 1000;
    const redis = fastify.redis;
    const s = 1;

    try {
      const { k, c, r, t, p } = request.body;

      const validationResult = validateParameter(k, c, r, t, p, false);
      if (validationResult) {
        return reply.code(400).send(validationResult);
      }

      if (await redis.exists(`log:*:*:${r}`)) {
        return reply.code(409).send({ message: "Already terminated requestId!" });
      }

      const zev = await redis.incrby("zev", p);
      const newZev = ((zev - 1) % TLens) + 1;
      const oldZev = (newZev - p + TLens) % TLens;
      const a = Math.floor(newZev / ratio);
      const xa = Math.floor(oldZev / ratio);
      const b = newZev - a;
      const A = oldZev < newZev ? a - xa : a + ALens - xa;
      const B = p - A;
      const z = operateEngine(A, B, a, b);

      const data = { s, t, c, r, p, z, A, B, a, b };

      setImmediate(async () => {
        await writeLog(data,fastify, false, false);
      });

      const endWatch = Number(process.hrtime.bigint()) / 1000;
      console.log(`Elapsed Time : ${(endWatch - startWatch).toFixed(0)}μs`);

      return reply.send({
        status: 200,
        data: { s, t, c, r, p, z },
      });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ status: "error", message: "Failed to calculate point" });
    }
  });
}
