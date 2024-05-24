import { sendMessage } from "bot/library";
import { editInfo, showList } from "bot/library/token";
import { chartInfo, setupChartBot } from "bot/library/chart";
import { bot } from "bot";

const { Commands } = require("../index.ts");

export default new Commands(
  new RegExp(/^\/start/),
  "Start Bot",
  "start",
  true,
  async (msg: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const params = text.replace("/start", "").trim();
    const fromGroup = params.indexOf("groupId") > -1;
    const setChart = params.indexOf("groupIdForChart") > -1;

    if (!fromGroup) {
      await sendMessage({
        id: chatId,
        message: `👋 <b>Welcome to Solana & Base Chain Buy Bot.</b>
<b>All commands are avialable from group. To add token in your group, please use /setupbuybot command in group.</b>`,
      });
    }

    if (fromGroup) {
      const groupId = setChart
        ? params.replace("groupIdForChart=", "")
        : params.replace("groupId=", "");
      const admins = await bot.getChatAdministrators(groupId);
      const hasPermission = admins.some((admin) => admin.user.id === chatId);

      chartInfo[chatId] = {
        groupid: groupId,
      };

      editInfo[chatId] = {
        groupId: groupId,
      };

      if (hasPermission) {
        if (setChart) {
          // check if the chart information exists in this group
          await setupChartBot(msg);
        } else {
          await showList(msg);
        }
      } else {
        await sendMessage({
          id: chatId,
          message: "<b>You don't have permission.</>",
        });
      }
    }
  }
);
