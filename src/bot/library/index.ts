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
    let links = ``;
    let adCaption = data?.adCaption;
    let adLink = data?.adLink;
    let advertise = "";

    if (adCaption && adLink) {
      advertise = `<b>Ad: </b><a href="${adLink}">${adCaption}</a>`;
    }

    let stepVal = data.usdPrice;
    const step = 0.1;
    let stepEVal = Math.floor(stepVal / step);
    emoji = emoji + data.emoji.repeat(stepEVal);
    if (emoji.length > 50) emoji = emoji.substring(0, 50);

    data.links.forEach((link) => {
      links = links + `<a href="${link.link}">${link.name}</a>` + " | ";
    });
    links = links.substring(0, links.length - 2);

    let message = `<b><a href="${data.links[0].link}">${
      data.tokenName
    }</a> Buy!</b>
${emoji}

🔀 Got <b>${numberWithCommas(data.amount1, 4)} ${data.symbol1}</b>
🔀 Spent <b>$${numberWithCommas(data.usdPrice, 3)}</b> (<b>${numberWithCommas(
      data.amount2,
      4
    )} ${data.symbol2}</b>)
👤 <a href="${data.buyerLink}">Buyer</a> / <a href="${data.txLink}">TX</a>
🗃 Holding <b>${numberWithCommas(data.balance, 2)}</b>
💸 Market Cap <b>${numberWithCommas(data.marketcap, 0)}</b>

${links}
${advertise}`;

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
