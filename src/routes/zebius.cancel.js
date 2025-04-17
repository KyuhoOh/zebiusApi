import { validateParameterX } from "~/src/apiUtilities";

export default defineEventHandler(async (event) => {
  const redis = onRedis();
  const s = 0;
  try {
    const { k, c, r, xR, xT, t, p, z } = await readBody(event);
    const validationResult = validateParameterX(k, c, r, xR, xT, t);
    if (validationResult) {
      return validationResult;
    }
    // Redis 로그기록조회 - 동일 데이터 중복처리방지
    const exist = await redis.exists(`log:*:*:${r}`);
    if (exist) return { status: 409, message: "Already terminated requestId!" };

    const data = {
      s,
      t,
      c,
      r,
      xR,
      xT,
      p,
      z,
    };

    setImmediate(async () => {
      await writeLog(data, true);
    });

    return {
      status: 200,
      data: {
        s,
        t,
        c,
        r,
        xR,
        xT,
        p,
        z,
      },
    };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "Failed to calcurate point" };
  }
});
