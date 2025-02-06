import { describe, it, expect, beforeEach } from "bun:test";
import { Rebalancer } from "./Rebalancer";
import { OhlcCache } from "./OhlcCache";
import dayjs, { Dayjs } from "dayjs";
import type { OHLCBar } from "../types/types";

class MockOhlcCache extends OhlcCache {
  setBars(ticker: string, bars: number[]): void {
    this.cachedOhlcBars.set(ticker, bars)
  }
}

describe("Rebalancer", () => {
  let mockOhlcCache: MockOhlcCache

  beforeEach(() => {
    const indicatorStartDate = dayjs('2024-01-01').unix()
    const tradeableStartDate = dayjs('2024-01-01').unix()
    const tradeableEndDate = dayjs('2024-01-03').unix()
    const tradeableAssets = ['SPY', 'QQQ']
    const indicatorAssets = ['SPY']
    const maxWindow = 5

    mockOhlcCache = new MockOhlcCache(
      indicatorStartDate,
      tradeableStartDate,
      tradeableEndDate,
      tradeableAssets,
      indicatorAssets,
      maxWindow
    )
  })
  
  it("Defaults to 10,000 starting balance", () => {
    const rebalancer = new Rebalancer(mockOhlcCache)
    expect(rebalancer.getBalance()).toEqual(10000);
  });

  it('Updates portfolio value correctly when holding the same asset over multiple rebalances', async () => {
    const rebalancer = new Rebalancer(mockOhlcCache)

    mockOhlcCache.setBars('SPY', [500, 510, 490])
    mockOhlcCache.setBars('QQQ', [100, 110, 120])

    await rebalancer.rebalance(0, {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getBalance()).toEqual(10000);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10000
      }
    });

    rebalancer.rebalance(1, {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getBalance()).toEqual(10200);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10200
      }
    });

    rebalancer.rebalance(2, {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getBalance()).toEqual(9800);
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

    mockOhlcCache.setBars('SPY', [500, 510, 490])
    mockOhlcCache.setBars('QQQ', [100, 110, 120])

    await rebalancer.rebalance(0, {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getBalance()).toEqual(10000);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10000
      }
    });

    await rebalancer.rebalance(1, {
      'SPY': null,
      'QQQ': 100
    })

    expect(rebalancer.getBalance()).toEqual(10200);
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

    await rebalancer.rebalance(2, {
      'SPY': null,
      'QQQ': 100
    })

    expect(rebalancer.getBalance()).toEqual(11127.27);
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

    mockOhlcCache.setBars('SPY', [500, 510, 490])
    mockOhlcCache.setBars('QQQ', [100, 110, 120])

    await rebalancer.rebalance(0, {
      'SPY': 100,
      'QQQ': null
    })

    expect(rebalancer.getBalance()).toEqual(10000);
    expect(rebalancer.getCurrentHoldings()).toEqual({
      SPY: {
        percentage: 100,
        shares: 20,
        value: 10000
      }
    });

    await rebalancer.rebalance(1, {
      'SPY': 75,
      'QQQ': 25
    })

    expect(rebalancer.getBalance()).toEqual(10200);
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
    ).toEqual(rebalancer.getBalance())

    await rebalancer.rebalance(2, {
      'SPY': 50,
      'QQQ': 50
    })

    expect(rebalancer.getBalance()).toEqual(10131.82);
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
      parseFloat((rebalancer.getCurrentHoldings().SPY.value + rebalancer.getCurrentHoldings().QQQ.value).toFixed(2))
    ).toEqual(rebalancer.getBalance())
  })
});
