import cron from "node-cron";
import colors from "colors";
import { formatUnit } from "utils/bigmath";
import { getTokenBalance, getTokenMeta } from "./scan-api";
import { getTokenPrice, getTransactionsOfWorld } from "./world-api";
import { numberWithCommas } from "utils";
import { postMessageWithMedia, sendMessage } from "bot/library";
import { AlertController, TokenController } from "controller";
import setlog from "utils/setlog";
import { BlockNumController } from "blockchain/controller";
import { currentTime } from "utils/helper";
import AdController from "controller/adcontroller";
import { baseEventHandler } from "blockchain/handler";

let tokens: TokenInterface[] = [];

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

// Every Block Handle
export const handleEvent = async (props: any) => {
  const { id, groupId, token, times, BlockNumController } = props;

  var latestBlockTime: any;

  const handletransactions = async () => {
    try {
      let now = currentTime();
      const adInfos = (await AdController.find({
        filter: {
          groupId: {
            $ne: groupId,
          },
        },
      })) as any;
      let adCaption: string;
      let adLink: string;

      if (adInfos.length > 0) {
        const randIdx = Math.floor(Math.random() * adInfos.length);
        const adInfo = adInfos[randIdx];
        if (now > adInfo.expireTime) {
          await AdController.deleteOne({
            filter: { creator: adInfo.creator, groupId: adInfo.groupId },
          }).then(async () => {
            await sendMessage({
              id: adInfo.creator,
              message:
                "<b>🚫 Your advertisement duration was just expired.</b>",
            });
          });
        } else {
          adCaption = adInfo.caption;
          adLink = adInfo.link;
        }
      }

      console.log("handle transactions : ", latestBlockTime, now);
      // if (now > latestBlockTime) {
      //   now = now > latestBlockTime + times ? latestBlockTime + times : now;

      //   const tokenAddress = token.tokenAddr;
      //   const token1 = await getTokenMeta(token.tokenAddr);
      //   const lpAddress = token.lpAddr;
      //   const pairTokenAddress = token.pairAddr;
      //   const token2 = await getTokenMeta(pairTokenAddress);
      //   let txs = [];
      //   if (token1 && token2) {
      //     txs = await getTransactionsOfWorld(tokenAddress);
      //   }
      //   let history = [] as any;

      //   for (let i = 0; i < txs.length; i++) {
      //     const tx = txs[i];
      //     if (tx.lpAddress == lpAddress) {
      //       const toAddress =
      //         tx.currencyAddresses[0] == tokenAddress
      //           ? tx.currencyAddresses[1]
      //           : tx.currencyAddresses[0];
      //       let fromAmount =
      //         tx.currencyAddresses[0] == tokenAddress
      //           ? tx.volumes[0]
      //           : tx.volumes[1];
      //       let toAmount =
      //         tx.currencyAddresses[0] == tokenAddress
      //           ? tx.volumes[1]
      //           : tx.volumes[0];
      //       fromAmount = formatUnit(fromAmount, token1.decimals);
      //       toAmount = formatUnit(toAmount, token2.decimals);
      //       const type =
      //         tx.currencyAddresses[0] == tokenAddress ? "Sell" : "Buy";
      //       if (type == "Buy") {
      //         //&& tx.timestampBlock > latestBlockTime
      //         const confirmed: any = await AlertController.findOne({
      //           filter: {
      //             hash: tx.transactionHash,
      //             groupId: groupId,
      //           },
      //         });

      //         // console.log(confirmed)
      //         if (!confirmed) {
      //           history.push({
      //             hash: tx.messageHash,
      //             txHash: tx.transactionHash,
      //             userAddress: tx.userAddress,
      //             currencies: tx.currencies,
      //             currencyAddresses: tx.currencyAddresses,
      //             toAddress: toAddress,
      //             values: tx.volumes,
      //             decimals1: token1.decimals,
      //             decimals2: token2.decimals,
      //             fromAmount: fromAmount,
      //             toAmount: toAmount,
      //             buy: type,
      //             time: tx.timestampBlock,
      //           });
      //           await AlertController.create({
      //             hash: tx.transactionHash,
      //             groupId: groupId,
      //           });
      //         }
      //       }
      //     }
      //   }
      //   history = history.sort((a: any, b: any) => {
      //     return a.time - b.time;
      //   });

      //   for (let i = 0; i < history.length; i++) {
      //     const d = history[i];
      //     const priceData = await getTokenPrice(tokenAddress);
      //     const price = Number(Object.values(priceData)?.[0] || 0);
      //     const marketcap = Number(token1.totalSupply) * price;

      //     console.log(
      //       "**** " + " Buy",
      //       numberWithCommas(Number(d.fromAmount)) + "" + token1.symbol,
      //       numberWithCommas(Number(d.toAmount)) + "" + token2.symbol,
      //       Number(price * Number(d.fromAmount)).toFixed(6) + "USD",
      //       id
      //     );

      //     const m = await TokenController.findOne({
      //       filter: {
      //         tokenAddr: token1.rootAddress,
      //         groupId,
      //       },
      //     });
      //     if (m) {
      //       const usd = Number(price * Number(d.fromAmount));
      //       const balance =
      //         ((await getTokenBalance(m.tokenAddr, d.userAddress)) || 0) +
      //         Number(d.fromAmount);

      //       let oldbalance = balance - Number(d.fromAmount);
      //       if (oldbalance < 0) oldbalance = 0;

      //       const position = 0;

      //       if (usd >= Number(m.min)) {
      //         const data = {
      //           groupId: groupId,
      //           type: m.mediaType as "video" | "image",
      //           mediaId: m.mediaId,
      //           links: m.links,
      //           tokenName: m.tokenName,
      //           tokenSymbol: m.tokenName,
      //           emoji: m.emoji,
      //           usdPrice: usd,
      //           amount1: Number(d.fromAmount),
      //           symbol1: token1.symbol,
      //           amount2: Number(d.toAmount),
      //           symbol2: token2.symbol,
      //           balance: balance,
      //           position: position,
      //           buyerLink: `https://venomscan.com/accounts/${d.userAddress}`,
      //           txLink: `https://venomscan.com/transactions/${d.txHash}`,
      //           marketcap: Number(marketcap),
      //           adCaption,
      //           adLink,
      //         } as any;
      //         await postMessageWithMedia(data);
      //       }
      //     }
      //   }

      //   latestBlockTime = now;
      //   await BlockNumController.update({ id: id }, { latestTime: now });
      // }
    } catch (err) {
      if (err.reason === "missing response") {
        console.log(colors.red("you seem offline"));
      } else if (err.reason === "could not detect network") {
        console.log(colors.red("could not detect network"));
      } else {
        console.log("handletransactions err", err);
      }
    }
  };

  const handleEvent = async () => {
    try {
      try {
        var latestTime = (await BlockNumController.find({ id: id })).latestTime;
        if (!latestTime) throw new Error("not find");
      } catch (err) {
        latestTime = currentTime();
        await BlockNumController.create({
          id: id,
          latestTime: latestTime,
        });
      }
      latestBlockTime = latestTime;
      cron.schedule(`*/${times} * * * * *`, async () => {
        const isExistsToken =
          (
            await TokenController.find({
              filter: {
                tokenAddr: token.tokenAddr,
                groupId: token.groupId,
              },
            })
          )?.length > 0;
        if (isExistsToken) {
          console.log(
            `running a transaction ${id} handle every ${times} second`
          );
          await handletransactions();
        }
      });
    } catch (err: any) {
      console.log(`running a transaction ${id} handle error ${err.message}`);
    }
  };
  handleEvent();
};

const buyEventHandler = async () => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token && token.pairName && token.groupId) {
      if (token.chainId === "base") {
        baseEventHandler(token);
      }
      // handleEvent({
      //   id: token.pairName + " " + token.groupId,
      //   creator: token.creator,
      //   groupId: token.groupId,
      //   token: token,
      //   times: 15,
      //   BlockNumController,
      // });
    }
  }
};

const startBuyHandler = async () => {
  await updatePairAddresses();
  await buyEventHandler();
};

export { startBuyHandler };
