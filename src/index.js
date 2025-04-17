import Fastify from 'fastify';
import fastifyRedis from 'fastify-redis';
import fastifyMongo from 'fastify-mongodb';

const fastify = Fastify({
  logger: true
});

// Redis 설정
fastify.register(fastifyRedis, {
  host: 'redis', // Docker Compose에서 지정한 Redis 서비스 이름
  port: 6379
});

// MongoDB 설정
fastify.register(fastifyMongo, {
  url: 'mongodb://mongo:27017/zebius', // Docker Compose에서 지정한 MongoDB 서비스 이름
});

// API 엔드포인트 예시
fastify.post('/', async (request, reply) => {
  return { data: 'hello! this is zebiusApiServer' };
});

// 서버 시작
const start = async () => {
  try {
    await fastify.listen(3000);
    console.log('Fastify server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
