declare interface TokenInterface {
  creator: string;
  groupId: string;
  pairName: string;
  chainId: string;
  pairAddress: string;
  dexUrl: string;
  baseTokenAddress: string;
  baseTokenName: string;
  baseTokenSymbol: string;
  baseTokenDecimals: number;
  quoteTokenAddress: string;
  quoteTokenName: string;
  quoteTokenSymbol: string;
  quoteTokenDecimals: number;
  mediaType: string;
  mediaId: string;
  emoji: string;
  min: number;
  step: number;
}

declare interface BlockNumInterface {
  latestTime: number;
  id: string;
}

declare interface GroupMessageInterface {
  groupId: number;
  type: string;
  mediaId: string;
  emoji: string;
  repeatNumber: number;
  usdAmount: number;
  tokenName: string;
  tokenAddress: string;
  tokenAmount: number;
  buyer: string;
  hash: string;
  marketcap: number;
  chartLink: string;
  buyLink: string;
}

declare interface SendMessageInterface {
  id: string | number;
  message: string;
  preview?: boolean;
  keyboards?: any;
}

declare interface AdInterface {
  creator: string;
  groupId: string;
  caption: String;
  link: String;
  expireTime: Number;
  hash: String;
}
