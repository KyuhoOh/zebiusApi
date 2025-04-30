import { validateParameter } from "../utils/validation.js";
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
    try {
      const t1 = getNanoTime();
      const { k, c, r, t, p } = request.body;

      const t2 = getNanoTime();
      const validationResult = validateParameter(
        k,
        c,
        r,
        t,
        p,
        process.env.SUFFIX == "test" ? false : true
      );
      const t3 = getNanoTime();

      if (validationResult) {
        return reply.code(400).send(validationResult);
      }

      const t4 = getNanoTime();
      global.zev = ((global.zev + p - 1) & TLensMask) + 1;
      const t5 = getNanoTime();

      const newZev = global.zev;
      const oldZev = (newZev - p + TLens) % TLens;
      const a = Math.floor(newZev / ratio);
      const xa = Math.floor(oldZev / ratio);
      const b = newZev - a;
      const A = oldZev < newZev ? a - xa : a + ALens - xa;
      const B = p - A;
      const z = operateEngine(A, B, a, b);
      const t6 = getNanoTime();

      const data = { s: 1, t, c, r, p, z, newZev };

      const t7 = getNanoTime();
      setImmediate(async () => {
        const t8 = getNanoTime();
        try {
          await writeLog(data, fastify);
        } catch (err) {
          console.error("Async Log Error:", err);
        }
        const t9 = getNanoTime();
        if (isDev) {
          console.log(
            "Log Write Time (setImmediate):",
            (t9 - t8).toString(),
            "ns"
          );
        }
      });
      const t10 = getNanoTime();

      if (isDev) {
        console.log("---- Timing Breakdown ----");
        console.log("Total Elapsed Time:", (t10 - t0).toString(), "ns");
        console.log("Request Parse Time:", (t2 - t1).toString(), "ns");
        console.log("Validation Time:", (t3 - t2).toString(), "ns");
        console.log("Data Managed Time:", (t5 - t4).toString(), "ns");
        console.log("Engine Calculation Time:", (t6 - t5).toString(), "ns");
        console.log("SetImmediate Setup Time:", (t7 - t6).toString(), "ns");
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
