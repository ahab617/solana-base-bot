import setlog from "utils/setlog";
import { TokenController } from "controller";
import { baseEventHandler, solanaEventHandler } from "blockchain/handler";
import ChartController from "controller/chartcontroller";
import { chartHandleEvent } from "blockchain/util";

let tokens: TokenInterface[] = [];
let charts: ChartInterface[] = [];

const updatePairAddresses = async () => {
  try {
    const _tokens = (await TokenController.find({
      filter: {
        groupId: { $ne: "" },
        pairAddress: { $ne: "" },
      },
    })) as TokenInterface[];
    tokens = _tokens;
  } catch (err) {
    console.log(err);
    setlog("updatePairAddresses", err.message);
  }
};

const updateChartInfos = async () => {
  try {
    const _charts = (await ChartController.find({
      filter: {
        groupId: { $ne: "" },
        pairAddress: { $ne: "" },
      },
    })) as ChartInterface[];
    charts = _charts;
  } catch (err) {
    console.log(err);
    setlog("updatePairAddresses", err.message);
  }
};

const buyEventHandler = async () => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token && token.pairName && token.groupId) {
      if (token.chainId === "base") {
        baseEventHandler(token);
      } else {
        solanaEventHandler(token);
      }
    }
  }
};

const chartEventHandler = async () => {
  for (let i = 0; i < charts.length; i++) {
    chartHandleEvent({ chartInfo: charts[i], times: 5 });
  }
};

const startBuyHandler = async () => {
  await updatePairAddresses();
  await updateChartInfos();
  buyEventHandler();
  chartEventHandler();
};

export { startBuyHandler };
