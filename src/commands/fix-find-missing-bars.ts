import dayjs from 'dayjs';
import { OhlcBarService } from '../services/OhlcBarService';
import { TickerService } from '../services/TickerService';

const tickerService = new TickerService();
const ohlcBarService = new OhlcBarService();

const run = async () => {
    let tickers

    if (process.argv[2]) {
        const ticker = await tickerService.getTicker(process.argv[2]);

        if (!ticker) {
            console.log(`Ticker ${process.argv[2]} not found.`);
            process.exit(1);
        }


        tickers = [ticker]
    } else {
        tickers = await tickerService.getAll();
    }

    for (const ticker of tickers) {
        const missingBarDates = await ohlcBarService.findMissingBars(ticker.ticker, ticker.start_date, ticker.end_date);

        console.log(`Ticker: ${ticker.ticker} - ${missingBarDates.length} missing bars.`);
        
        if (tickers.length === 1) {
            if (missingBarDates.length > 0) {
                for (const date of missingBarDates) {
                    console.log(dayjs(date).format('YYYY-MM-DD'));
                }
            }
        }
    }
    
    console.log(`Done.`);
}
  
await run()

process.exit(0);