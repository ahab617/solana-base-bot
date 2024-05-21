import axios from "axios";

export const getTransactionsOfWorld = async (address: string) => {
  const res = await axios.post(`https://api.web3.world/v2/transactions`, {
    limit: 10,
    offset: 0,
    ordering: "blocktimedescending",
    whiteListUri: "https://static.web3.world/assets/manifest.json",
    eventType: ["swap"],
    currencyAddress: address,
  });
  const txs = res.data;
  return txs?.transactions || [];
};

export const getTokenPrice = async (address: string) => {
  const res = await axios.post(
    `https://api.web3.world/v1/currencies_usdt_prices`,
    {
      currency_addresses: [address],
    }
  );
  const txs = res.data;
  return txs;
};

export const getPairAddresses = async (address: string) => {
  const res = await axios.post(`https://api.web3.world/v2/pools`, {
    limit: 10,
    offset: 0,
    ordering: "tvldescending",
    whiteListUri: "https://static.web3.world/assets/manifest.json",
    currencyAddress: address,
  });
  const poolData = res.data;
  let infos = [] as any[];
  const pools = poolData?.pools || [];
  pools.forEach((_element: any) => {
    const _data = _element?.meta;
    if (_data) {
      infos.push(_data);
    }
  });
  return infos;
};

export const getTokenData = async (address: string) => {
  const res = await axios.get(
    `https://api.web3.world/v1/currencies/${address}`
  );
  const token = res.data;
  return token || null;
};
