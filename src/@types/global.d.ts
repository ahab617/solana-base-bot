declare interface TokenInterface {
  creator: string;
  groupId: string;
  pairName: string;
  chainid: string;
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
  groupId: string;
  type: "video" | "image";
  mediaId: string;
  tokenName: string;
  tokenSymbol: string;
  emoji: string;
  usdPrice: number;
  amount1: number;
  symbol1: string;
  amount2: number;
  symbol2: string;
  buyerLink: string;
  txLink: string;
  marketcap: number;
  balance: number;
  position: number;
  links: {
    name: string;
    link: string;
  }[];
  adCaption?: String;
  adLink?: String;
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
