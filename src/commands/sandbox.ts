import { OhlcBarRepository } from "../repositories/OhlcBarRepository";

const ohlcBarRepository = new OhlcBarRepository()

console.log(await ohlcBarRepository.getBarsForDates(['TQQQ', 'PSQ'], 1265846400, 1738540800))

process.exit(0)