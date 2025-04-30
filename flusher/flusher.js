import fs from "fs/promises";
import path from "path";
import Redis from "ioredis";
import { getDateKey } from "./utils/getDateKey.js";
import cron from "node-cron";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const LOG_DIR = "./logs";

async function flushLogs() {
  const { dateKey } = getDateKey(10);
  const redisKey = `log_${dateKey}`;

  try {
    const logs = await redis.lrange(redisKey, 0, -1);
    if (logs.length === 0) {
      console.log(`[${new Date().toISOString()}] No logs for ${redisKey}`);
      return;
    }

    const groupedByClient = {};

    for (const logStr of logs) {
      try {
        const log = JSON.parse(logStr);
        const clientCode = log.c || "unknown";
        if (!groupedByClient[clientCode]) {
          groupedByClient[clientCode] = [];
        }
        groupedByClient[clientCode].push(logStr);
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    }

    await fs.mkdir(LOG_DIR, { recursive: true });
    await Promise.all(
      Object.entries(groupedByClient).map(async ([client, entries]) => {
        const fileName = `log_${dateKey}_${client}.jsonl`;
        const filePath = path.join(LOG_DIR, fileName);
        await fs.writeFile(filePath, entries.join("\n") + "\n", { flag: "wx" });
        console.log(`Wrote ${entries.length} entries to ${fileName}`);
      })
    );

    await redis.del(redisKey);
    console.log(`Flushed and deleted Redis key: ${redisKey}`);
  } catch (err) {
    console.error("flushLogs Error:", err);
  }
}

cron.schedule("3,13,23,33,43,53 * * * *", flushLogs);
