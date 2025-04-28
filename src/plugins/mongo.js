import fastifyMongo from "@fastify/mongodb";

export async function mongoOn(fastify) {
  try {
    await fastify.register(fastifyMongo, {
      url: `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/zebius`,
    });
    fastify.log.info("MongoDB 연결됨");
  } catch (err) {
    fastify.log.error("MongoDB 연결 오류:", err);
    process.exit(1);
  }
}
