import { getDateKey } from "./getDateKey.js";

export const writeLog = async (data, fastify) => {
  const redis = fastify.redis;
  const dataStr = JSON.stringify(data);
  const dateKey = getDateKey();
  const logKey = `log:${dateKey}`;

  try {
    await Promise.all([
      redis.set("zev", data.newZev),
      redis.lpush(logKey, dataStr),
    ]);
  } catch (err) {
    console.error("writeLog Error:", err);
  }
};
