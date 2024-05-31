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

  if (groupId) {
    if (token) {
      const keyboards = [
        [
          {
            text: "Show chart when price will increase a certain percentage",
            callback_data: "static",
          },
        ],
        [
          { text: "Percentage (min is 5%)", callback_data: "priceuppercent" },
          { text: "Within 1 hour", callback_data: "priceuptime" },
        ],
        [
          {
            text: "Show chart when price will decrease a certain percentage",
            callback_data: "static",
          },
        ],
        [
          { text: "Percentage (min is 5%)", callback_data: "pricedownpercent" },
          { text: "Within 1 hour", callback_data: "pricedowntime" },
        ],
        [
          {
            text: "Show chart when buy orders spike a certain percentage",
            callback_data: "static",
          },
        ],
        [
          { text: "Amount of buys (minimum 25)", callback_data: "buyamount" },
          { text: "Within 1 hour", callback_data: "buytime" },
        ],
        [
          {
            text: "Show chart when sell orders spike a certain percentage",
            callback_data: "static",
          },
        ],
        [
          { text: "Amount of sells (minimum 25)", callback_data: "sellamount" },
          { text: "Within 1 hour", callback_data: "selltime" },
        ],
        [
          {
            text: "Show chart when volume spike a certain percentage",
            callback_data: "static",
          },
        ],
        [
          { text: "Percentage (min is 5%)", callback_data: "volumepercent" },
          { text: "Within 1 hour", callback_data: "volumetime" },
        ],
        [{ text: "Show chart between marketcap", callback_data: "static" }],
        [
          { text: "Minimal marketcap", callback_data: "mincap" },
          { text: "Maximum marketcap", callback_data: "maxcap" },
        ],
        [{ text: "Show new pairs", callback_data: "static" }],
        [
          { text: "Yes", callback_data: "yes" },
          { text: "No", callback_data: "no" },
        ],
        [{ text: "Auto post to Twitter", callback_data: "twitter" }],
      ];
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

export const settingForChart = async () => {};
