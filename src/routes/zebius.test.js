import { operateEngine, validateParameter } from "~/server/utils/apiUtilities";
import { onRedis } from "~/server/utils/redis";
import { writeLog } from "~/server/utils/writeLog";
const lvA = Number(process.env.A_LV);
const lvB = Number(process.env.B_LV);
const lvT = lvA + lvB;
const TLens = 1 << (lvT - 1);
const ALens = (1 << lvA) - 1;
const ratio = Math.floor(TLens / ALens);
export default defineEventHandler(async (event) => {
  const startWatch = Number(process.hrtime.bigint()) / 1000;
  const redis = onRedis(false);
  const s = 1;

  try {
    const { k, c, r, t, p } = await readBody(event);
    const validationResult = validateParameter(k, c, r, t, p, false);
    if (validationResult) return validationResult;

    if (await redis.exists(`log:*:*:${r}`)) {
      return { status: 409, message: "Already terminated requestId!" };
    }

    const zev = await redis.incrby("zev", p);
    const newZev = ((zev - 1) % TLens) + 1;
    const oldZev = (newZev - p + TLens) % TLens;
    const a = Math.floor(newZev / ratio);
    const xa = Math.floor(oldZev / ratio);
    const b = newZev - a;
    const A = oldZev < newZev ? a - xa : a + ALens - xa;
    const B = p - A;
    const z = operateEngine(A, B, a, b);

    const data = {
      s,
      t,
      c,
      r,
      p,
      z,
      A,
      B,
      a,
      b,
    };

    setImmediate(async () => {
      await writeLog(data, false, false);
    });

    const endWatch = Number(process.hrtime.bigint()) / 1000;
    console.log(`Elapsed Time : ${(endWatch - startWatch).toFixed(0)}μs`);

    return {
      status: 200,
      data: {
        s,
        t,
        c,
        r,
        p,
        z,
      },
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Failed to calculate point" };
  }
});
