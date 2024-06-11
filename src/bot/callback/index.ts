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
            { text: "5 minutes", callback_data: "5min" },
            { text: "1 hour", callback_data: "1h" },
            { text: "6 hours", callback_data: "6h" },
          ],
        ],
      });
      break;
    case "5min":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        time: "5min",
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected 5 minutes</b>",
      });
      await chartSettings(msg);
      break;
    case "1h":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        time: "1h",
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected 1 hour</b>",
      });
      await chartSettings(msg);
      break;
    case "6h":
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        time: "6h",
      };
      await sendMessage({
        id: chatId,
        message: "<b>You selected 6 hours</b>",
      });
      await chartSettings(msg);
      break;
    case "savechart":
      await saveChart(msg);
    default:
      break;
  }
};
