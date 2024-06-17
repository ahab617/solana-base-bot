import keccak from "keccak";
import colors from "colors";
import cron from "node-cron";
import axios from "axios";
import config from "config.json";
import {
  getBaseTokenMetadata,
  getPairInformation,
  getSolanaTokenBalance,
  getSolanaTokenMetadata,
} from "./monitor/library/scan-api";
import {
  postMessageForSpike,
  postMessageWithMedia,
  sendMessage,
} from "bot/library";
import { AdController, SolController } from "controller";

export const baseHandleEvent = async (props: any) => {
  const {
    token,
    provider,
    contract,
    event,
    times,
    handler,
    BlockNumController,
  } = props;

  var latestblocknumber: any;
  const handletransactions = async () => {
    try {
      let blockNumber = await provider.getBlockNumber();
      console.log(
        "handle transactions: ",
        contract.address,
        event,
        latestblocknumber,
        blockNumber
      );
      if (blockNumber > latestblocknumber) {
        blockNumber =
          blockNumber > latestblocknumber + 100
            ? latestblocknumber + 100
            : blockNumber;
        var txhistory;
        if (token.pairAddress !== ZeroAddress) {
          txhistory = contract.queryFilter(
            event,
            latestblocknumber + 1,
            blockNumber
          );
          await txhistory?.then(async (res: any) => {
            for (var index in res) {
              handler(res[index], token);
            }
          });
        }
        latestblocknumber = blockNumber;
        await BlockNumController.update(
          { id: token.pairAddress },
          { latestBlock: blockNumber }
        );
      }
    } catch (err) {
      if (err.reason === "missing response") {
        console.log(colors.red("you seem offline"));
      } else if (err.reason === "could not detect network") {
        console.log(colors.red("could not detect network"));
      } else {
        console.log("handletransactions err", err.reason);
      }
    }
  };

  const handleEvent = async () => {
    try {
      try {
        var blockNumber = (
          await BlockNumController.find({ id: token.pairAddress })
        ).latestBlock;
        if (!blockNumber) throw new Error("not find");
      } catch (err) {
        blockNumber = await provider.getBlockNumber();
        await BlockNumController.create({
          id: token.pairAddress,
          latestBlock: blockNumber,
        });
      }
      latestblocknumber = blockNumber;
      const schedule = cron.schedule(`*/${times} * * * * *`, () => {
        console.log(
          `running a base transaction ${token.pairAddress} handle every ${times} second`
        );
        handletransactions();
      });

      schedule.stop();
      schedule.start();
    } catch (err: any) {
      console.log(
        `running a base transaction ${token.pairAddress} handle error ${err.message}`
      );
    }
  };
  handleEvent();
};

