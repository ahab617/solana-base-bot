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

export const selectChainForChart = async (msg: any, chain?: string) => {
  const chatId = msg.chat.id;
  const groupId = chartInfo[chatId]?.groupId;
  if (groupId) {
    await sendMessage({ id: chatId, message: `` });
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
  }
};
