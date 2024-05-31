import { url } from "inspector";
import { sendMessage } from ".";

export let chartInfo = {} as any;

export const setupChartBot = async (msg: any) => {
  const chatId = msg.chat.id;
  const groupId = chartInfo[chatId]?.groupid;

  if (groupId) {
    chartInfo[chatId] = {
      ...chartInfo[chatId],
      groupId: groupId,
    };

    let message;
    message = `<b>🛠 Chart Bot Setup</b>

<b>Please select one you want below.</b>`;
    await sendMessage({
      id: chatId,
      message: message,
      keyboards: [
        [
          { text: "Solana", callback_data: "solanachart" },
          { text: "Base Chain", callback_data: "basechart" },
          { text: "Both", callback_data: "bothchart" },
        ],
        [{ text: "Only one specific coin", callback_data: "specificcoin" }],
      ],
    });
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
  }
};

export const selectChainForChart = async (msg: any, token?: string) => {
  const chatId = msg.chat.id;
  const groupId = chartInfo[chatId]?.groupId;
  const keyboards = [
    [
      {
        text: "Show chart when price will spike a certain percentage",
        callback_data: "static",
      },
    ],
    [
      { text: "Percentage (min is 5%)", callback_data: "static" },
      { text: "Within 1 hour", callback_data: "static" },
    ],
    [
      {
        text: "Show chart when price will decrease a certain percentage",
        callback_data: "static",
      },
    ],
    [
      { text: "Percentage (min is 5%)", callback_data: "static" },
      { text: "Within 1 hour", callback_data: "static" },
    ],
    [
      {
        text: "Show chart when buy orders spike a certain percentage",
        callback_data: "static",
      },
    ],
    [
      { text: "Amount of buys (minimum 25)", callback_data: "static" },
      { text: "Within 1 hour", callback_data: "static" },
    ],
    [
      {
        text: "Show chart when sell orders spike a certain percentage",
        callback_data: "static",
      },
    ],
    [
      { text: "Amount of sells (minimum 25)", callback_data: "static" },
      { text: "Within 1 hour", callback_data: "static" },
    ],
    [
      {
        text: "Show chart when volume spike a certain percentage",
        callback_data: "static",
      },
    ],
    [
      { text: "Percentage (min is 5%)", callback_data: "static" },
      { text: "Within 1 hour", callback_data: "static" },
    ],
    [{ text: "Show chart between marketcap", callback_data: "static" }],
    [
      { text: "Minimal marketcap", callback_data: "static" },
      { text: "Maximum marketcap", callback_data: "static" },
    ],
    [{ text: "Show new pairs", callback_data: "static" }],
    [
      { text: "Yes", callback_data: "static" },
      { text: "No", callback_data: "static" },
    ],
    [{ text: "Auto post to Twitter", callback_data: "static" }],
  ];

  if (groupId) {
    if (token) {
      if (token === "specificcoin") {
        await sendMessage({
          id: chatId,
          message: `<b>Please provide token address.</b>`,
        });
        // answer callback
      } else {
        await sendMessage({
          id: chatId,
          message: `⚙️ <b>Settings for chart parameters</b>

<b>Use the buttons below to customize your charts.</b>`,
          keyboards: keyboards,
        });
      }
    }
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
  }
};
