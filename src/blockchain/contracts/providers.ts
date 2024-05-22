import { toChecksumAddress } from "blockchain/util";
import { ethers } from "ethers";

const supportChainId = 1;

export const RPCS = {
  1: "https://ethereum.blockpi.network/v1/rpc/public",
  5: "https://rpc.ankr.com/eth_goerli",
  97: "https://bsc-testnet.public.blastapi.io",
  250: "https://fantom-mainnet.gateway.pokt.network/v1/lb/62759259ea1b320039c9e7ac",
  4002: "https://fantom-testnet.public.blastapi.io",
  421613: "https://goerli-rollup.arbitrum.io/rpc",
  56: "https://bsc-dataseed.bnbchain.org",
  11155111: "https://rpc.sepolia.org",
  8453: "https://mainnet.base.org",
};

export const providers: any = {
  1: new ethers.providers.JsonRpcProvider(RPCS[1]),
  5: new ethers.providers.JsonRpcProvider(RPCS[5]),
  250: new ethers.providers.JsonRpcProvider(RPCS[250]),
  97: new ethers.providers.JsonRpcProvider(RPCS[97]),
  56: new ethers.providers.JsonRpcProvider(RPCS[56]),
  4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
  421613: new ethers.providers.JsonRpcProvider(RPCS[421613]),
  11155111: new ethers.providers.JsonRpcProvider(RPCS[11155111]),
  8453: new ethers.providers.JsonRpcProvider(RPCS[8453]),
};

const networkNames = {
  1: "Ethereum",
  5: "Ethereum Goerli",
  97: "Binance Testnet",
  250: "Fantom",
  4002: "Fantom Testnet",
  421613: "Arbitrum Goerli",
  42161: "Arbitrum",
  11155111: "Sepolia Testnet",
  8453: "Base Mainnet",
};

export const provider = providers[8453];

import Abis from "./api.json";
export const getPairContract = (address: string) => {
  return new ethers.Contract(toChecksumAddress(address), Abis.pair, provider);
};
