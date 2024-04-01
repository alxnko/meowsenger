import dateFormat from "dateformat";
export const now = new Date();
export function toLocalTime(date) {
  let d = new Date(date);
  return d;
}
export function toTodaysTime(date) {
  return dateFormat(date, "HH:MM");
}
export function toDate(date) {
  let d = new Date();
  if (d.toDateString() == date.toDateString()) {
    return "today";
  } else if (
    new Date(d.valueOf() - 86400000).toDateString() == date.toDateString()
  ) {
    return "yesterday";
  } else {
    return dateFormat(date, "dd.mm.yyyy");
  }
}
export function toTime(date) {
  return dateFormat(date, "dd.mm.yyyy HH:MM");
}
