import { advertiseInfo, showAdvertiseSetting } from "bot/library/advertise";
import { sendMessage } from "../library";
import { editInfo, showList } from "../library/token";
import { bot } from "bot";

const { Commands } = require("../index.ts");

export default new Commands(
  new RegExp(/^\/start/),
  "Start Bot",
  "start",
  true,
  async (msg: any) => {
    const text = msg.text;
    const params = text.replace("/start", "").trim();
    const fromGroup = params.indexOf("groupId") > -1;
    const setAd = params.indexOf("groupIdForAd") > -1;
    const chatId = msg.chat.id;
    console.log(msg.chat.id);
    console.log(msg.from.id);
    if (!fromGroup) {
      await sendMessage({
        id: chatId,
        message: `👋 <b>Welcome to Solana & Base Chain Buy Bot.</b>
<b>All commands are avialable from group. To add token in your group, please use /setupbuybot command in group.</b>`,
      });
    }
    if (fromGroup) {
      const groupId = setAd
        ? params.replace("groupIdForAd=", "")
        : params.replace("groupId=", "");
      console.log(groupId);
      const admins = await bot.getChatAdministrators(groupId);
      const hasPermission = admins.some((admin) => admin.user.id === chatId);

      advertiseInfo[chatId] = {
        groupId: groupId,
      };
      editInfo[chatId] = {
        groupId: groupId,
      };
      if (setAd) {
        await showAdvertiseSetting(msg);
      } else {
        if (hasPermission) {
          await showList(msg);
        } else {
          await sendMessage({
            id: chatId,
            message: "<b>You don't have permission.</>",
          });
        }
      }
    }
  }
);
