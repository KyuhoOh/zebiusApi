import { validateParameter } from "../utils/validation.js";
import { operateEngine } from "../utils/zebiusEngine.js";
import { writeLog } from "../utils/writeLog.js";

const lvA = Number(process.env.A_LV);
const lvB = Number(process.env.B_LV);
const lvT = lvA + lvB;
const TLens = 1 << (lvT - 1);
const ALens = (1 << lvA) - 1;
const ratio = Math.floor(TLens / ALens);

export default async function (fastify, opts) {
  fastify.post("/zebius", async (request, reply) => {
    const getMicroTime = () => Number(process.hrtime.bigint()) / 1000;
    const t0 = getMicroTime();

    const redis = fastify.redis;

    try {
      const t1 = getMicroTime();
      const { k, c, r, t, p } = request.body;

      const t2 = getMicroTime();
      const validationResult = validateParameter(
        k,
        c,
        r,
        t,
        p,
        process.env.SUFFIX == "test" ? false : true
      );
      const t3 = getMicroTime();

      if (validationResult) {
        return reply.code(400).send(validationResult);
      }

      const t4 = getMicroTime();
      const zev = await redis.incrby("zev", p);
      const t5 = getMicroTime();

      const newZev = ((zev - 1) % TLens) + 1;
      const oldZev = (newZev - p + TLens) % TLens;
      const a = Math.floor(newZev / ratio);
      const xa = Math.floor(oldZev / ratio);
      const b = newZev - a;
      const A = oldZev < newZev ? a - xa : a + ALens - xa;
      const B = p - A;
      const z = operateEngine(A, B, a, b);
      const t6 = getMicroTime();

      const data = { t, c, r, p, z, A, B, a, b };

      const t7 = getMicroTime();
      setImmediate(async () => {
        const t8 = getMicroTime();
        writeLog(data, false, fastify);
        const t9 = getMicroTime();
        console.log(
          "Log Write Time (setImmediate):",
          (t9 - t8).toFixed(0),
          "μs"
        );
      });

      const t10 = getMicroTime();

      console.log("---- Timing Breakdown ----");
      console.log("Total Elapsed Time:", (t10 - t0).toFixed(0), "μs");
      console.log("Request Parse Time:", (t2 - t1).toFixed(0), "μs");
      console.log("Validation Time:", (t3 - t2).toFixed(0), "μs");
      console.log("Redis Eval Time:", (t5 - t4).toFixed(0), "μs");
      console.log("Engine Calculation Time:", (t6 - t5).toFixed(0), "μs");
      console.log("SetImmediate Setup Time:", (t7 - t6).toFixed(0), "μs");

      return reply.send({
        data: { s: 1, t, c, r, p, z },
      });
    } catch (error) {
      console.error("Error:", error);
      return reply
        .code(500)
        .send({ status: "error", message: "Failed to calculate point" });
    }
  });
}
