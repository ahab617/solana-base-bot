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
    if (emoji.length > 120) emoji = emoji.substring(0, 120);
    const newHolder = data.isNewHolder ? `\n⬆️ <b>New Holder</b>` : "";

    let message = `<b><a href="${
      data.chain === "base" ? config.baseTokenScanUrl : config.solTokenScanUrl
    }/${data.tokenAddress}">${data.tokenSymbol}</a> Buy!</b>
${emoji}

💲 <b>$${numberWithCommas(data.usdAmount, 3)}</b>
↪️ <b>${numberWithCommas(data.tokenAmount, 3)} ${data.tokenSymbol}</b>
👤 <a href="${
      data.chain === "base" ? config.baseAddressUrl : config.solAddressUrl
    }/${data.buyer}">Buyer</a> / <a href="${
      data.chain === "base" ? config.baseTxScanUrl : config.solTxScanUrl
    }/${data.hash}">TX</a>${newHolder}
💰 <b>Market Cap $${numberWithCommas(Number(data.marketcap), 3)}</b>

📊 <a href="${data.chartLink}">Chart</a> ${
      data.chain === "base" ? "🦄" : "🪙"
    } <a href="${data.buyLink}">Buy</a> 🔥 <b>By ${config.ownerChannel}</b>`;

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

export const postMessageForSpike = async (data: SpikeInterface) => {
  try {
    let spike =
      data.spikeType === "priceuppercent" ||
      data.spikeType === "pricedownpercent"
        ? numberWithCommas(data.spike)
        : numberWithCommas(Math.trunc(data.spike));
    await sendMessage({
      id: Number(data.groupId),
      message: `Charts by: ${config.ownerChannel}

<b>$${
        data.spikeType === "priceuppercent"
          ? "Increase Price"
          : data.spikeType === "pricedownpercent"
          ? "Decrease Price"
          : data.spikeType === "buyamount"
          ? "Buy"
          : "Sell"
      } Spike!$</b>

💲 <b>$${data.symbol}</b>
↪️ <b>${
        data.spikeType === "priceuppercent"
          ? "Price went up"
          : data.spikeType === "pricedownpercent"
          ? "Price went down"
          : data.spikeType === "buyamount"
          ? "Lot of buying"
          : "Lot of selling"
      }</b>
💵 <b>${
        data.spikeType === "priceuppercent" ||
        data.spikeType === "pricedownpercent"
          ? `${data.spike}%`
          : `${spike}+`
      }</b>
🕔 <b>Within ${data.time}</b>
☑️ <b>Market Cap $${numberWithCommas(Number(data.marketcap))}</b>

📊 <a href="${data.url}">Chart</a> | ${
        data.chain === "base"
          ? "🦄 <a href='https://app.uniswap.org'>Buy</a>"
          : "🪙 <a href='https://jup.ag/'>Buy</a>"
      }`,
      keyboards: [
        [
          {
            text: ">>Advertise here",
            url:
              config.botUrl +
              "?start=groupIdForAdvertise=" +
              Number(data.groupId),
          },
        ],
      ],
      preview: false,
    });
  } catch (err) {
    console.log(err);
    console.log("postMessageForPriceSpike sending error");
    return false;
  }
};
