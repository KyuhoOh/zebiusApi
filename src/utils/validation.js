export const validateParameter = (k, c, r, t, p, isReal) => {
  const KEY = isReal ? process.env.API_KEY : process.env.API_TEST;
  const now = Date.now();
  // 1. 필수 파라미터 체크 (가장 자주 발생하는 실패 조건)
  if (!k || !c || !r || !t || !p) {
    return { status: 400, message: "All Parameters are required" };
  }

  // 2. 타입 검사 (타입 체크는 2번째로 중요)
  if (
    typeof t !== "number" ||
    typeof p !== "number" ||
    typeof k !== "string" ||
    typeof c !== "string" ||
    typeof r !== "string"
  ) {
    return { status: 400, message: "Parameter values are out of format" };
  }

  // 3. 타임스탬프 범위 체크 (가장 자주 발생할 수 있는 오류)
  if (t < 1000000000000 || t > now) {
    return { status: 400, message: "Timestamp is out of valid range" };
  }

  // 4. 타임리미트 체크
  if (now - t > 3000) {
    return { status: 400, message: "Timelimit exceeded!" };
  }

  // 5. API 키 체크 (덜 자주 발생)
  if (k !== KEY) {
    return { status: 401, message: "Not Allowed Key" };
  }

  // 6. 포인트 값 체크
  if (p <= 0) {
    return { status: 400, message: "Point value must be greater than 0" };
  }

  // 7. 정규 표현식 체크 (입력된 문자열에서 유효하지 않은 문자 검증)
  if (/[^\w-]/.test(c) || /[^\w-]/.test(r)) {
    return {
      status: 400,
      message: "ClientCode or RequestId contains invalid characters",
    };
  }

  // 모든 검사 통과
  return null;
};

export const validateParameterX = (k, c, r, xR, xT, t, isReal) => {
  const KEY = isReal ? process.env.XPI_KEY : process.env.XPI_TEST;
  const now = Date.now(); // 한 번만 호출하여 중복을 줄입니다.

  // 형식 검사
  if (
    typeof t !== "number" ||
    typeof k !== "string" ||
    typeof c !== "string" ||
    typeof r !== "string" ||
    typeof xR !== "string" ||
    typeof xT !== "number"
  ) {
    return {
      status: 400,
      message: "Parameter values are out of format",
    };
  }

  // 필수 파라미터 검사
  if (!k || !c || !r || !t || !xT || !xR) {
    return { status: 400, message: "All Parameters are required" };
  }

  // 타임스탬프 검사
  if (now - t > 3000) {
    return { status: 400, message: "Timelimit exceeded!" };
  }

  // API 키 검사
  if (k !== KEY) {
    return { status: 401, message: "Not Allowed Key" };
  }

  // 유효한 타임스탬프 범위 검사
  if (t < 1000000000000 || t > now) {
    return { status: 400, message: "Timestamp is out of valid range" };
  }

  // 유효하지 않은 문자가 포함된 경우
  const invalidPattern = /[^\w-]/;
  if (invalidPattern.test(c) || invalidPattern.test(r)) {
    return {
      status: 400,
      message: "ClientCode or RequestId contains invalid characters",
    };
  }

  // 모든 검사를 통과한 경우
  return null;
};
