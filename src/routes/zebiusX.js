// src/routes/zebiusX.js
const isDev = process.env.SUFFIX === "dev";
const getNanoTime = () => (isDev ? process.hrtime.bigint() : 0n);

export default async function (fastify, opts) {
  fastify.post("/zebius.cancel", async (request, reply) => {
    const t0 = getNanoTime();
    try {
      const t1 = getNanoTime();
      const { c, r, xR, xT, t, p, z } = request.body;

      const t2 = getNanoTime();
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

      const t3 = getNanoTime();
      writeLog(data, redis);
      const t4 = getNanoTime();

      if (isDev) {
        console.log("---- Timing Breakdown ----");
        console.log("Total Elapsed Time:", (t4 - t0).toString(), "ns");
        console.log("Request Parse Time:", (t2 - t1).toString(), "ns");
        console.log("Validation Time:", (t3 - t2).toString(), "ns");
        console.log("Log Write Time:", (t4 - t3).toString(), "ns");
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
