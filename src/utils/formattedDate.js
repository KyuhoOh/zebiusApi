export const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  const hours = today.getHours().toString().padStart(2, "0");
  let minutes = today.getMinutes();
  minutes = Math.floor(minutes / 10) * 10;
  minutes = minutes.toString().padStart(2, "0");

  const output = { YY: year, MM: month, DD: day, hh: hours, mm: minutes };
  // console.log(output);
  return output;
};
// getFormattedDate();
