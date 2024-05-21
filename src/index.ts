import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import config from "config.json";
import { initBot } from "./bot/index";
import { startBuyHandler } from "blockchain/monitor/library";
import Moralis from "moralis";

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
      await Moralis.start({ apiKey: config.APIKey });
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

connectDatabase(config.mongoURI)
  .then(async () => {
    app.listen(config.port, async () => {
      console.log(`Server listening on ${config.port} port`);
    });
    initBot();
    await Moralis.start({ apiKey: config.APIKey });

    const response = await Moralis.EvmApi.token.getTokenMetadata({
      chain: "0x2105",
      addresses: ["0x5c5EbFa9ffE0D09c2b9F3e1d802c5Ff2Ff2Dd5fe"],
    });

    console.log(response.raw);

    startBuyHandler();
  })
  .catch((err: any) => {
    console.log(err);
  });
