import { readFileSync, rm, rmSync } from 'fs';
import StreamZip from "node-stream-zip";
import dayjs from 'dayjs';
import { TickerService } from '../services/TickerService';
import { TiingoClient } from "../clients/TiingoClient";

const tiingoClient = new TiingoClient();
const tickerService = new TickerService();

const URL = "https://apimedia.tiingo.com/docs/tiingo/daily/supported_tickers.zip";
const ZIP_PATH = "./supported_tickers.zip";
const CSV_FILE = "supported_tickers.csv";

type Ticker = {
    ticker: string;
    exchange: string;
    assetType: string;
    startDate: string;
    endDate: string;
    priceCurrency: string;
}

const readCSV = async (filePath: string): Promise<any[]> => {
    const data = readFileSync(filePath, "utf8");
    const [header, ...rows] = data.trim().split("\n").map(line => line.split(","));
  
    return rows.map(row =>
      Object.fromEntries(row.map((value, index) => [header[index], value]))
    );
}

const insertTicker = async (ticker: Ticker) => {
    const metadata = await tiingoClient.getTickerMetadata(ticker.ticker);
    const inserted = await tickerService.insert({
        ticker: ticker.ticker,
        name: metadata.name,
        exchange_code: ticker.exchange,
        asset_type: ticker.assetType,
        start_date: ticker.startDate,
        start_ts: dayjs(ticker.startDate).unix(),
        end_date: ticker.endDate,
        end_ts: dayjs(ticker.endDate).unix(),
    });
    console.log(`Inserted ticker: ${inserted.ticker}`);
}

const deleteFiles = () => {
  rmSync(ZIP_PATH);
  rmSync(CSV_FILE);
}

const run = async () => {
    const response = await fetch(URL);
    if (!response.ok) {
        throw new Error("Failed to download file");
    }
    
    const zipBuffer = await response.arrayBuffer();
    await Bun.write(ZIP_PATH, new Uint8Array(zipBuffer));

    const zip = new StreamZip.async({ file: ZIP_PATH });
    await zip.extract(CSV_FILE, CSV_FILE);
    await zip.close();

    const filePath = CSV_FILE; // Change this to your CSV file path
    const records = await readCSV(filePath);

    // Filter for specific values
    const filteredTickers = records.filter(row => {
        // Only Stocks and ETFs
        if (row.assetType !== "Stock" && row.assetType !== "ETF") {
            return false;
        }

        // No tickers with numbers
        const regex = /^[A-Za-z]+$/
        if (!regex.test(row.ticker)) {
            return false;
        }

        // Only major exchanges
        if (row.exchange === "PINK" || row.exchange === "") {
            return false;
        }

        // Only tickers that Tiingo has data for
        if (row.startDate === "" || row.endDate === "") {
            return false;
        }

        // Only tickers that are traded in USD
        if (row.priceCurrency !== "USD") {
            return false;
        }

        // Only tickers that are traded in USD
        const endDate = dayjs(row.endDate);
        if (endDate.isBefore(dayjs().subtract(1, 'week'))) {
            return false;
        }

        // No OTC tickers
        if (row.exchange.startsWith('OTC')) {
            return false;
        }

        return true
    });
  
    await Promise.all(filteredTickers.map(insertTicker));

    deleteFiles();
}
  
await run()

process.exit(0);