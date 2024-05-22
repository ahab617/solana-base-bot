import config from "../../config.json";
import { numberWithCommas } from "utils";
import { bot } from "../index";

export const sendMessage = async ({
  id,
  message,
  preview = true,
  keyboards,
}: SendMessageInterface) => {
  try {
    await bot?.sendMessage(id, message, {
      parse_mode: "HTML",
      disable_web_page_preview: preview,
      reply_markup: {
        inline_keyboard: keyboards,
      },
    });
  } catch (err) {
    console.log(err);
    console.log("send message error", id, message);
  }
};

export const postMessageWithMedia = async (data: GroupMessageInterface) => {
  try {
    let emoji = data.emoji;
    for (let i = 0; i < data.repeatNumber; i++) {
      emoji += data.emoji;
    }
    if (emoji.length > 50) emoji = emoji.substring(0, 50);
    const newHolder = data.isNewHolder ? `\n⬆️ <b>New Holder</b>` : "";

    let message = `<b><a href="${config.baseTokenScanUrl}/${
      data.tokenAddress
    }">${data.tokenName}</a> Buy!</b>
${emoji}

💲 <b>$${numberWithCommas(data.usdAmount, 3)}</b>
↪️ <b>${numberWithCommas(data.tokenAmount, 3)} ${data.tokenName}</b>
👤 <a href="${config.baseAddressUrl}/${data.buyer}">Buyer</a> / <a href="${
      config.baseTxScanUrl
    }/${data.hash}">TX</a>${newHolder}
💰 <b>Market Cap $${numberWithCommas(Number(data.marketcap), 3)}</b>

📊 <a href="${data.chartLink}">Chart</a> 🦄 <a href="${
      data.buyLink
    }">Buy</a> 🔥 <b>By ${config.ownerChannel}</b>`;

    if (data.type === "image") {
      await bot.sendPhoto(data.groupId, data.mediaId, {
        caption: message,
        parse_mode: "HTML",
      });
    } else {
      await bot.sendVideo(data.groupId, data.mediaId, {
        caption: message,
        parse_mode: "HTML",
      });
    }

    return true;
  } catch (Err) {
    console.log(Err);
    console.log("postMessageWithMedia sending error");
    return false;
  }
};
