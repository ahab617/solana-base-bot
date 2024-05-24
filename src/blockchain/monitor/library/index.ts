import setlog from "utils/setlog";
import { TokenController } from "controller";
import { baseEventHandler, solanaEventHandler } from "blockchain/handler";

let tokens: TokenInterface[] = [];

const updatePairAddresses = async () => {
  try {
    const _tokens = (await TokenController.find({
      filter: {
        groupId: { $ne: "" },
        pairAddress: { $ne: "" },
      },
    })) as TokenInterface[];
    tokens = _tokens;
  } catch (err) {
    console.log(err);
    setlog("updatePairAddresses", err.message);
  }
};

const buyEventHandler = async () => {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token && token.pairName && token.groupId) {
      if (token.chainId === "base") {
        baseEventHandler(token);
      } else if (token.chainId === "solana") {
        solanaEventHandler(token);
      }
    }
  }
};

const startBuyHandler = async () => {
  await updatePairAddresses();
  await buyEventHandler();
};

export { startBuyHandler };
