// src/routes/zebius.test.js
import { validateParameter } from "../validation.js";
import { operateEngine } from "../zebiusEngine.js";
import { writeLog } from "../writeLog.js";

const lvA = Number(process.env.A_LV);
const lvB = Number(process.env.B_LV);
const lvT = lvA + lvB;
const TLens = 1 << (lvT - 1);
const ALens = (1 << lvA) - 1;
const ratio = Math.floor(TLens / ALens);

export default async function (fastify, opts) {
  fastify.post("/zebius", async (request, reply) => {
    const startWatch = Number(process.hrtime.bigint()) / 1000;
    const redis = fastify.redis;

    try {
      const { k, c, r, t, p } = request.body;
      const validationResult = validateParameter(k, c, r, t, p, false);

      if (validationResult) {
        return reply.code(400).send(validationResult);
      }

      const lua = `
        local current = redis.call("INCRBY", KEYS[1], ARGV[1])
        local max = tonumber(ARGV[2])
        local cycled = ((current-1) % max)+1
        if cycled == 0 then
          redis.call("INCR", "cycle")
        end
        redis.call("SET", KEYS[1], cycled)
        return cycled
      `;

      const newZev = await redis.eval(lua, 1, "zev", p, TLens);
      const oldZev = (newZev - p + TLens) % TLens;
      const a = Math.floor(newZev / ratio);
      const xa = Math.floor(oldZev / ratio);
      const b = newZev - a;
      const A = oldZev < newZev ? a - xa : a + ALens - xa;
      const B = p - A;
      const z = operateEngine(A, B, a, b);
      const data = { t, c, r, p, z, A, B, a, b };

      const endWatch = Number(process.hrtime.bigint()) / 1000;
      console.log(`Elapsed Time : ${(endWatch - startWatch).toFixed(0)}μs`);

      setImmediate(async () => {
        await writeLog(data, false, fastify);
      });

      return reply.send({
        status: 200,
        data: { s: 1, t, c, r, p, z },
      });
    } catch (error) {
      console.error(error);
      return reply
        .code(500)
        .send({ status: "error", message: "Failed to calculate point" });
    }
  });
}
