export const now = new Date();
export function toLocalTime(date) {
  let d = new Date(date + " UTC");
  return d;
}
export function toTodaysTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  return (
    (hours > 9 ? hours : "0" + hours) +
    ":" +
    (minutes > 9 ? minutes : "0" + minutes)
  );
}
export function toTime(date) {
  let day = date.getDay();
  let month = date.getMonth();
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  return (
    (day > 9 ? day : "0" + day) +
    "." +
    (month > 9 ? month : "0" + month) +
    "." +
    year +
    " " +
    (hours > 9 ? hours : "0" + hours) +
    ":" +
    (minutes > 9 ? minutes : "0" + minutes)
  );
}
