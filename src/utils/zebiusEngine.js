// src/utils/zebiusEngine.js
const zCode = Array.from({ length: 27 }, (_, i) => (1 << (28 - i)) - 2);
const lvA = Number(process.env.A_LV);
const lvB = Number(process.env.B_LV);
const lvT = lvA + lvB;
const TLens = 1 << (lvT - 1);
const ALens = (1 << lvA) - 1;
const TP_V = Number(process.env.TP_V);
export const operateEngine = (lensA, lensB, endA, endB) => {
  let ztc = 0;
  let aIndex = endA - 1 + ALens;
  for (let i = 0; i < lensA; i++, aIndex--) {
    ztc += zCode[31 - Math.clz32((aIndex % ALens) + 1)];
  }

  let bIndex = endB - 1 + TLens - ALens;
  for (let i = 0; i < lensB; i++, bIndex--) {
    ztc += zCode[31 - Math.clz32((bIndex % (TLens - ALens)) + ALens + 1)];
  }

  return Math.floor(ztc * TP_V * 100) / 100;
};
