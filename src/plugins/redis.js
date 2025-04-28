import fastifyRedis from "@fastify/redis";

export async function redisOn(fastify) {
  try {
    await fastify.register(fastifyRedis, {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      closeClient: false,
    });
    fastify.log.info("Redis 연결됨");
  } catch (err) {
    fastify.log.error("Redis 연결 오류:", err);
    process.exit(1);
  }
}
