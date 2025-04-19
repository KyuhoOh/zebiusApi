import { getFormattedDate } from "./formattedDate.js";

export const writeLog = async (result, isCancel, fastify) => {
  const data = { ...result };
  const db = fastify.mongo.db;
  const { YY, MM, DD, hh, mm } = getFormattedDate();

  try {
    const dateKey = `${YY}${MM}${DD}${hh}${mm}`;
    const collectionName = `${isCancel ? "xog" : "log"}_${data.c}_${dateKey}`;

    const p = data.p;
    const z = data.z;
    const incP = isCancel ? -p : p;
    const incZ = isCancel ? -z : z;

    await db.collection(collectionName).insertOne(data);
    await db.collection("MonthlyData").updateOne(
      { c: data.c },
      {
        $inc: { p: incP, z: incZ, n: 1 },
        $setOnInsert: { c: data.c, p: 0, z: 0, n: 1 },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error(err);
  }
};
