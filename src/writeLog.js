import { onRedis } from "./redis";
import { onDB } from "./mongo";
import { getFormattedDate } from "./apiUtilities";

const writeLogDB = async (db, redis, collectionName, ref) => {
  const collections = await db.listCollections().toArray();
  const collectionExists = collections.some(
    (collection) => collection.name === collectionName // isDutyDay를 사용
  );
  if (!collectionExists) {
    await db.createCollection(collectionName);
  }
  const collection = db.collection(collectionName);
  let cursor = "0";
  const bulkData = [];
  do {
    const [newCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      ref,
      "COUNT",
      100
    );
    cursor = newCursor;

    for (const key of keys) {
      const rawData = await redis.get(key);
      if (rawData) {
        const data = JSON.parse(rawData);
        bulkData.push({
          updateOne: {
            filter: { requestId: data.requestId },
            update: { $setOnInsert: data },
            upsert: true,
          },
        });
      }
      if (ref == "c:*") await redis.set(key, 0);
      else await redis.del(key);
    }
  } while (cursor !== "0");

  if (bulkData.length > 0) {
    await collection.bulkWrite(bulkData);
  }
};

export const writeLog = async (result, isCancel, isReal = true) => {
  const data = { ...result };
  const redis = onRedis(isReal);
  try {
    const db = await onDB(isReal);
    const today = getFormattedDate();
    if (today.DD === "01") {
      const MM =
        today.MM === "01"
          ? "12"
          : (Number(today.MM) - 1).toString().padStart(2, "0");
      const YY =
        today.MM === "01"
          ? (Number(today.YY) - 1).toString().padStart(2, "0")
          : today.YY;

      const collectionName = `log${YY}${MM}`;
      await writeLogDB(db, redis, collectionName, "c:*");
    }

    // Redis에 카운트 증가 작업
    await redis.incrby(`c:${data.c}:${isCancel ? "xl" : "l"}`, 1);
    await redis.incrby(`c:${data.c}:${isCancel ? "xp" : "p"}`, data.p);
    await redis.incrby(`c:${data.c}:${isCancel ? "xz" : "z"}`, data.z);

    // Redis 키 설정
    const redisKey = `${isCancel ? "x" : "l"}:${data.c}:${data.r}`;
    await redis.set(redisKey, JSON.stringify(data), "EX", 1260);
    const redisCountKey = isCancel ? "cx" : "cl";
    const count = await redis.incr(redisCountKey);
    if (count > 10000) {
      const collectionName = `${isCancel ? "xog" : "log"}_${Math.floor(
        count / 10000
      )}`;
      await writeLogDB(db, redis, collectionName, isCancel ? "x:*" : "l:*");
    }
  } catch (err) {
    console.error(err);
  }
};
