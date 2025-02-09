import { OhlcBarRepository } from "../repositories/OhlcBarRepository";
import { OhlcCache } from "../services/OhlcCache";

const ohlcBarRepository = new OhlcBarRepository()
await ohlcBarRepository.debugBarsForDates(['AACG', 'AAPL', 'TQQQ'], '2010-02-11', '2025-02-07')



// const ohlcCache = new OhlcCache(
//     1265846400,
//     1265846400,
//     1738886400,
//     [ "AAPL", "TQQQ", "AACG" ],
//     [],
//     0,
// )
// await ohlcCache.load()
// const dates = ohlcCache.getDates()
// ohlcCache.getTickers().map(ticker => console.log(ticker, ohlcCache.getBars(ticker).length))

// const tableData: {[key: string]: { [key: string]: number | null }} = {}

// for (let i = 0; i < dates.length; i++) {
//     tableData[dates[i]] = {}
//     for (const ticker of ohlcCache.getTickers()) {
//         const bars = ohlcCache.getBars(ticker)
//         tableData[dates[i]][ticker] = bars[i] || null
//     }
// }

// console.table(tableData)


process.exit(0)