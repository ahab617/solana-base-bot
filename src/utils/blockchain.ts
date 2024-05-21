import colors from "colors";
import cron from "node-cron";
import { Now, callRpc } from "./index";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
