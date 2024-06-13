import { sendMessage } from "bot/library";
import {
  advertiseInfo,
  chooseToken,
  deleteAdvertise,
  inputHash,
  inputTokenPairAddress,
} from "bot/library/advertise";
import {
  chartInfo,
  chartPairAddress,
  chartSettings,
  deleteChart,
  inputSpikeChange,
  saveChart,
  selectTime,
  showTime,
} from "bot/library/chart";
import {
  inputWalletAddress,
  saveAdSetting,
  showPackageSetting,
} from "bot/library/setupadvertisement";
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
  const payAction = _action.split(":");

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
    case "pricedownpercent":
      await inputSpikeChange(msg, "pricedownpercent");
      break;
    case "buyamount":
      await inputSpikeChange(msg, "buyamount");
      break;
    case "sellamount":
      await inputSpikeChange(msg, "sellamount");
      break;
    case "priceuptime":
      await showTime(msg, "priceup");
      break;
    case "pricedowntime":
      await showTime(msg, "pricedown");
      break;
    case "buytime":
      await showTime(msg, "buy");
      break;
    case "selltime":
      await showTime(msg, "sell");
      break;
    case "5min":
      await selectTime(msg, "5min");
      break;
    case "1h":
      await selectTime(msg, "1h");
      break;
    case "6h":
      await selectTime(msg, "6h");
      break;
    case "savechart":
      await saveChart(msg);
      break;
    case "deletechart":
      await deleteChart(msg);
      break;
    case "baseadvertise":
      advertiseInfo[chatId] = {
        ...advertiseInfo[chatId],
        chain: "base",
      };
      await inputTokenPairAddress(msg);
      break;
    case "solanaadvertise":
      advertiseInfo[chatId] = {
        ...advertiseInfo[chatId],
        chain: "solana",
      };
      await inputTokenPairAddress(msg);
      break;
    case "package1setting":
      await showPackageSetting(msg, "package1setting");
      break;
    case "package2setting":
      await showPackageSetting(msg, "package2setting");
      break;
    case "package3setting":
      await showPackageSetting(msg, "package3setting");
      break;
    case "package4setting":
      await showPackageSetting(msg, "package4setting");
      break;
    case "adminwallet":
      await inputWalletAddress(msg);
      break;
    case "saveadsetting":
      await saveAdSetting(msg);
      break;
    case "package1":
      await chooseToken(msg, "package1");
      break;
    case "package2":
      await chooseToken(msg, "package2");
      break;
    case "package3":
      await chooseToken(msg, "package3");
      break;
    case "package4":
      await chooseToken(msg, "package4");
      break;
    case "deleteadvertise":
      await deleteAdvertise(msg);
      break;
    default:
      break;
  }

  switch (payAction[0]) {
    case "payPEKE":
      await inputHash(msg, "PEKE", Number(payAction[1]));
      break;
    case "paySOL":
      await inputHash(msg, "SOL", Number(payAction[1]));
      break;
    default:
      break;
  }
};