export const solanaHandleEvent = async (props: any) => {
  const { token, times } = props;
  const solanaHandleTransactions = async () => {
    try {
      const data = JSON.stringify({
        query: GET_TRADE_DATA(token.pairAddress, token.quoteTokenAddress),
      });
      const params = {
        method: "post",
        url: "https://streaming.bitquery.io/eap",
        headers: {
          "Content-Type": "application/json",
          Authorization: config.bitAPIKey,
        },
        data: data,
      };
      await axios(params).then(async (data: any) => {
        const trades = data?.data?.data?.Solana?.DEXTrades || [];
        let txs = [];
        let txarr: SolInterface[] = [];
        for (let i = 0; i < trades.length; i++) {
          const trade = trades[i];
          txs.push({
            hash: trade.Transaction?.Signature || "",
            maker: trade.Transaction?.Signer || "",
            amount: trade.Trade?.Buy?.Amount,
            AmountInUSD: trade.Trade?.Buy?.AmountInUSD,
            price: trade.Trade?.Buy?.Price,
            PriceInUSD: trade.Trade?.Buy?.PriceInUSD,
            outAmount: trade.Trade?.Sell?.Amount,
            outAmountUsd: trade.Trade?.Sell?.AmountInUSD,
          });
          txarr.push({
            groupId: token.groupId,
            pairAddress: token.pairAddress,
            hash: trade.Transaction?.Signature || "",
          });
        }
        const soltxs = await SolController.find({
          filter: { groupId: token.groupId, pairAddress: token.pairAddress },
        });
        if (soltxs.length > 0) {
          txs.reverse();
          for (let i = 0; i < txs.length; i++) {
            const tx = txs[i];
            const isExist = await SolController.findOne({
              filter: {
                groupId: token.groupId,
                pairAddress: token.pairAddress,
                hash: tx.hash,
              },
            });
            if (!isExist && Number(tx.outAmountUsd) > Number(token.min)) {
              const balance = await getSolanaTokenBalance(
                tx.maker,
                token.baseTokenAddress
              );

              const repeatNumber = Math.floor(
                Number(tx.outAmountUsd) / Number(token.step)
              );
              const isNewHolder = Number(balance) - Number(tx.amount) == 0;
              const marketcap =
                (Number(token.totalSupply) * Number(tx.PriceInUSD)) /
                10 ** token.baseTokenDecimals;

              const groupMessage: GroupMessageInterface = {
                chain: "solana",
                groupId: Number(token.groupId),
                type: token.mediaType,
                mediaId: token.mediaId,
                emoji: token.emoji,
                repeatNumber: repeatNumber,
                usdAmount: tx.outAmountUsd,
                tokenSymbol: token.baseTokenSymbol,
                tokenAddress: token.baseTokenAddress,
                tokenAmount: Math.floor(Number(tx.amount)),
                buyer: tx.maker,
                hash: tx.hash,
                marketcap: marketcap,
                chartLink: token.dexUrl,
                buyLink: "https://jup.ag/",
                isNewHolder: isNewHolder,
              };
              await postMessageWithMedia(groupMessage);
            }
          }
          await SolController.deleteMany({
            filter: { groupId: token.groupId, pairAddress: token.pairAddress },
          });

          await SolController.insertMany(txarr);
        } else {
          const tx = txs[0];
          const balance = await getSolanaTokenBalance(
            tx.maker,
            token.baseTokenAddress
          );

          const repeatNumber = Math.floor(
            Number(tx.AmountInUSD) / Number(token.step)
          );
          const isNewHolder = Number(balance) - Number(tx.amount) == 0;
          const marketcap =
            (Number(token.totalSupply) * Number(tx.PriceInUSD)) /
            10 ** token.baseTokenDecimals;

          const groupMessage: GroupMessageInterface = {
            chain: "solana",
            groupId: Number(token.groupId),
            type: token.mediaType,
            mediaId: token.mediaId,
            emoji: token.emoji,
            repeatNumber: repeatNumber,
            usdAmount: tx.outAmountUsd,
            tokenSymbol: token.baseTokenSymbol,
            tokenAddress: token.baseTokenAddress,
            tokenAmount: Math.floor(Number(tx.amount)),
            buyer: tx.maker,
            hash: tx.hash,
            marketcap: marketcap,
            chartLink: token.dexUrl,
            buyLink: "https://jup.ag/",
            isNewHolder: isNewHolder,
          };
          await postMessageWithMedia(groupMessage);
          await SolController.insertMany(txarr);
        }
      });
    } catch (err) {
      if (err.reason === "missing response") {
        console.log(colors.red("you seem offline"));
      } else if (err.reason === "could not detect network") {
        console.log(colors.red("could not detect network"));
      } else {
        console.log("handletransactions err", err.reason);
      }
    }
  };

  const handleEvent = async () => {
    try {
      const schedule = cron.schedule(`*/${times} * * * * *`, () => {
        console.log(
          `running a solana transaction ${token.pairAddress} handle every ${times} second`
        );
        solanaHandleTransactions();
      });
      schedule.stop();
      schedule.start();
    } catch (err: any) {
      console.log(
        `running a solana transaction ${token.pairAddress} handle error ${err.message}`
      );
    }
  };
  handleEvent();
};
function stripHexPrefix(value: string) {
  return value.slice(0, 2) === "0x" || value.slice(0, 2) === "0X"
    ? value.slice(2)
    : value;
}

export const toChecksumAddress = (address: string) => {
  try {
    if (typeof address !== "string") return "";
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) return "";
    const stripAddress = stripHexPrefix(address).toLowerCase();
    const keccakHash = keccak("keccak256").update(stripAddress).digest("hex");
    let checksumAddress = "0x";
    for (let i = 0; i < stripAddress.length; i++) {
      checksumAddress +=
        parseInt(keccakHash[i], 16) >= 8
          ? stripAddress[i]?.toUpperCase()
          : stripAddress[i];
    }
    return checksumAddress;
  } catch (err) {
    console.log(err);
    return address;
  }
};

