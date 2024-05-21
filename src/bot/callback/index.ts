import { sendMessage } from "bot/library";
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
import {
  advertiseInfo,
  editCaption,
  editLink,
  inputHash,
  preview,
  provideTransaction,
  setCaption,
  setDuration,
  setLink,
  showAdvertiseSetting,
} from "bot/library/advertise";

export const callBackHandler = async (msg: any, _action: string) => {
  const chatId = msg.chat.id;
  const groupId = tokenInfo[chatId]?.groupId;
  const action = _action.split("_");
  const payAct = _action.split(":");

  let message: SendMessageInterface;

  if (payAct[1]) {
    advertiseInfo[chatId] = {
      ...advertiseInfo[chatId],
      payDuration: Number(payAct[1]),
    };
    switch (payAct[0]) {
      case "payDuration":
        await showAdvertiseSetting(msg);
        break;
      default:
        break;
    }
  }
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
    case "caption":
      await setCaption(msg);
      break;
    case "link":
      await setLink(msg);
      break;
    case "duration":
      await setDuration(msg);
      break;
    case "preview":
      await preview(msg);
      break;
    case "provideTransaction":
      await provideTransaction(msg);
      break;
    case "inputHash":
      await inputHash(msg);
      break;
    case "editCaption":
      await editCaption(msg);
      break;
    case "editLink":
      await editLink(msg);
      break;
    case "return":
      await showAdvertiseSetting(msg);
      break;
    default:
      break;
  }
};
