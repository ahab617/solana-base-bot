import { sendMessage } from "bot/library";
import { advertiseInfo, showAdvertiseSetting } from "bot/library/advertise";
import config from "config.json";

const { Commands } = require("../index.ts");

export default new Commands(
  new RegExp(/^\/setad/),
  "Request advertisement",
  "setad",
  true,
  async (msg: any) => {
    const chatId = msg.chat.id;
    const fromGroup = chatId !== msg.from.id;
    let message: SendMessageInterface;
    const groupId = advertiseInfo[chatId]?.groupId;
    if (groupId) {
      await showAdvertiseSetting(msg);
    } else {
      if (!fromGroup) {
        message = {
          id: chatId,
          message: "<b>This command can only be used in groups</b>",
        };
      } else {
        message = {
          id: chatId,
          message: `🛠 <b>Click button below to request your advertsement.</b>
  
  `,
          keyboards: [
            [
              {
                text: "➡️ Request advertisement",
                url: config.botUrl + "?start=groupIdForAd=" + chatId,
              },
            ],
          ],
        };
      }
      await sendMessage(message);
    }
  }
);