export const chartHandleEvent = async (props: any) => {
  const { chartInfo, times } = props;

  const handleTokenPair = async () => {
    try {
      const pair = await getPairInformation(
        chartInfo.chain,
        chartInfo.pairAddress
      );
      let priceUpChange = 0;
      let priceDownChange = 0;
      let buyChange = 0;
      let sellChange = 0;

      if (chartInfo.priceUpTime === "5min") {
        priceUpChange = pair?.pair?.priceChange?.m5;
      } else if (chartInfo.priceUpTime === "1h") {
        priceUpChange = pair?.pair?.priceChange?.h1;
      } else if (chartInfo.priceUpTime === "6h") {
        priceUpChange = pair?.pair?.priceChange?.h6;
      }

      if (chartInfo.priceDownTime === "5min") {
        priceDownChange = pair?.pair?.priceChange?.m5;
      } else if (chartInfo.priceDownTime === "1h") {
        priceDownChange = pair?.pair?.priceChange?.h1;
      } else if (chartInfo.priceDownTime === "6h") {
        priceDownChange = pair?.pair?.priceChange?.h6;
      }

      if (chartInfo.buyTime === "5min") {
        buyChange = pair?.pair?.txns?.m5?.buys;
      } else if (chartInfo.buyTime === "1h") {
        buyChange = pair?.pair?.txns?.h1?.buys;
      } else if (chartInfo.buyTime === "6h") {
        buyChange = pair?.pair?.txns?.h6?.buys;
      }

      if (chartInfo.sellTime === "5min") {
        sellChange = pair?.pair?.txns?.m5?.buys;
      } else if (chartInfo.sellTime === "1h") {
        sellChange = pair?.pair?.txns?.h1?.buys;
      } else if (chartInfo.sellTime === "6h") {
        sellChange = pair?.pair?.txns?.h6?.buys;
      }

      if (Number(priceUpChange) - Number(chartInfo.priceUpSpike) > 0) {
        await alertPriceMessage(
          chartInfo,
          "priceuppercent",
          chartInfo.priceUpTime,
          priceUpChange,
          pair
        );
      }

      if (Number(priceDownChange) + Number(chartInfo.priceDownSpike) < 0) {
        await alertPriceMessage(
          chartInfo,
          "pricedownpercent",
          chartInfo.priceDownTime,
          priceDownChange,
          pair
        );
      }

      if (chartInfo.chain === "base") {
        await baseTradeMessage("buyamount", buyChange, chartInfo);
        await baseTradeMessage("sellamount", sellChange, chartInfo);
      } else {
        await solTradeMessage("buyamount", buyChange, chartInfo);
        await solTradeMessage("sellamount", sellChange, chartInfo);
      }
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

  const alertPriceMessage = async (
    chart: ChartInterface,
    type: string,
    time: string,
    priceChange: number,
    pair: any
  ) => {
    try {
      let metadata;
      if (chart.chain === "solana") {
        metadata = await getSolanaTokenMetadata(pair?.pair?.baseToken?.address);
      } else {
        metadata = await getBaseTokenMetadata(pair?.pair?.baseToken?.address);
      }
      const totalSupply = metadata?.totalSupply || 0;
      const decimals = metadata?.decimals || 1;
      const mcap =
        (Number(pair?.pair?.priceUsd) * Number(totalSupply)) / 10 ** decimals;
      const data: SpikeInterface = {
        groupId: chart.groupId,
        chain: chart.chain,
        spikeType: type,
        symbol: pair?.pair?.baseToken.symbol,
        time: time,
        spike: priceChange,
        url: pair?.pair?.url,
        marketcap: mcap,
      };
      const ads = await AdController.find({
        filter: { groupId: chartInfo.groupId },
      });
      if (ads.length > 0) {
        const randIdx = Math.floor(Math.random() * ads.length);
        const ad = ads[randIdx] as AdInterface;
        if (ad.count < 2) {
          await postMessageForSpike(data, ad);
          await sendMessage({
            id: Number(ad.creator),
            message: "<b>Your advertise was just expired.</b>",
          });
          await AdController.deleteOne({
            filter: { creator: ad.creator, groupId: ad.groupId },
          });
        } else {
          await postMessageForSpike(data, ad);
          await AdController.update({
            filter: { creator: ad.creator, groupId: ad.groupId },
            update: {
              count: ad.count - 1,
            },
          });
        }
      } else {
        await postMessageForSpike(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const baseTradeMessage = async (
    type: string,
    limit: number,
    chart: ChartInterface
  ) => {
    try {
      const pair = await getPairInformation(chart.chain, chart.pairAddress);
      const data = JSON.stringify({
        query:
          type === "buyamount"
            ? GET_BASE_BUY_AMOUNT_SPIKE(chart.pairAddress, limit)
            : GET_BASE_SELL_AMOUNT_SPIKE(chart.pairAddress, limit),
      });
      const params = {
        method: "post",
        url: "https://streaming.bitquery.io/eap",
        headers: {
          "Content-Type": "application/json",
          Authorization: config.bitAPIKey,
        },
        data: data,
      };
      await axios(params).then(async (res: any) => {
        const trades = res?.data?.data?.EVM?.DEXTrades || [];
        let amount = 0;
        for (let i = 0; i < trades.length; i++) {
          if (type === "buyamount") {
            amount += Number(trades[i]?.Trade?.Buy?.Amount);
          } else {
            amount += Number(trades[i]?.Trade?.Sell?.Amount);
          }
        }
        console.log(
          `${type === "buyamount" ? "Bought" : "Sold"} `,
          amount,
          "tokens on base chain"
        );
        if (
          (type === "buyamount" && amount > chart.buySpike) ||
          (type === "sellamount" && amount > chart.sellSpike)
        ) {
          try {
            const metadata = await getBaseTokenMetadata(
              pair?.pair?.baseToken?.address
            );
            const totalSupply = metadata?.totalSupply || 0;
            const decimals = metadata?.decimals || 1;
            const mcap =
              (Number(pair?.pair?.priceUsd) * Number(totalSupply)) /
              10 ** decimals;
            const data: SpikeInterface = {
              groupId: chart.groupId,
              chain: chart.chain,
              spikeType: type,
              symbol: pair?.pair?.baseToken.symbol,
              time: type === "buyamount" ? chart.buyTime : chart.sellTime,
              spike: amount,
              url: pair?.pair?.url,
              marketcap: mcap,
            };
            const ads = await AdController.find({
              filter: { groupId: chartInfo.groupId },
            });
            if (ads.length > 0) {
              const randIdx = Math.floor(Math.random() * ads.length);
              const ad = ads[randIdx] as AdInterface;
              if (ad.count < 2) {
                await postMessageForSpike(data, ad);
                await sendMessage({
                  id: Number(ad.creator),
                  message: "<b>Your advertise was just expired.</b>",
                });
                await AdController.deleteOne({
                  filter: { creator: ad.creator, groupId: ad.groupId },
                });
              } else {
                await postMessageForSpike(data, ad);
                await AdController.update({
                  filter: { creator: ad.creator, groupId: ad.groupId },
                  update: {
                    count: ad.count - 1,
                  },
                });
              }
            } else {
              await postMessageForSpike(data);
            }
          } catch (err) {
            console.log(err);
          }
        }
      });
    } catch (err) {
      console.log("Base chain spike error");
    }
  };

  const solTradeMessage = async (
    type: string,
    limit: number,
    chart: ChartInterface
  ) => {
    try {
      const pair = await getPairInformation(chart.chain, chart.pairAddress);
      const data = JSON.stringify({
        query:
          type === "buyamount"
            ? GET_SOLANA_BUY_AMOUNT_SPIKE(chart.pairAddress, limit)
            : GET_SOLANA_SELL_AMOUNT_SPIKE(chart.pairAddress, limit),
      });
      const params = {
        method: "post",
        url: "https://streaming.bitquery.io/eap",
        headers: {
          "Content-Type": "application/json",
          Authorization: config.bitAPIKey,
        },
        data: data,
      };
      await axios(params).then(async (res: any) => {
        const trades = res?.data?.data?.Solana?.DEXTrades || [];
        let amount = 0;
        for (let i = 0; i < trades.length; i++) {
          if (type === "buyamount") {
            amount += Number(trades[i]?.Trade?.Buy?.Amount);
          } else {
            amount += Number(trades[i]?.Trade?.Sell?.Amount);
          }
        }
        console.log(
          `${type === "buyamount" ? "Bought" : "Sold"} `,
          amount,
          "tokens on solana"
        );
        if (
          (type === "buyamount" && amount > chart.buySpike) ||
          (type === "sellamount" && amount > chart.sellSpike)
        ) {
          try {
            const metadata = await getSolanaTokenMetadata(
              pair?.pair?.baseToken?.address
            );
            const totalSupply = metadata?.totalSupply || 0;
            const decimals = metadata?.decimals || 1;
            const mcap =
              (Number(pair?.pair?.priceUsd) * Number(totalSupply)) /
              10 ** decimals;
            const data: SpikeInterface = {
              groupId: chart.groupId,
              chain: chart.chain,
              spikeType: type,
              symbol: pair?.pair?.baseToken.symbol,
              time: type === "buyamount" ? chart.buyTime : chart.sellTime,
              spike: amount,
              url: pair?.pair?.url,
              marketcap: mcap,
            };
            const ads = await AdController.find({
              filter: { groupId: chartInfo.groupId },
            });
            if (ads.length > 0) {
              const randIdx = Math.floor(Math.random() * ads.length);
              const ad = ads[randIdx] as AdInterface;
              if (ad.count < 2) {
                await postMessageForSpike(data, ad);
                await sendMessage({
                  id: Number(ad.creator),
                  message: "<b>Your advertise was just expired.</b>",
                });
                await AdController.deleteOne({
                  filter: { creator: ad.creator, groupId: ad.groupId },
                });
              } else {
                await postMessageForSpike(data, ad);
                await AdController.update({
                  filter: { creator: ad.creator, groupId: ad.groupId },
                  update: {
                    count: ad.count - 1,
                  },
                });
              }
            } else {
              await postMessageForSpike(data);
            }
          } catch (err) {
            console.log(err);
          }
        }
      });
    } catch (err) {
      console.log("Base chain spike error");
    }
  };

  const handleTokenPairEvent = async () => {
    try {
      const schedule = cron.schedule(`*/${times} * * * * `, () => {
        console.log(
          `running a ${chartInfo.chain} chart token pair ${chartInfo.pairAddress} handle every ${times} minutes`
        );
        handleTokenPair();
      });
      schedule.stop();
      schedule.start();
    } catch (err: any) {
      console.log(
        `running a ${chartInfo.chain} chart token pair ${chartInfo.pairAddress} handle error ${err.message}`
      );
    }
  };

  handleTokenPairEvent();
};

export const ZeroAddress = "0x0000000000000000000000000000000000000000";

const GET_TRADE_DATA = (pairAddress: string, quoteTokenAddress: string) => {
  return `query MyQuery {
    Solana {
      DEXTrades(
        where: {Trade: {Market: {MarketAddress: {is: "${pairAddress}"}}, Buy: {Account: {Address: {}}}, Sell: {Account: {Token: {}}, Currency: {MintAddress: {is: "${quoteTokenAddress}"}}}}, Block: {}, any: {}, Transaction: {Result: {Success: true}}}
        limit: {count: 20}
        orderBy: {descending: Block_Time}
      ) {
        Trade {
          Market {
            MarketAddress
          }
          Buy {
            Amount
            Account {
              Address
            }
            Currency {
              MetadataAddress
              Key
              IsMutable
              EditionNonce
              Decimals
              CollectionAddress
              Fungible
              Symbol
              Native
              Name
              MintAddress
              ProgramAddress
            }
            AmountInUSD
            PriceInUSD
            Price
          }
          Sell {  
            Amount
            AmountInUSD
            Price
            PriceInUSD
            Currency {
              Symbol
              Name
              MintAddress
              MetadataAddress
            }
          }
          Dex {
            ProgramAddress
          }
        }
        Transaction {
          Signer
          Signature
        }
      }
    }
  }
    `;
};

const GET_BASE_BUY_AMOUNT_SPIKE = (pairAddress: string, count: number) => {
  return `query MyQuery {
    EVM(network: base) {
      DEXTrades(
        limit: {count: ${count}}
        where: {Trade: {Success: true, Dex: {Pair: {SmartContract: {is: "${pairAddress}"}}}}, ChainId: {}}
        orderBy: {descending: Block_Time}
      ) {
        Trade {
          Buy {
            Amount
          }
        }
      }
    }
  }`;
};

const GET_BASE_SELL_AMOUNT_SPIKE = (pairAddress: string, count: number) => {
  return `query MyQuery {
    EVM(network: base) {
      DEXTrades(
        limit: {count: ${count}}
        where: {Trade: {Success: true, Dex: {Pair: {SmartContract: {is: "${pairAddress}"}}}}, ChainId: {}}
        orderBy: {descending: Block_Time}
      ) {
        Trade {
          Sell {
            Amount
          }
        }
      }
    }
  }`;
};

const GET_SOLANA_BUY_AMOUNT_SPIKE = (pairAddress: string, count: number) => {
  return `query MyQuery {
  Solana {
    DEXTrades(
      where: {Trade: {Buy: {}, Market: {MarketAddress: {is: "${pairAddress}"}}}}
      limit: {count: ${count}}
      orderBy: {descending: Block_Time}
    ) {
      Trade {
        Buy {
          Amount
        }
      }
    }
  }
}
`;
};

const GET_SOLANA_SELL_AMOUNT_SPIKE = (pairAddress: string, count: number) => {
  return `query MyQuery {
  Solana {
    DEXTrades(
      where: {Trade: {Sell: {}, Market: {MarketAddress: {is: "${pairAddress}"}}}}
      limit: {count: ${count}}
      orderBy: {descending: Block_Time}
    ) {
      Trade {
        Sell {
          Amount
        }
      }
    }
  }
}
`;
};
