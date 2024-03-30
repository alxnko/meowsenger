export const findMessageId = function (messages, id) {
  let start = 0,
    end = messages.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);

    if (messages[mid].id === id) return mid;
    else if (messages[mid].id < id) start = mid + 1;
    else end = mid - 1;
  }

  return -1;
};
