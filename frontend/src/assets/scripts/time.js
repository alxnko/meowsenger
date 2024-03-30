import dateFormat from "dateformat";
export const now = new Date();
export function toLocalTime(date) {
  let d = new Date(date);
  return d;
}
export function toTodaysTime(date) {
  return dateFormat(date, "hh:MM TT");
}
export function toTime(date) {
  return date.toLocaleString();
}
