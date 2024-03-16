import { AES, enc } from "crypto-js";
export const encrypt = (text, key) => {
  return AES.encrypt(text, key).toString();
};
export const decrypt = (msg, key) => {
  const bytes = AES.decrypt(msg, key);
  return bytes.toString(enc.Utf8);
};
