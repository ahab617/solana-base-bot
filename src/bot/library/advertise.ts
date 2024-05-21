import { answerCallbacks, bot } from "bot";
import config from "config.json";
import levels from "level.json";
import { sendMessage } from "./index";
import {
  currentTime,
  getDuration,
  getRoundVenomAmount,
  getTimeDiff,
} from "utils/helper";
import { getTransactionData } from "blockchain/monitor/library/scan-api";
import AdController from "controller/adcontroller";
import { startBuyHandler } from "blockchain/monitor/library";
import moment from "moment";

export let advertiseInfo = {} as any;

export const showAdvertiseSetting = async (msg: any) => {
  const chatId = msg.chat.id;
  const groupId = advertiseInfo[chatId]?.groupId;
  let message: SendMessageInterface;
  let caption = advertiseInfo[chatId]?.caption || "Please buy token";
  let link = advertiseInfo[chatId]?.link || "https://dexscreener.com/234234";
  let duration = advertiseInfo[chatId]?.payDuration
    ? getDuration(Number(advertiseInfo[chatId].payDuration)).duration
    : "Duration";
  let amount = advertiseInfo[chatId]?.payDuration
    ? getDuration(Number(advertiseInfo[chatId].payDuration)).amount
    : 0;
  if (!groupId) {
    message = {
      id: chatId,
      message: `<b>This command can only be used in groups.</b>`,
    };
  } else {
    const myAd = (await AdController.find({ filter: { groupId } }))?.[0];

    if (myAd) {
      if (myAd.creator === chatId.toString()) {
        message = {
          id: chatId,
          message: `You already purchased an advertise for this group. Please edit advertise settings if you want.
⌛️ Expire Time 👉👉👉 ${moment(myAd.expireTime * 1000).format(
            "MMM Do YYYY - HH:mm:ss"
          )}`,
          keyboards: [
            [{ text: "🗣 Edit Caption", callback_data: "editCaption" }],
            [{ text: "🔗 Edit Link", callback_data: "editLink" }],
          ],
        };
      } else {
        message = {
          id: chatId,
          message:
            "<b>Another user already purchased an advertise for this group.</b>",
        };
      }
    } else {
      message = {
        id: chatId,
        message: `Welcome to Venom Technology Advertisement! Through our service, your product will be advertised through our Buy Bot (including Trending).

Caption: ${caption}
Link: <a href="${link}">Click Here</a>
Duration: ${duration + " (" + amount + " Venom)"}

Take note of the following: 
1) Please ensure to provide the caption and link;
2) Caption length is between 5 and 100 characters;
3) Link has to start with www/http/https. 
You can view the sample by clicking Preview.`,
        preview: false,
        keyboards: [
          [
            {
              text: "🗣 Provide Caption",
              callback_data: "caption",
            },
            {
              text: "🔗 Provide Link",
              callback_data: "link",
            },
          ],
          [
            {
              text: "🗓 Select Duration",
              callback_data: "duration",
            },
          ],
          [
            {
              text: "✅ Preview",
              callback_data: "preview",
            },
          ],
        ],
      };
    }
  }
  await sendMessage(message);
};

export const setCaption = async (msg: any) => {
  const chatId = msg.chat.id;
  await sendMessage({
    id: chatId,
    message:
      "<b>Please provide the caption to be displayed. Keep the length of the character up to 100.</b>",
  });
  answerCallbacks[chatId] = async function (answer: any) {
    var text = answer.text;
    let repeat = false;
    if (text.length < 5 || text.length > 100) repeat = true;
    if (repeat) {
      await sendMessage({
        id: chatId,
        message: "<b>Invalid caption.</b>",
      });
      await setCaption(msg);
    } else {
      advertiseInfo[chatId] = {
        ...advertiseInfo[chatId],
        caption: text,
      };
      await showAdvertiseSetting(msg);
    }
  };
};

export const setLink = async (msg: any) => {
  const chatId = msg.chat.id;
  await sendMessage({
    id: chatId,
    message: "<b>Please provide the link to be directed.</b>",
  });
  answerCallbacks[chatId] = async function (answer: any) {
    var link = answer.text;
    if (link.startsWith("https://")) {
      advertiseInfo[chatId] = {
        ...advertiseInfo[chatId],
        link: link,
      };
      await showAdvertiseSetting(msg);
    } else {
      await sendMessage({
        id: chatId,
        message: "<b>Invalid link url.</b>",
      });
      await setLink(msg);
    }
  };
};

export const setDuration = async (msg: any) => {
  const chatId = msg.chat.id;
  let keyboards = [] as any[];
  let row = [] as any;
  Object.values(levels).forEach((item) => {
    row.push({
      text: `${item.label} - ${getDuration(item.day).amount} venom`,
      callback_data: `payDuration:${item.day}`,
    });
    if (row.length == 2) {
      keyboards.push(row);
      row = [];
    }
  });
  await sendMessage({
    id: chatId,
    message: "<b>Please select a package from the options below:</b>",
    keyboards: keyboards,
  });
};

export const preview = async (msg: any) => {
  const chatId = msg.chat.id;
  const adInfo = advertiseInfo[chatId];
  if (!adInfo?.caption) {
    await setCaption(msg);
  } else if (!adInfo?.link) {
    await setLink(msg);
  } else if (!adInfo?.payDuration) {
    await setDuration(msg);
  } else {
    await sendMessage({
      id: chatId,
      message: `This link will appear at the bottom of the Buybot message.
Ad: <a href="${adInfo.link}">${adInfo.caption}</a>
Once satisfied, please click 'Proceed to make payment.`,
      keyboards: [
        [
          {
            text: "💲 Proceed To Make Payment",
            callback_data: "provideTransaction",
          },
        ],
      ],
    });
  }
};

