import Fastify from "fastify";
import dotenv from "dotenv";
import counterRoute from "./routes/counter.js";

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(counterRoute);

fastify.listen({ port: process.env.PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
