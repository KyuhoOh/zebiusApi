export default async function (fastify, opts) {
  fastify.post("/admin", async (request, reply) => {
    const redis = fastify.redis;
    const db = fastify.mongo;
    try {
      const { passKey, command, n } = request.body;

      if (!passKey || passKey !== process.env.AuthPass) {
        return reply.send("You're not Allowed!");
      }

      switch (command) {
        case "status":
          const zev = await redis.get("zev");
          const cycle = await redis.get("cycle");
          return reply.send({
            status: 200,
            data: { zev, cycle },
          });
          break;
        case "log":
          const logData = db.collection
            .find({
              type: { $regex: /^(log|xog)/ },
            })
            .sort({ createdAt: -1 }) // 최신순 정렬
            .limit(n);
          return reply.send({
            status: 200,
            data: { logData },
          });
          break;
        default:
          break;
      }

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
