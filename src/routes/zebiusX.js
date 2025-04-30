import { validateParameterX } from "../utils/validation.js";

const isDev = process.env.SUFFIX === "dev";
const getNanoTime = () => (isDev ? process.hrtime.bigint() : 0n);

export default async function (fastify, opts) {
  fastify.post("/zebius.cancel", async (request, reply) => {
    const t0 = getNanoTime();
    try {
      const t1 = getNanoTime();
      const { k, c, r, xR, xT, t, p, z } = request.body;

      const t2 = getNanoTime();
      const validationResult = validateParameterX(
        k,
        c,
        r,
        xR,
        xT,
        t,
        process.env.SUFFIX == "test" ? false : true
      );
      const t3 = getNanoTime();

      if (validationResult) {
        return reply.code(400).send(validationResult);
      }

      const data = {
        s: 0,
        t,
        c,
        r,
        xR,
        xT,
        p,
        z,
      };

      const t4 = getNanoTime();
      setImmediate(async () => {
        const t5 = getNanoTime();
        try {
          await writeLog(data, fastify);
        } catch (e) {
          console.error("Async Log Error:", err);
        }
        const t6 = getNanoTime();
        if (isDev) {
          console.log(
            "Log Write Time (setImmediate):",
            (t6 - t5).toString(),
            "ns"
          );
        }
      });
      const t7 = getNanoTime();

      if (isDev) {
        console.log("---- Timing Breakdown ----");
        console.log("Total Elapsed Time:", (t7 - t0).toString(), "ns");
        console.log("Request Parse Time:", (t2 - t1).toString(), "ns");
        console.log("Validation Time:", (t3 - t2).toString(), "ns");
        console.log("SetImmediate Setup Time:", (t4 - t3).toString(), "ns");
      }

      return reply.send({
        data,
      });
    } catch (error) {
      console.error("Error:", error);
      return reply.code(500).send({
        message: "Failed to request ZebiusX",
      });
    }
  });
}
