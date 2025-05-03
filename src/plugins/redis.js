import fastifyRedis from "@fastify/redis";
import Redis from "ioredis";

export async function redisOn(fastify) {
  try {
    await fastify.register(fastifyRedis, {
      client: new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      }),
      closeClient: true,
    });
    fastify.log.info("Redis 연결됨");
  } catch (err) {
    fastify.log.error("Redis 연결 오류:", err);
    process.exit(1);
  }
}
