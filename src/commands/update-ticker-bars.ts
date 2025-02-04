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

let lastMarketDay = dayjs();
if (lastMarketDay.day() === 0) {
    lastMarketDay = lastMarketDay.subtract(2, 'day') // Sunday
} else if (lastMarketDay.day() === 6) {
    lastMarketDay = lastMarketDay.subtract(1, 'day') // Saturday
}

const backfillTicker = async (ticker: string) => {
    const { maxDate } = await tickerService.getMaxAndMinDateForTickers([ticker]);

    if (maxDate && dayjs(maxDate).isBefore(lastMarketDay.startOf('day'))) {
        console.log(`Fetching ticker bars for ${ticker} from ${maxDate} to ${lastMarketDay.format('YYYY-MM-DD')}`);
        const resp = await tiingoClient.getBarsForSymbol(ticker, maxDate);
        const result = await ohlcBarService.bulkInsert(ticker, resp.bars);
        console.log(`Backfilled ticker bars for ${ticker}`);
    }
}

await Promise.all(tickers.map(ticker => backfillTicker(ticker)));

console.log('Update complete');

process.exit(0);