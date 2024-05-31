import keccak from "keccak";
import colors from "colors";
import cron from "node-cron";
import axios from "axios";
import config from "config.json";
import SolController from "controller/solcontroller";
import { getSolanaTokenBalance } from "./monitor/library/scan-api";
import { postMessageWithMedia } from "bot/library";

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
      cron.schedule(`*/${times} * * * * *`, () => {
        console.log(
          `running a base transaction ${token.pairAddress} handle every ${times} second`
        );
        handletransactions();
      });
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
            pairAddress: token.pairAddress,
            hash: trade.Transaction?.Signature || "",
          });
        }
        txs.reverse();
        const soltxs = await SolController.find({
          filter: { pairAddress: token.pairAddress },
        });
        if (soltxs.length > 0) {
          for (let i = 0; i < txs.length; i++) {
            const tx = txs[i];
            const isExist = await SolController.findOne({
              filter: { pairAddress: token.pairAddress, hash: tx.hash },
            });
            if (!isExist) {
              const balance = await getSolanaTokenBalance(
                tx.maker,
                token.baseTokenAddress
              );

              const repeatNumber = Math.floor(
                Number(tx.AmountInUSD) / token.step
              );
              const isNewHolder = Number(balance) - Number(tx.amount) == 0;
              const marketcap =
                Number(token.totalSupply) * Number(tx.PriceInUSD);

              const groupMessage: GroupMessageInterface = {
                chain: "solana",
                groupId: Number(token.groupId),
                type: token.mediaType,
                mediaId: token.mediaId,
                emoji: token.emoji,
                repeatNumber: repeatNumber,
                usdAmount: tx.AmountInUSD,
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
            filter: { pairAddress: token.pairAddress },
          }).then(async () => {
            await SolController.insertMany(txarr);
          });
        } else {
          const tx = txs[txs.length - 1];
          const balance = await getSolanaTokenBalance(
            tx.maker,
            token.baseTokenAddress
          );

          const repeatNumber = Math.floor(Number(tx.AmountInUSD) / token.step);
          const isNewHolder = Number(balance) - Number(tx.amount) == 0;
          const marketcap = Number(token.totalSupply) * Number(tx.PriceInUSD);

          const groupMessage: GroupMessageInterface = {
            chain: "solana",
            groupId: Number(token.groupId),
            type: token.mediaType,
            mediaId: token.mediaId,
            emoji: token.emoji,
            repeatNumber: repeatNumber,
            usdAmount: tx.AmountInUSD,
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

  const solanaHandleEvent = async () => {
    try {
      cron.schedule(`*/${times} * * * * *`, () => {
        console.log(
          `running a solana transaction ${token.pairAddress} handle every ${times} second`
        );
        solanaHandleTransactions();
      });
    } catch (err: any) {
      console.log(
        `running a solana transaction ${token.pairAddress} handle error ${err.message}`
      );
    }
  };
  solanaHandleEvent();
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
