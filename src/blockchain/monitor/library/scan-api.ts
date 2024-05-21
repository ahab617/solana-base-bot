import axios from "axios";
import Moralis from "moralis";
import config from "../../../config.json";

export const getTokenPairs = async (address: string) => {
  try {
    const res = await axios.get(
      `https://api.dexscreener.io/latest/dex/tokens/${address}`
    );
    console.log(res.data.pairs);
    return res.data.pairs;
  } catch (err) {
    return null;
  }
};

export const getBaseTokenDecimals = async (address: string) => {
  const response = await Moralis.EvmApi.token.getTokenMetadata({
    chain: "0x2105",
    addresses: [address],
  });

  return Number(response.raw[0].decimals);
};

export const getTransactions = async (address: string) => {
  try {
    const res = await axios.post(
      `https://api.venomscan.com/v1/transactions/list`,
      {
        includeAccounts: [address],
        txTypes: ["Ordinary"],
        limit: 50,
        offset: 0,
        ordering: {
          column: "time",
          direction: "DESC",
        },
      }
    );
    const txs = res.data;
    return txs;
  } catch (err) {
    // console.log(err)
    return null;
  }
};

export const getTransactionData = async (hash: string) => {
  try {
    const res = await axios.post(`https://api.venomscan.com/v1/transactions`, {
      id: hash,
    });
    const txs = res.data;
    return txs;
  } catch (Err) {
    // console.log(Err)
    return null;
  }
};

export const getTokenMeta = async (address: string) => {
  try {
    if (!address) return null;
    const res = await axios.get(
      `https://tokens.venomscan.com/v1/root_contract/root_address/${address}`
    );
    const txs = res.data;
    return txs;
  } catch (Err) {
    console.log(Err);
    return null;
  }
};

export const getTokenBalance = async (token: string, address: string) => {
  try {
    if (!token || !address) return 0;
    const res = await axios.post(`https://tokens.venomscan.com/v1/balances`, {
      limit: 2,
      offset: 0,
      rootAddress: token,
      ownerAddress: address,
      ordering: "amountdescending",
    });
    const data = res.data;
    const balance = Number(data?.balances?.[0]?.amount || 0) || 0;
    return balance;
  } catch (Err) {
    return 0;
  }
};
