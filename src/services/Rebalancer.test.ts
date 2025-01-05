import { describe, it, expect, beforeEach, jest } from "bun:test";
import { Rebalancer } from "./Rebalancer";
import { OhlcCache } from "./OhlcCache";
import { TiingoClient } from "../clients/TiingoClient";
import dayjs, { Dayjs } from "dayjs";
import type { OHLCBar } from "../backtester/types";

class MockOhlcCache extends OhlcCache {
  private barForDate: Record<string, Record<string, OHLCBar>> = {}

  setBarForDate(ticker: string, date: Dayjs, bar: OHLCBar): void {
    if (!this.barForDate[ticker]) {
      this.barForDate[ticker] = {}
    }
    this.barForDate[ticker][date.format('YYYY-MM-DD')] = bar
  }

  getBarForDate(ticker: string, date: Dayjs): OHLCBar {
    return this.barForDate[ticker][date.format('YYYY-MM-DD')]
  }
}

const barWithClose = (close: number) => {
  return {
    close: close,
    high: 1,
    low: 1, 
    open: 1, 
    date: '2024-01-01',
    volume: 1
  }
}

describe("Rebalancer", () => {
  let mockOhlcCache: MockOhlcCache

  beforeEach(() => {
    mockOhlcCache = new MockOhlcCache(new TiingoClient(), ['SPY', 'QQQ'])
  })
  
  it("Defaults to 10,000 starting balance", () => {
    const rebalancer = new Rebalancer(mockOhlcCache)
    expect(rebalancer.getPortfolioValue()).toEqual(10000);
  });

  it('Updates portfolio value correctly when holding the same asset over multiple rebalances', async () => {
    const rebalancer = new Rebalancer(mockOhlcCache)

    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-01'), barWithClose(500))
    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-02'), barWithClose(510))
    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-03'), barWithClose(490))

    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-01'), barWithClose(100))
    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-02'), barWithClose(110))
    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-03'), barWithClose(120))
    
    await rebalancer.rebalance(dayjs('2024-01-01'), {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10000);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10000
      }
    });

    rebalancer.rebalance(dayjs('2024-01-02'), {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10200);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10200
      }
    });

    rebalancer.rebalance(dayjs('2024-01-03'), {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getPortfolioValue()).toEqual(9800);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 9800
      }
    });
  })

  it('Rebalances correctly when selling 100% one asset and buying 100% another asset', async () => {
    const rebalancer = new Rebalancer(mockOhlcCache)

    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-01'), barWithClose(500))
    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-02'), barWithClose(510))
    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-03'), barWithClose(490))

    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-01'), barWithClose(100))
    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-02'), barWithClose(110))
    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-03'), barWithClose(120))
    
    await rebalancer.rebalance(dayjs('2024-01-01'), {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10000);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10000
      }
    });

    await rebalancer.rebalance(dayjs('2024-01-02'), {
      'SPY': null,
      'QQQ': 100
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10200);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 0,
        shares: 0,
        value: 0
      },
      QQQ: {
        percentage: 100,
        shares: 92.72727272727273,
        value: 10200
      }
    });

    await rebalancer.rebalance(dayjs('2024-01-03'), {
      'SPY': null,
      'QQQ': 100
    })

    expect(rebalancer.getPortfolioValue()).toEqual(11127.272727272728);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 0,
        shares: 0,
        value: 0
      },
      QQQ: {
        percentage: 100,
        shares: 92.72727272727273,
        value: 11127.272727272728
      }
    });
  })

  it('Rebalances correctly when selling 50% one asset and buying 50% another asset', async () => {
    const rebalancer = new Rebalancer(mockOhlcCache)

    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-01'), barWithClose(500))
    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-02'), barWithClose(510))
    mockOhlcCache.setBarForDate('SPY', dayjs('2024-01-03'), barWithClose(490))

    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-01'), barWithClose(100))
    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-02'), barWithClose(110))
    mockOhlcCache.setBarForDate('QQQ', dayjs('2024-01-03'), barWithClose(120))
    
    await rebalancer.rebalance(dayjs('2024-01-01'), {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10000);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10000
      }
    });

    await rebalancer.rebalance(dayjs('2024-01-02'), {
      'SPY': 75,
      'QQQ': 25
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10200);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 75,
        shares: 15,
        value: 7650
      },
      QQQ: {
        percentage: 25,
        shares: 23.181818181818183,
        value: 2550
      }
    });

    expect(
      rebalancer.getCurrentHoldings().SPY.percentage + rebalancer.getCurrentHoldings().QQQ.percentage
    ).toEqual(100)

    expect(
      rebalancer.getCurrentHoldings().SPY.value + rebalancer.getCurrentHoldings().QQQ.value
    ).toEqual(rebalancer.getPortfolioValue())

    await rebalancer.rebalance(dayjs('2024-01-03'), {
      'SPY': 50,
      'QQQ': 50
    })

    expect(rebalancer.getPortfolioValue()).toEqual(10131.818181818182);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 50,
        shares: 10.338589981447125,
        value: 5065.909090909091
      },
      QQQ: {
        percentage: 50,
        shares: 42.21590909090909,
        value: 5065.909090909091
      }
    });
    expect(
      rebalancer.getCurrentHoldings().SPY.percentage + rebalancer.getCurrentHoldings().QQQ.percentage
    ).toEqual(100)
    
    expect(
      rebalancer.getCurrentHoldings().SPY.value + rebalancer.getCurrentHoldings().QQQ.value
    ).toEqual(rebalancer.getPortfolioValue())
  })
});
