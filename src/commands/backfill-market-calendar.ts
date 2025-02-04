import dayjs from 'dayjs';
import { AlpacaStockClient } from '../clients/AlpacaClient';
import { MarketCalendarService } from '../services/MarketCalendarService';

const alpacaClient = new AlpacaStockClient();

const run = async () => {
    const marketCalendarService = new MarketCalendarService()
    const tradingDays = await alpacaClient.getMarketCalendar('1990-01-01')

    for (const tradingDay of tradingDays) {
        await marketCalendarService.insert({
            date: tradingDay.date,
            ts: dayjs(tradingDay.date).unix(),
            open: tradingDay.open,
            close: tradingDay.close,
            settlement_date: tradingDay.settlement_date,
        })
        console.log(`Inserted ${tradingDay.date}`)
    }

    console.log(`Done.`)
}
  
await run()

process.exit(0);