import { sendMessage } from "bot/library";
import {
  chartInfo,
  chartPairAddress,
  chartSettings,
  inputSpikeChange,
  saveChart,
} from "bot/library/chart";
import {
  addToken,
  editToken,
  editMedia,
  editEmoji,
  editMin,
  editStep,
  deleteToken,
  tokenInfo,
  editInfo,
  confirmPair,
  botSetup,
} from "bot/library/token";

export const callBackHandler = async (msg: any, _action: string) => {
  const chatId = msg.chat.id;
  const groupId = tokenInfo[chatId]?.groupId;
  const action = _action.split("_");

  let message: SendMessageInterface;

  if (action[1]) {
    editInfo[chatId] = {
      ...editInfo[chatId],
      addr: action[1],
    };
  }
  switch (action[0]) {
    case "buybotsetup":
      await botSetup(msg);
      break;
    case "base":
      message = {
        id: chatId,
        message: `⚙️ <b>Send the token address to track</b>`,
      };
      await sendMessage(message);
      await addToken(msg, groupId!, "base");
      break;
    case "solana":
      message = {
        id: chatId,
        message: `⚙️ <b>Send the token address to track</b>`,
      };
      await sendMessage(message);
      await addToken(msg, groupId!, "solana");
      break;
    case "editToken":
      await editToken(msg);
      break;
    case "editMedia":
      await editMedia(msg);
      break;
    case "editEmoji":
      await editEmoji(msg);
      break;
    case "editMin":
      await editMin(msg);
      break;
    case "editStep":
      await editStep(msg);
      break;
    case "deleteToken":
      await deleteToken(msg);
      break;
    case "selectPair":
      await confirmPair(msg, action[1]);
      break;
    case "basechart":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        chain: "base",
      };
      await sendMessage({
        id: chatId,
        message:
          "<b>You selected base chain. Please input token pair address:</b>",
      });
      await chartPairAddress(msg);
      break;
    case "solanachart":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        chain: "solana",
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected solana. Please input token pair address:</b>",
      });
      await chartPairAddress(msg);
      break;
    case "priceuppercent":
      await inputSpikeChange(msg, "priceuppercent");
      break;
    case "changeTime":
      await sendMessage({
        id: chatId,
        message: "<b>Please select time:</b>",
        keyboards: [
          [
            { text: "15 minutes", callback_data: "15min" },
            { text: "30 minutes", callback_data: "30min" },
            { text: "60 minutes", callback_data: "60min" },
          ],
        ],
      });
      break;
    case "15min":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        time: 15,
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected 15 minutes</b>",
      });
      await chartSettings(msg);
      break;
    case "30min":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        time: 30,
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected 30 minutes</b>",
      });
      await chartSettings(msg);
      break;
    case "60min":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        time: 60,
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected 60 minutes</b>",
      });
      await chartSettings(msg);
      break;
    case "savechart":
      await saveChart(msg);
    default:
      break;
  }
};
