import dayjs from "dayjs";
import { TiingoClient } from "../clients/TiingoClient";
import { OhlcBarService } from '../services/OhlcBarService';
import { TickerService } from "../services/TickerService";

const tiingoClient = new TiingoClient();
const ohlcBarService = new OhlcBarService();
const tickerService = new TickerService();

// const ticker = process.argv[2];

// if (ticker) {
//     tickers.push(...ticker.split(','));
// } else {
//     tickers = (await tickerService.getAll()).map(ticker => ticker.ticker)
// }

// Read a text file with one ticker per line into an array of tickers
const tickers = require('fs').readFileSync('tickers.txt', 'utf-8').split(/\r?\n/);

const backfillTicker = async (ticker: string) => {
    // sleep for 1 second to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));

    const { minDate } = await tickerService.getMaxAndMinDateForTickers([ticker]);
    const minDateFormatted = dayjs.unix(minDate).format('YYYY-MM-DD');
    const maxDateFormatted = dayjs().format('YYYY-MM-DD');

    console.log(`Backfilling ${ticker} from ${minDateFormatted} to ${maxDateFormatted}`);
    
    const resp = await tiingoClient.getBarsForSymbol(ticker, minDateFormatted, maxDateFormatted);

    await ohlcBarService.bulkInsert(ticker, resp.bars);
    await tickerService.updateEndDate(ticker, maxDateFormatted);
    
    console.log(`Backfilled ${ticker} with ${resp.bars.length} bars`);
}

for (const ticker of tickers) {
    await backfillTicker(ticker)
}

console.log('Backfill complete');

process.exit(0);