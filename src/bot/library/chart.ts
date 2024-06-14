import { answerCallbacks } from "bot";
import { sendMessage } from ".";
import { startBuyHandler } from "blockchain/monitor/library";
import { ChartController } from "controller";

export let chartInfo = {} as any;

export const setupChartBot = async (msg: any) => {
  const chatId = msg.chat.id;
  const groupId = chartInfo[chatId]?.groupId;

  if (groupId) {
    chartInfo[chatId] = {
      ...chartInfo[chatId],
      creator: chatId.toString(),
      groupId: groupId.toString(),
      isChart: false,
    };

    const chart = await ChartController.findOne({
      filter: { groupId: groupId.toString() },
    });
    if (chart) {
      chartInfo[chatId] = {
        ...chartInfo[chatId],
        chain: chart.chain,
        pairAddress: chart.pairAddress,
        priceUpSpike: chart.priceUpSpike,
        priceUpTime: chart.priceUpTime,
        priceDownSpike: chart.priceDownSpike,
        priceDownTime: chart.priceDownTime,
        buySpike: chart.buySpike,
        buyTime: chart.buyTime,
        sellSpike: chart.sellSpike,
        sellTime: chart.sellTime,
        isChart: true,
      };
      chartSettings(msg);
    } else {
      let message;
      message = `<b>🛠 Chart Bot Setup</b>

<b>Please select chain:</b>`;
      await sendMessage({
        id: chatId,
        message: message,
        keyboards: [
          [
            { text: "Base Chain", callback_data: "basechart" },
            { text: "Solana", callback_data: "solanachart" },
          ],
        ],
      });
      chartPairAddress(msg);
    }
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
  }
};

export const chartPairAddress = async (msg: any) => {
  const chatId = msg.chat.id;
  answerCallbacks[chatId] = async function (answer: any) {
    var pairAddress = answer.text;
    chartInfo[chatId] = {
      ...chartInfo[chatId],
      pairAddress: pairAddress,
    };
    chartSettings(msg);
  };
};

export const chartSettings = async (msg: any) => {
  const chatId = msg.chat.id;
  const chartInf = chartInfo[chatId];
  const groupId = chartInf?.groupId;

  if (groupId) {
    const keyboards = [
      [
        {
          text: "Show chart when price will increase a certain percentage",
          callback_data: "static",
        },
      ],
      [
        {
          text: `Percentage (${chartInf?.priceUpSpike || "min is 5"}%)`,
          callback_data: "priceuppercent",
        },
        {
          text: `Within ${chartInf?.priceUpTime || "6h"}`,
          callback_data: "priceuptime",
        },
      ],
      [
        {
          text: "Show chart when price will decrease a certain percentage",
          callback_data: "static",
        },
      ],
      [
        {
          text: `Percentage (${chartInf?.priceDownSpike || "min is 5"}%)`,
          callback_data: "pricedownpercent",
        },
        {
          text: `Within ${chartInf?.priceDownTime || "6h"}`,
          callback_data: "pricedowntime",
        },
      ],
      [
        {
          text: "Show chart when buy orders spike a certain percentage",
          callback_data: "static",
        },
      ],
      [
        {
          text: `Amount of buys (${chartInf?.buySpike || "minimum 25"})`,
          callback_data: "buyamount",
        },
        {
          text: `Within ${chartInf?.buyTime || "6h"}`,
          callback_data: "buytime",
        },
      ],
      [
        {
          text: "Show chart when sell orders spike a certain percentage",
          callback_data: "static",
        },
      ],
      [
        {
          text: `Amount of sells (${chartInf?.sellSpike || "minimum 25"})`,
          callback_data: "sellamount",
        },
        {
          text: `Within ${chartInf?.sellTime || "6h"}`,
          callback_data: "selltime",
        },
      ],
      [{ text: "Save settings", callback_data: "savechart" }],
      ...(chartInf?.isChart
        ? [
            [
              {
                text: "Delete settings",
                callback_data: "deletechart",
              },
            ],
          ]
        : []),
      [{ text: "Auto post to Twitter", callback_data: "twitter" }],
    ];
    await sendMessage({
      id: chatId,
      message: "<b>Change settings for chart:</b>",
      keyboards: keyboards,
    });
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
    delete chartInfo[chatId];
  }
};

