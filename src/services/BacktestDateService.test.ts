import { describe, it, expect, mock } from "bun:test";
import dayjs from "dayjs";
import { BacktestDateService } from "./BacktestDateService";

mock.module("../repositories/TickerRepository", () => {
  return {
    TickerRepository: class {
      getMaxAndMinDateForTickers(tickers: string[]) {
        return Promise.resolve({
          minDate: dayjs("2024-01-02").unix(),
          maxDate: dayjs("2024-12-30").unix(),
        });
      }
    }
  };
});

mock.module("../repositories/MarketCalendarRepository", () => {
  return {
    MarketCalendarRepository: class {
      getMarketCalendarDateFromOffset(dateUnix: number, offset: number) {
        // Simplified offset calculation for testing
        return Promise.resolve(dateUnix - offset * 86400);
      }
    }
  };
});

describe("BacktestDateService", () => {
  it("Adjusts end date to today if provided date is in the future", async () => {
    const service = new BacktestDateService();
    const tomorrow = dayjs().add(1, 'day').format("YYYY-MM-DD");
    const result = await service.calculateBacktestDates(
      "2024-01-02",
      tomorrow,
      ["SPY"],
      ["SPY"],
      5,
      10
    );
    expect(result.tradeableEndDate).toBeLessThanOrEqual(dayjs().unix());
  });

  it("Adjusts weekend start date forward to Monday when given a Saturday", async () => {
    const service = new BacktestDateService();
    const saturday = dayjs("2024-11-09").format("YYYY-MM-DD"); // 2024-11-09 is a Saturday
    const result = await service.calculateBacktestDates(
      saturday,
      "2024-11-15",
      ["SPY"],
      ["QQQ"],
      5,
      10
    );
    const startDayOfWeek = dayjs.unix(result.tradeableStartDate).day();
    expect(startDayOfWeek).toBe(1); // Monday
  });

  it("Uses ticker and indicator min/max to constrain final dates", async () => {
    const service = new BacktestDateService();
    const result = await service.calculateBacktestDates(
      "2023-12-30",
      "2024-12-31",
      ["SPY"],
      ["QQQ"],
      5,
      10
    );
    // The earliest start date from minDate is 2024-01-02
    expect(dayjs.unix(result.tradeableStartDate).format("YYYY-MM-DD")).toBe("2024-01-02");
    // The latest end date from maxDate is 2024-12-30
    expect(dayjs.unix(result.tradeableEndDate).format("YYYY-MM-DD")).toBe("2024-12-30");
  });
});