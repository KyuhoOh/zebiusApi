import { validateParameterX } from "../utils/validation.js";

export default async function (fastify, opts) {
  fastify.post("/zebius.cancel", async (request, reply) => {
    try {
      const { k, c, r, xR, xT, t, p, z } = request.body;
      const validationResult = validateParameterX(
        k,
        c,
        r,
        xR,
        xT,
        t,
        process.env.SUFFIX == "test" ? false : true
      );

      if (validationResult) {
        return reply.code(400).send(validationResult);
      }

      const data = {
        s: 2,
        t,
        c,
        r,
        xR,
        xT,
        p,
        z,
      };

      setImmediate(async () => {
        try {
          writeLog(data, true, fastify);
        } catch (e) {
          request.log.error("Logging failed:", e);
        }
      });

      return reply.send({
        data,
      });
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({
        status: "error",
        message: "Failed to calculate point",
      });
    }
  });
}
