import dayjs from "dayjs";
import { MarketCalendarService } from "../../services/MarketCalendarService";
import { TickerService } from "../../services/TickerService";
import type { Ticker } from "../../models/Ticker";
import { TiingoClient } from "../../clients/TiingoClient";
import { OhlcBarService } from "../../services/OhlcBarService";
import { parseExpression } from "cron-parser";

export class FetchLatestBars {
    private marketCalendarService: MarketCalendarService
    private tickerService: TickerService
    private tiingoClient: TiingoClient
    private ohlcBarService: OhlcBarService
    private today: string

    constructor() {
        this.marketCalendarService = new MarketCalendarService()
        this.tickerService = new TickerService()
        this.tiingoClient = new TiingoClient();
        this.ohlcBarService = new OhlcBarService();
        this.today = dayjs().format('YYYY-MM-DD');
    }

    shouldExecute(): boolean {
        const interval = dayjs(parseExpression(this.schedule(), { tz: this.timezone() }).prev().toISOString()).startOf('minute').toISOString()
        const now = dayjs().startOf('minute').toISOString()
        return interval === now;
    }

    /**
     *  5   - Minute (at the 5th minute)
     *  16  - Hour (4 PM in 24-hour format)
     *  *   - Day of the month (every day)
     *  *   - Month (every month)
     *  1-5 - Day of the week (1 = Monday, 5 = Friday)
     */
    schedule(): string {
        return '* * * * 1-5'
        // return '5 16 * * 1-5'
    }

    timezone(): string {
        return 'America/New_York'
    }

    public async run() {
        const marketIsOpenToday = await this.marketCalendarService.marketIsOpenOnDate(this.today);
     
        if (!marketIsOpenToday) {
            console.log('Market is closed today. Skipping fetch of latest bars.');
            return
        }
     
        const tickers = await this.tickerService.getAll()
     
        await Promise.all(tickers.map(ticker => this.backfillTicker(ticker)));

        console.log('Done.');
    }

    private backfillTicker = async (ticker: Ticker) => {
        const endDate = dayjs(ticker.end_date).format('YYYY-MM-DD');
        
        if (endDate === this.today) {
            return 
        }

        console.log(`Fetching ticker bars for ${ticker.ticker} from ${endDate} to ${this.today}`);

        const resp = await this.tiingoClient.getBarsForSymbol(ticker.ticker, endDate, this.today);

        console.log(`Fetched ${resp.bars.length} bars for ${ticker.ticker}`);

        if (resp.bars.length === 0) {
            return 
        }
        
        const result = await this.ohlcBarService.saveBars({
            [resp.symbol]: resp.bars
        });

        const tickers = await this.tickerService.updateEndDate(ticker.ticker, this.today);
    }
    
}