export const provideTransaction = async (msg: any) => {
  const chatId = msg.chat.id;
  await sendMessage({
    id: chatId,
    message: `<b>Please pay ${
      getDuration(advertiseInfo[chatId]?.payDuration).amount
    } Venom to the following wallet address:</b>
<code>${config.ownerAddr}</code>
<b>in Venom Network within 5 Minutes.</b>

<b>Once settled, please provide the Transaction hash or Venom scan link using the button below.</b>`,
    keyboards: [
      [
        {
          text: "Enter TX Hash or Venom Scan Link",
          callback_data: "inputHash",
        },
      ],
      [{ text: "Return", callback_data: "return" }],
    ],
  });
};

export const inputHash = async (msg: any) => {
  const chatId = msg.chat.id;
  await sendMessage({
    id: chatId,
    message: "<b>Enter TX Hash or Venom Scan Link.</b>",
  });
  answerCallbacks[chatId] = async function (answer: any) {
    const advertiseData = advertiseInfo[chatId];
    const text = answer.text;
    const hash = text.replace("https://venomscan.com/transactions/", "");
    const txs = await getTransactionData(hash);
    const receiverAddr = "0:" + txs.outMessages[0].dstAddress;
    const amount = getRoundVenomAmount(Number(txs.outMessages[0].messageValue));
    const timeDiff = getTimeDiff(Number(txs.outMessages[0].createdAt));

    const isExist = ((
      await AdController.find({
        filter: {
          hash,
        },
      })
    )?.length > 0) as boolean;
    if (isExist) {
      await sendMessage({
        id: chatId,
        message: "<b>Transaction Hash was already used before.</b>",
      });
      await inputHash(msg);
    } else if (receiverAddr !== config.ownerAddr) {
      await sendMessage({
        id: chatId,
        message:
          "<b>Please check receiver address. I didn't receive money from you.</b>",
      });
      await inputHash(msg);
    } else if (amount < getDuration(advertiseData.payDuration).amount) {
      await sendMessage({
        id: chatId,
        message: "<b>Received payment is not enough.</b>",
      });
      delete advertiseInfo[chatId];
    } else if (timeDiff > 5) {
      await sendMessage({
        id: chatId,
        message: "<b>You didn't pay in 5 minutes.</b>",
      });
      delete advertiseInfo[chatId];
    } else {
      try {
        const adData: AdInterface = {
          creator: chatId.toString(),
          groupId: advertiseData.groupId.toString(),
          caption: advertiseData.caption,
          link: advertiseData.link,
          expireTime: Number(
            currentTime() + advertiseData.payDuration * 24 * 60 * 60
          ),
          hash: hash,
        };
        await AdController.create(adData);
        await sendMessage({
          id: chatId,
          message: "👍 <b>Advertise Purchase Success.</b>",
        });
        delete advertiseInfo[chatId];
        await startBuyHandler();
      } catch (err) {
        await sendMessage({
          id: chatId,
          message: "🚫 <b>Advertise Purchase Failed.</b>",
        });
        delete advertiseInfo[chatId];
        console.log(err);
      }
    }
  };
};

export const editCaption = async (msg: any) => {
  const chatId = msg.chat.id;
  await sendMessage({
    id: chatId,
    message:
      "<b>Please provide the caption to be displayed. Keep the length of the character up to 100.</b>",
  });
  answerCallbacks[chatId] = async function (answer: any) {
    var text = answer.text;
    let repeat = false;
    if (text.length < 5 || text.length > 100) repeat = true;
    if (repeat) {
      await sendMessage({
        id: chatId,
        message: "<b>Invalid caption.</b>",
      });
      await editCaption(msg);
    } else {
      const groupId = advertiseInfo[chatId]?.groupId;
      await AdController.update({
        filter: { chatId, groupId },
        update: { caption: text },
      })
        .then(async () => {
          await sendMessage({
            id: chatId,
            message: "👍 <b>Caption Update Success.</b>",
          });
          await showAdvertiseSetting(msg);
        })
        .catch(async (err) => {
          await sendMessage({
            id: chatId,
            message: "🚫 <b>Caption Update Failed.</>",
          });
          await editCaption(msg);
          console.log(err);
        });
    }
  };
};

export const editLink = async (msg: any) => {
  const chatId = msg.chat.id;
  await sendMessage({
    id: chatId,
    message: "<b>Please edit the link to be directed.</b>",
  });
  answerCallbacks[chatId] = async function (answer: any) {
    var link = answer.text;
    if (link.startsWith("https://")) {
      const groupId = advertiseInfo[chatId]?.groupId;
      await AdController.update({
        filter: { chatId, groupId },
        update: { link: link },
      })
        .then(async () => {
          await sendMessage({
            id: chatId,
            message: "👍 <b>Link Update Success.</b>",
          });
          await showAdvertiseSetting(msg);
        })
        .catch(async (err) => {
          await sendMessage({
            id: chatId,
            message: "🚫 <b>Link Update Failed.</b>",
          });
          await editLink(msg);
          console.log(err);
        });
    } else {
      await sendMessage({
        id: chatId,
        message: "<b>Invalid link url.</b>",
      });
      await editLink(msg);
    }
  };
};
