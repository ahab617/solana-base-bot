import { answerCallbacks, bot } from "bot";
import { sendMessage } from ".";
import {
  getBaseTokenMetadata,
  getPairInformation,
  getSolanaTokenMetadata,
} from "blockchain/monitor/library/scan-api";
import { numberWithCommas } from "utils";

export let advertiseInfo = {} as any;

export const showAdvertise = async (msg: any) => {
  const chatId = msg.chat.id;
  const groupId = advertiseInfo[chatId]?.groupId;
  if (groupId) {
    try {
      await sendMessage({
        id: chatId,
        message: "<b>Please select the correct chain below:</b>",
        keyboards: [
          [
            { text: "Base chain", callback_data: "baseadvertise" },
            { text: "Solana", callback_data: "solanaadvertise" },
          ],
        ],
      });
    } catch (err) {
      console.log("Advertise Error");
    }
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>You can purchase advertise from only groups.</b>",
    });
  }
};

export const inputTokenPairAddress = async (msg: any) => {
  const chatId = msg.chat.id;
  const chain = advertiseInfo[chatId]?.chain;
  if (chain) {
    await sendMessage({
      id: chatId,
      message: `<b>Please input token pair address on ${chain} chain:</b>`,
    });
    answerCallbacks[chatId] = async function (answer: any) {
      const pairAddress = answer.text;
      const pair = await getPairInformation(chain, pairAddress);
      if (pair && pair?.pair) {
        advertiseInfo[chatId] = {
          ...advertiseInfo[chatId],
          pairAddress: pairAddress,
        };
        await sendMessage({
          id: chatId,
          message: "<b>Please input description:</b>",
        });
        await inputDescription(msg);
      } else {
        await sendMessage({
          id: chatId,
          message: "<b>Invalid token pair address.</b>",
        });
        await inputTokenPairAddress(msg);
      }
    };
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>You didn't choose chain.</b>",
    });
    await showAdvertise(msg);
  }
};

export const inputDescription = async (msg: any) => {
  const chatId = msg.chat.id;
  answerCallbacks[chatId] = async function (answer: any) {
    let description = answer.text;
    if (description.trim().length < 5 || description.trim().length > 200) {
      await sendMessage({
        id: chatId,
        message:
          "<b>Invalid text length. Minimum is 5 and Maximum is 200 characters. Please provide the correct description again:</b>",
      });
      await inputDescription(msg);
    } else {
      advertiseInfo[chatId] = {
        ...advertiseInfo[chatId],
        description: description,
      };
      await sendMessage({
        id: chatId,
        message: "📷 <b>Please attach your image/video.</b>",
      });
      await setMedia(msg);
    }
  };
};

export const setMedia = async (msg: any) => {
  const chatId = msg.chat.id;
  answerCallbacks[chatId] = async function (answer: any) {
    const isPhoto = answer.photo?.length > 0;
    const isVideo = answer.video || answer.document || answer.animation;
    if (isPhoto || isVideo) {
      if (isPhoto) {
        advertiseInfo[chatId] = {
          ...advertiseInfo[chatId],
          mediaType: "image",
          mediaId: answer.photo[0]?.file_id,
        };
      } else {
        advertiseInfo[chatId] = {
          ...advertiseInfo[chatId],
          mediaType: "video",
          mediaId:
            answer.video?.file_id ||
            answer.document?.file_id ||
            answer.animation?.file_id,
        };
      }
      await sendMessage({
        id: chatId,
        message: "<b>Please provide telegram group link:</b>",
      });
      await addTelegramGroup(msg);
    } else {
      await sendMessage({
        id: chatId,
        message: "<b>Invalid image or video. Please provide media again.</b>",
      });
      await setMedia(msg);
    }
  };
};

export const addTelegramGroup = async (msg: any) => {
  const chatId = msg.chat.id;
  answerCallbacks[chatId] = async function (answer: any) {
    let link = answer.text;
    if (link.startsWith("https://t.me/")) {
      advertiseInfo[chatId] = {
        ...advertiseInfo[chatId],
        link: link,
      };
      const pair = await getPairInformation(
        advertiseInfo[chatId]?.chain,
        advertiseInfo[chatId]?.pairAddress
      );
      let metadata;
      if (advertiseInfo[chatId]?.chain === "base") {
        metadata = await getBaseTokenMetadata(pair?.pair?.baseToken?.address);
      } else {
        metadata = await getSolanaTokenMetadata(pair?.pair?.baseToken?.address);
      }
      const marketcap =
        Number(pair?.pair?.priceUsd) * Number(metadata?.totalSupply);
      if (advertiseInfo[chatId]?.mediaType === "image") {
        await bot.sendPhoto(chatId, advertiseInfo[chatId]?.mediaId, {
          caption: `${advertiseInfo[chatId]?.description}

💲 <b>$${pair?.pair?.baseToken?.symbol}</b>
↪️ <b>Price $${pair?.pair?.priceUsd}</b>
⬆️ <b>Volume 24H: $${pair?.pair?.volume?.h24}</b>
💰 <b>Market Cap $${numberWithCommas(Number(marketcap), 3)}</b>

<b>Group: </b>${advertiseInfo[chatId]?.link}
📊 <a href="${pair?.pair?.url}">Chart</a> ${
            advertiseInfo[chatId]?.chain === "base"
              ? `🦄 <a href='https://jup.ag/'>Buy</a>`
              : `🪙 <a href='https://jup.ag/'>Buy</a>`
          }`,
          parse_mode: "HTML",
        });
      } else {
        await bot.sendVideo(chatId, advertiseInfo[chatId]?.mediaId, {
          caption: `${advertiseInfo[chatId]?.description}

💲 <b>$${pair?.pair?.baseToken?.symbol}</b>
↪️ <b>Price $${pair?.pair?.priceUsd}</b>
⬆️ <b>Volume 24H: $${pair?.pair?.volume?.h24}</b>
💰 <b>Market Cap $${numberWithCommas(Number(marketcap), 3)}</b>

<b>Group: </b>${advertiseInfo[chatId]?.link}
📊 <a href="${pair?.pair?.url}">Chart</a> ${
            advertiseInfo[chatId]?.chain === "base"
              ? `🦄 <a href='https://jup.ag/'>Buy</a>`
              : `🪙 <a href='https://jup.ag/'>Buy</a>`
          }`,
          parse_mode: "HTML",
        });
      }
      await sendMessage({
        id: chatId,
        message: "<b>Please select your plan:</b>",
        keyboards: [
          [{ text: "Sponsored Post Only", callback_data: "package1" }],
          [
            {
              text: "Standard (Post + 10 times Buy Information)",
              callback_data: "package2",
            },
          ],
          [
            {
              text: "Advanced (Post + 25 times Buy Information)",
              callback_data: "package3",
            },
          ],
          [
            {
              text: "Pro (Post + 50 times Buy Information)",
              callback_data: "package4",
            },
          ],
        ],
      });
    } else {
      await sendMessage({
        id: chatId,
        message:
          "<b>Invalid telegram group link. Please provide the correct link:</b>",
      });
      await addTelegramGroup(msg);
    }
  };
};
