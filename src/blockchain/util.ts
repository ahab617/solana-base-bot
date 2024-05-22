import bs58 from "bs58";
import axios from "axios";
import keccak from "keccak";
import colors from "colors";
import cron from "node-cron";
import { ethers } from "ethers";

import { provider } from "./contracts/providers";

// Every Block Handle
export const handleEvent = async (props: any) => {
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
          `running a transaction ${token.pairAddress} handle every ${times} second`
        );
        handletransactions();
      });
    } catch (err: any) {
      console.log(
        `running a transaction ${token.pairAddress} handle error ${err.message}`
      );
    }
  };
  handleEvent();
};

export const encodeByte32String = (text: string) => {
  try {
    return ethers.utils.formatBytes32String(text);
  } catch (err) {
    return null;
  }
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

export const generateAddress = () => {
  const wallet = ethers.Wallet.createRandom();
  return { privatekey: wallet.privateKey, publickey: wallet.address };
};

export const getAddressFromPrivateKey = (privateKey: string) => {
  const w = new ethers.Wallet(privateKey);
  return w.address;
};

export const getTransaction = async (hash: string) => {
  return await provider?.getTransaction(hash);
};

export const checkTransactions = (
  rpc: string,
  txIds: string[]
): Promise<any[]> => {
  return new Promise(async (resolve) => {
    let params: any[] = [];
    txIds?.forEach((element, index) => {
      params.push({
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [element],
        id: index + 1,
      });
    });
    const response = await axios.post(rpc, params, {
      headers: { "Content-Type": "application/json" },
    });
    if (response && response?.data) return resolve(response?.data);
  });
};

export const ZeroAddress = "0x0000000000000000000000000000000000000000";

export const getIdByHash = (text: string) => {
  try {
    const bytes = bs58.decode(text);
    const hex = Buffer.from(bytes).toString("hex");
    const tokenId = hex.slice(4);
    return tokenId;
  } catch (err) {
    return null;
  }
};
