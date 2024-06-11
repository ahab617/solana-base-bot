import { answerCallbacks } from "bot";
import { sendMessage } from ".";
import ChartController from "controller/chartcontroller";
import { startBuyHandler } from "blockchain/monitor/library";

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
        spikeType: chart.spikeType,
        spike: chart.spike,
        time: chart.time,
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
          text: `Percentage (min is ${
            chartInf?.spikeType === "priceuppercent" ? chartInf?.spike || 5 : 5
          }%)`,
          callback_data: "priceuppercent",
        },
        {
          text: `Within ${
            chartInf?.spikeType === "priceuppercent"
              ? chartInf?.time || "6h"
              : "6h"
          }`,
          callback_data: "changeTime",
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
          text: `Percentage (min is ${
            chartInf?.spikeType === "pricedownpercent"
              ? chartInf?.spike || 5
              : 5
          }%)`,
          callback_data: "pricedownpercent",
        },
        {
          text: `Within ${
            chartInf?.spikeType === "pricedownpercent"
              ? chartInf?.time || "6h"
              : "6h"
          }`,
          callback_data: "changeTime",
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
          text: `Amount of buys (minimum ${
            chartInf?.spikeType === "buyamount" ? chartInf?.spike || 25 : 25
          })`,
          callback_data: "buyamount",
        },
        {
          text: `Within ${
            chartInf?.spikeType === "buyamount" ? chartInf?.time || "6h" : "6h"
          }`,
          callback_data: "changeTime",
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
          text: `Amount of sells (minimum ${
            chartInf?.spikeType === "sellamount" ? chartInf?.spike || 25 : 25
          })`,
          callback_data: "sellamount",
        },
        {
          text: `Within ${
            chartInf?.spikeType === "buyamount" ? chartInf?.time || "6h" : "6h"
          }`,
          callback_data: "changeTime",
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

export const inputSpikeChange = async (msg: any, type?: string) => {
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
    chartInfo[chatId] = {
      ...chartInfo[chatId],
      spikeType: type,
    };
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
        chartInfo[chatId] = {
          ...chartInfo[chatId],
          spike: spike,
        };
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

export const saveChart = async (msg: any) => {
  const chatId = msg.chat.id;
  const chartInf = chartInfo[chatId];
  if (chartInf?.groupId) {
    if (!chartInf?.spikeType || !chartInf?.spike || !chartInf?.time) {
      await sendMessage({
        id: chatId,
        message: "<b>You didn't provide all settings. Please check again:</b>",
      });
      await chartSettings(msg);
    } else {
      if (chartInf?.isChart) {
        delete chartInfo[chatId].isChart;
        await ChartController.update(chartInfo[chatId]);
      } else {
        delete chartInfo[chatId].isChart;
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