export const inputSpikeChange = async (msg: any, type: string) => {
  const chatId = msg.chat.id;
  const chartInf = chartInfo[chatId];
  const groupId = chartInf?.groupId;
  if (groupId) {
    var changeSpike: string;
    var minSpike: number;
    if (type === "priceuppercent" || type === "pricedownpercent") {
      changeSpike = "percentage";
      minSpike = 5;
    } else if (type === "buyamount" || type === "sellamount") {
      changeSpike = "amount";
      minSpike = 25;
    }
    await sendMessage({
      id: chatId,
      message: `<b>Please input the certain ${changeSpike}:</b>`,
    });
    answerCallbacks[chatId] = async function (answer: any) {
      var spike = answer.text;
      if (!Number(spike) || Number(spike) < minSpike) {
        await sendMessage({
          id: chatId,
          message: `<b>Invalid parameter. Minimum value is ${minSpike}.</b>`,
        });
        inputSpikeChange(msg, type);
        return;
      } else {
        switch (type) {
          case "priceuppercent":
            chartInfo[chatId] = {
              ...chartInfo[chatId],
              priceUpSpike: spike,
            };
            break;
          case "pricedownpercent":
            chartInfo[chatId] = {
              ...chartInfo[chatId],
              priceDownSpike: spike,
            };
            break;
          case "buyamount":
            chartInfo[chatId] = {
              ...chartInfo[chatId],
              buySpike: spike,
            };
            break;
          case "sellamount":
            chartInfo[chatId] = {
              ...chartInfo[chatId],
              sellSpike: spike,
            };
            break;
          default:
            break;
        }
        chartSettings(msg);
      }
    };
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
    delete chartInfo[chatId];
  }
};

export const showTime = async (msg: any, type: string) => {
  const chatId = msg.chat.id;
  chartInfo[chatId] = {
    ...chartInfo[chatId],
    spikeType: type,
  };
  await sendMessage({
    id: chatId,
    message: "<b>Please select time:</b>",
    keyboards: [
      [
        { text: "5 minutes", callback_data: "5min" },
        { text: "1 hour", callback_data: "1h" },
        { text: "6 hours", callback_data: "6h" },
      ],
    ],
  });
};

export const selectTime = async (msg: any, time: string) => {
  const chatId = msg.chat.id;
  const spikeType = chartInfo[chatId]?.spikeType;
  try {
    if (spikeType) {
      switch (spikeType) {
        case "priceup":
          chartInfo[chatId] = {
            ...chartInfo[chatId],
            priceUpTime: time,
          };
          break;
        case "pricedown":
          chartInfo[chatId] = {
            ...chartInfo[chatId],
            priceDownTime: time,
          };
          break;
        case "buy":
          chartInfo[chatId] = {
            ...chartInfo[chatId],
            buyTime: time,
          };
          break;
        case "sell":
          chartInfo[chatId] = {
            ...chartInfo[chatId],
            sellTime: time,
          };
          break;
        default:
          break;
      }
      await sendMessage({
        id: chatId,
        message: `<b>You selected ${time}</b>`,
      });
      await chartSettings(msg);
    } else {
      await sendMessage({
        id: chatId,
        message: "<b>You didn't select spike type.</b>",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

export const saveChart = async (msg: any) => {
  const chatId = msg.chat.id;
  const chartInf = chartInfo[chatId];
  if (chartInf?.groupId) {
    if (
      !chartInf?.priceUpSpike ||
      !chartInf?.priceUpTime ||
      !chartInf?.priceDownSpike ||
      !chartInf?.priceDownTime ||
      !chartInf?.buySpike ||
      !chartInf?.buyTime ||
      !chartInf?.sellSpike ||
      !chartInf?.sellTime
    ) {
      await sendMessage({
        id: chatId,
        message: "<b>You didn't provide all settings. Please check again:</b>",
      });
      await chartSettings(msg);
    } else {
      if (chartInf?.isChart) {
        delete chartInfo[chatId].isChart;
        delete chartInfo[chatId].spikeType;
        await ChartController.update(chartInfo[chatId]);
      } else {
        delete chartInfo[chatId].isChart;
        delete chartInfo[chatId].spikeType;
        await ChartController.create(chartInfo[chatId]);
      }
      await sendMessage({
        id: chatId,
        message: "<b>Chart settings saved successfully.</b>",
      });
      delete chartInfo[chatId];
      await startBuyHandler();
    }
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>This command can only be used from groups.</b>",
    });
    delete chartInfo[chatId];
  }
};

export const deleteChart = async (msg: any) => {
  const chatId = msg.chat.id;
  const groupId = chartInfo[chatId]?.groupId;
  if (groupId) {
    try {
      await ChartController.deleteOne({
        filter: { groupId: groupId.toString() },
      });
      await sendMessage({
        id: chatId,
        message: "<b>Chart settings deleted successfully.</b>",
      });
      delete chartInfo[chatId];
      await startBuyHandler();
    } catch (err) {
      console.log("Error when delete chart setting");
    }
  } else {
    await sendMessage({
      id: chatId,
      message: "<b>Please start from group.</b>",
    });
  }
};
