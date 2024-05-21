import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  creator: String,
  groupId: String,
  pairName: String,
  chainid: String,
  pairAddress: String,
  dexUrl: String,
  baseTokenAddress: String,
  baseTokenName: String,
  baseTokenSymbol: String,
  baseTokenDecimals: Number,
  quoteTokenAddress: String,
  quoteTokenName: String,
  quoteTokenSymbol: String,
  quoteTokenDecimals: Number,
  mediaType: String,
  mediaId: String,
  emoji: String,
  min: Number,
  step: Number,
});

const AlertSchema = new Schema({
  hash: String,
  groupId: String,
});

const AdSchema = new Schema({
  creator: String,
  groupId: String,
  caption: String,
  link: String,
  expireTime: Number,
  hash: String,
});

export const Alerts = mongoose.model("alerts", AlertSchema);
export const Tokens = mongoose.model("tokens", TokenSchema);
export const Ads = mongoose.model("ads", AdSchema);
