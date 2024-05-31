import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import config from "config.json";
import { initBot } from "./bot/index";
import { startBuyHandler } from "blockchain/monitor/library";
import Moralis from "moralis";
import axios from "axios";
import { sleep } from "utils/blockchain";

const app: express.Express = express();

const connectDatabase = async (mongoUrl: string) => {
  try {
    const options = {
      autoCreate: true,
      retryReads: true,
    } as mongoose.ConnectOptions;
    mongoose.set("strictQuery", true);
    const result = await mongoose.connect(mongoUrl, options);
    if (result) {
      console.log("MongoDB connected");
      await Moralis.start({ apiKey: config.baseAPIKey });
      await initBot();
      await startBuyHandler();
    }
  } catch (err) {
    console.log("ConnectDatabase", err);
  }
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
  })
);

const { Builder } = require("selenium-webdriver");
require("chromedriver");

let fs = require("fs");

async function takeScreenshot(url: string) {
  //Wait for browser to build and launch properly
  let driver = await new Builder().forBrowser("chrome").build();

  //Navigate to the url passed in
  await driver.get(url);

  await sleep(30000);

  //Capture the screenshot
  let image = await driver.takeScreenshot();
  console.log("🚀 ~ takeScreenshot ~ image:", image);

  await fs.writeFileSync("./nyt-selenium.png", image, "base64");
  await driver.quit();
}

connectDatabase(config.mongoURI)
  .then(async () => {
    app.listen(config.port, async () => {
      console.log(`Server listening on ${config.port} port`);
      // captureChart(chartUrl, outputPath)
      //   .then(() => console.log("Chart captured successfully"))
      //   .catch((err) => console.error("Error capturing chart:", err));
      // logPageContent(
      //   "https://www.dextools.io/widget-chart/en/solana/pe-light/FCEnSxyJfRSKsz6tASUENCsfGwKgkH6YuRn1AMmyHhZn?theme=light&chartType=2&chartResolution=30&drawingToolbars=false"
      // )
      //   .then(() => console.log("Page content logged successfully"))
      //   .catch((err) => console.error("Error logging page content:", err));
      // await takeScreenshot(
      //   `https://dextoolchart.netlify.app/solana/FCEnSxyJfRSKsz6tASUENCsfGwKgkH6YuRn1AMmyHhZn`
      // );
    });
  })
  .catch((err: any) => {
    console.log(err);
  });
