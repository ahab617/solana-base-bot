import axios from "axios";
import Moralis from "moralis";
import solanaWeb3 from "@solana/web3.js";
import splToken from "@solana/spl-token";

export const getTokenPairs = async (address: string) => {
  try {
    const res = await axios.get(
      `https://api.dexscreener.io/latest/dex/tokens/${address}`
    );
    return res.data.pairs;
  } catch (err) {
    return null;
  }
};

export const getBaseTokenMetadata = async (address: string) => {
  const response = await Moralis.EvmApi.token.getTokenMetadata({
    chain: "0x2105",
    addresses: [address],
  });
  const raw = response.raw[0] as any;
  const totalSupply = Number(raw?.total_supply || 0);
  const decimals = Number(raw?.decimals || 0);

  return { decimals, totalSupply };
};

export const getBaseTokenPrice = async (
  address: string,
  pairAddress: string
) => {
  try {
    const res = await axios.get(
      `https://api.dexscreener.io/latest/dex/tokens/${address}`
    );
    const pairs = res.data.pairs;
    const pair = pairs.filter((pair: any) => {
      return pair.pairAddress === pairAddress;
    });
    return pair[0].priceUsd;
  } catch (err) {
    return null;
  }
};

export const getBaseTokenBalance = async (
  address: string,
  tokenAddress: string
) => {
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: "0x2105",
    address: address,
    tokenAddresses: [tokenAddress],
  });

  const raw = response.raw[0] as any;
  const balance = Number(raw?.balance || 0);
  return balance;
};

export const getSolanaTokenDecimals = async (address: string) => {
  const connection = new solanaWeb3.Connection(
    "https://api.mainnet-beta.solana.com"
  );

  const publicKey = new solanaWeb3.PublicKey(address);
  const tokenAccountInfo = await connection.getParsedAccountInfo(publicKey);
  console.log(
    "🚀 ~ getSolanaTokenDecimals ~ tokenAccountInfo:",
    tokenAccountInfo
  );
  const info = await connection.getBalance(publicKey);
  console.log("🚀 ~ getSolanaTokenDecimals ~ info:", info);
  if (!tokenAccountInfo || !tokenAccountInfo.value) {
    console.error("Token metadata not found");
    return null;
  }
  const { data } = tokenAccountInfo.value as any;
  console.log("🚀 ~ getSolanaTokenDecimals ~ data:", data);
  return Number(data?.parsed?.info.decimals);
};
