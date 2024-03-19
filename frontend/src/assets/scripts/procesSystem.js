import { decrypt } from "./encryption";

export const genSysText = (text, secret, t) => {
  text = decrypt(text, secret);
  let spl = text.split(" ");
  return t(spl[0], spl[1]);
};
