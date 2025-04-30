export const getDateKey = (min = null) => {
  const now = new Date();
  if (min) now.setMinutes(now.getMinutes() - min);
  const YY = now.getFullYear().toString().slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const DD = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const minute = Math.floor(now.getMinutes() / 10) * 10;
  const mm = String(minute).padStart(2, "0");

  const dateKey = `${YY}${MM}${DD}${hh}${mm}`;
  return dateKey;
};
