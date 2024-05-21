import crypto from "crypto";
import config from "config.json";
import levels from "level.json";
import { duration } from "moment";

export const md5 = (plain: string) =>
  crypto.createHash("md5").update(plain).digest("hex");
export const hmac256 = (message: string, secret: string) =>
  crypto.createHmac("SHA256", secret).update(message).digest("hex");
export const generatePassword = () =>
  (Math.random() * 1e10).toString(36).slice(-12);
export const N = (v: number, p: number = 6) =>
  Math.round(v * 10 ** p) / 10 ** p;
export const lower = (s: string) => s.toLowerCase();

export const currentTime = () => Math.round(new Date().getTime() / 1000);

export const validateEmail = (email: string): boolean =>
  email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  ) !== null;
export const validateUsername = (username: string): boolean =>
  /^[a-zA-Z0-9]{6,20}$/.test(username);
export const validateAddress = (address: string) =>
  /^0x[a-f0-9A-F]{40}$/.test(address);
export const validateTxId = (txId: string) => /^0x[a-f0-9A-F]{64}$/.test(txId);
export const isHttpValid = (str: string) => {
  try {
    const newUrl = new URL(str);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
};

export const generateCode = () => {
  let code = String(Math.round(Math.random() * 8999 + 124));
  if (code.length < 4) code = "0".repeat(4 - code.length) + code;
  return code;
};
export const emailEllipse = (email: string) => {
  if (!email) return "";
  const p = email.lastIndexOf("@");
  return (
    email.slice(0, 3) + "***@" + (p > 8 ? email.slice(p + 1) : email.slice(-8))
  );
};
export const generateID = () =>
  Math.round(new Date().getTime() / 1000 + Math.random() * 5001221051);
// export const isMobileBrowser = (ua: string) => /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))

export const toDayTime = (time: number) => time - (time % 86400);

export const getDuration = (_duration: number) => {
  // let duration: string;
  // let amount: number;
  // if (_duration < 2) {
  //   amount = _duration * config.priceDay;
  // } else if (_duration < 7) {
  //   duration = _duration + " Days";
  // } else {
  //   duration = _duration / 7 + " Week";
  // }

  // if (_duration > 2) {
  //   amount = _duration * config.priceDay - 10;
  // } else {
  //   amount = _duration * config.priceDay;
  // }
  // return { duration: duration, amount: amount as number };
  const item = Object.values(levels).find((a) => a.day == _duration);
  const amount = item?.value || 10000;
  const duration = item.label;
  return { duration: duration, amount: amount as number };
};

export const getRoundVenomAmount = (value: number) => {
  const _amount = value / 1000000000;
  const amount = Math.round(_amount * 10) / 10;
  return amount as number;
};

export const getTimeDiff = (_timestamp: number) => {
  const timeDiff = (currentTime() - _timestamp) / 60;
  return timeDiff as number;
};
