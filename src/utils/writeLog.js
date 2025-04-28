import { getFormattedDate } from "./formattedDate.js";

const collectionCache = new Map();

function getCollection(db, name) {
  if (!collectionCache.has(name)) {
    collectionCache.set(name, db.collection(name));
  }
  return collectionCache.get(name);
}

export const writeLog = async (result, isCancel, fastify) => {
  const db = fastify.mongo.db;
  const { YY, MM, DD, hh, mm } = getFormattedDate();

  try {
    const dateKey = `${YY}${MM}${DD}${hh}${mm}`;
    const collectionName = `${isCancel ? "xog" : "log"}_${result.c}_${dateKey}`;

    const p = result.p;
    const z = result.z;
    const incP = isCancel ? -p : p;
    const incZ = isCancel ? -z : z;

    const logCollection = getCollection(db, collectionName);
    const monthlyCollection = getCollection(db, "MonthlyData");

    await Promise.all([
      logCollection.insertOne(result),
      monthlyCollection.updateOne(
        { c: result.c },
        {
          $inc: { p: incP, z: incZ, n: 1 },
          $setOnInsert: { c: result.c },
        },
        { upsert: true }
      ),
    ]);
  } catch (err) {
    console.error("writeLog Error:", err);
  }
};
