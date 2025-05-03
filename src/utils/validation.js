// src/utils/validation.js
const API_KEY_REAL = process.env.API_KEY;
const API_KEY_TEST = process.env.API_TEST;
const XPI_KEY_REAL = process.env.XPI_KEY;
const XPI_KEY_TEST = process.env.XPI_TEST;

const isValidTimestamp = (t, now) => t >= 1e12 && t <= now;
const isWithinTimelimit = (t, now) => now - t <= 3000;

// 공통 응답 헬퍼
const bad = (message) => ({ status: 400, message });
const unauthorized = () => ({ status: 401, message: "Not Allowed Key" });

// 일반 파라미터 유효성 검사
export const validateParameter = (params, isReal, time) => {
  const now = time;
  const KEY = isReal ? API_KEY_REAL : API_KEY_TEST;
  const { k, c, r, t, p } = params;

  if (!k || !c || !r || !t || !p) return bad("All Parameters are required");
  if (
    typeof k !== "string" ||
    typeof c !== "string" ||
    typeof r !== "string" ||
    typeof t !== "number" ||
    typeof p !== "number"
  )
    return bad("Parameter values are out of format");
  if (!isValidTimestamp(t, now)) return bad("Timestamp is out of valid range");
  if (!isWithinTimelimit(t, now)) return bad("Timelimit exceeded!");
  if (k !== KEY) return unauthorized();
  if (p <= 0) return bad("Point value must be greater than 0");

  return null; // 모든 검사 통과
};

// X 파라미터 유효성 검사
export const validateParameterX = (params, isReal, time) => {
  const now = time;
  const KEY = isReal ? XPI_KEY_REAL : XPI_KEY_TEST;
  const { k, c, r, xR, t, xT, p } = params;

  if (!k || !c || !r || !xR || !xT || !t || !p)
    return bad("All Parameters are required");
  if (
    typeof k !== "string" ||
    typeof c !== "string" ||
    typeof r !== "string" ||
    typeof xR !== "string" ||
    typeof t !== "number" ||
    typeof xT !== "number" ||
    typeof p !== "number"
  )
    return bad("Parameter values are out of format");
  if (!isWithinTimelimit(t, now)) return bad("Timelimit exceeded!");
  if (!isValidTimestamp(t, now)) return bad("Timestamp is out of valid range");
  if (k !== KEY) return unauthorized();

  return null;
};
