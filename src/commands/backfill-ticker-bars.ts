import dayjs from "dayjs";
import { TiingoClient } from "../clients/TiingoClient";
import { OhlcBarService } from '../services/OhlcBarService';
import { TickerService } from "../services/TickerService";

const tiingoClient = new TiingoClient();
const ohlcBarService = new OhlcBarService();
const tickerService = new TickerService();

let tickers = [];

const ticker = process.argv[2];

if (ticker) {
    tickers.push(ticker);
} else {
    tickers = (await tickerService.getAll()).map(ticker => ticker.ticker)
}

const backfillTicker = async (ticker: string) => {
    const { minDate } = await tickerService.getMaxAndMinDateForTickers([ticker]);

    console.log(`Fetching ticker bars for ${ticker} from ${minDate} to today`);
    const resp = await tiingoClient.getBarsForSymbol(ticker, dayjs(minDate).format('YYYY-MM-DD'));
    const result = await ohlcBarService.bulkInsert(ticker, resp.bars);
    console.log(`Backfilled ticker bars for ${ticker}`);
}

await Promise.all(tickers.map(ticker => backfillTicker(ticker)));

console.log('Backfill complete');

process.exit(0);