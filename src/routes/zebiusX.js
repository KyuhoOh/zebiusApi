import { validateParameterX } from "../validation.js";

export default async function (fastify, opts) {
  fastify.post("/zebius.cancel", async (request, reply) => {
    try {
      const { k, c, r, xR, xT, t, p, z } = request.body;
      const validationResult = validateParameterX(k, c, r, xR, xT, t, false);

      if (validationResult) {
        return reply.send(validationResult);
      }

      const data = {
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
          await writeLog(data, true, fastify);
        } catch (e) {
          request.log.error("Logging failed:", e);
        }
      });

      return reply.send({
        status: 200,
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
