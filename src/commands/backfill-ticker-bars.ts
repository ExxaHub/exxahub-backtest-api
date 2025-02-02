import { TiingoClient } from "../clients/TiingoClient";
import { OhlcBarService } from '../services/OhlcBarService';

const tiingoClient = new TiingoClient();
const ohlcBarService = new OhlcBarService();

const ticker = process.argv[2];

console.log(`Backfilling ticker bars for ${ticker}`);

const resp = await tiingoClient.getBarsForSymbol(ticker);

const result = await ohlcBarService.bulkInsert(ticker, resp.bars);

console.log('Backfill complete');

process.exit(0);