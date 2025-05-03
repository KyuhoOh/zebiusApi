// server/utils/writeLog.js
import { getDateKey } from "./getDateKey.js";

let logBuffer = [];
let isFlushing = false;
const MAX_BUFFER_LENGTH = 100;

export async function flushBuffer(redis) {
  if (logBuffer.length === 0 || isFlushing) {
    return Promise.resolve();
  }
  console.log("flushing...");
  isFlushing = true;
  const itemsToFlush = [...logBuffer.map(JSON.stringify)];
  logBuffer = [];
  const dateKey = getDateKey();
  const logKey = `log:${dateKey}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.set("zev", global.zev);
    pipeline.lpush(logKey, ...itemsToFlush);
    const results = await pipeline.exec();
    if (results && results[1] && results[1][0]) {
      logBuffer.unshift(...itemsToFlush);
    }
  } catch (error) {
    console.error(
      `Failed to flush ${itemsToFlush.length} items to Redis via pipeline:`,
      error
    );
    logBuffer.unshift(...itemsToFlush);
  } finally {
    isFlushing = false;
  }
}

export const writeLog = (data, redis) => {
  logBuffer.push(data);
  if (logBuffer.length >= MAX_BUFFER_LENGTH && !isFlushing) {
    setImmediate(() => {
      flushBuffer(redis).catch((err) => {
        console.error("Error during scheduled flush execution:", err);
      });
    });
  }
};
