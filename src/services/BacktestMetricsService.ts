import { annualizedReturn } from "../metrics/annualizedReturn";
import { calmerRatio } from "../metrics/calmerRatio";
import { cumulativeReturn } from "../metrics/cumulativeReturn";
import { maximumDrawdown } from "../metrics/maximumDrawdown";
import { sharpeRatio } from "../metrics/sharpeRatio";
import { standardDeviationOfReturn } from "../metrics/standardDeviationOfReturn";
import { trailingPercentChange } from "../metrics/trailingPercentChange";
import type { BacktestResults } from "./Backtester"

export type BacktestMetrics = {
    cumulative_return: number,
    annualized_return: number,
    standard_deviation: number,
    max_drawdown: number,
    calmer: number,
    sharpe: number,
    tailing_1_month: number,
    tailing_3_month: number,
}

export class BacktestMetricsService {
  public getMetrics(backtestResults: BacktestResults): BacktestMetrics {
    if (backtestResults.starting_balance === undefined || backtestResults.ending_balance === undefined) {
        throw new Error("Starting and ending balance must be defined.");
    }

    if (backtestResults.allocation_history === undefined) {
        throw new Error("Balance history must be defined.");
    }

    const balanceHistory = backtestResults.allocation_history.map(r => r.value)

    const dailyReturns = this.calculateDailyReturns(balanceHistory);
    const cumulativeReturnMetric = cumulativeReturn(backtestResults.starting_balance, backtestResults.ending_balance);
    const annualizedReturnMetric = annualizedReturn(cumulativeReturnMetric, balanceHistory.length, 252);
    const standardDeviationMetric = standardDeviationOfReturn(dailyReturns);
    const calmerMetric = calmerRatio(annualizedReturnMetric, standardDeviationMetric);
    const sharpeMetric = sharpeRatio(dailyReturns);

    return {
        cumulative_return: cumulativeReturnMetric * 100,
        annualized_return: annualizedReturnMetric * 100,
        standard_deviation: standardDeviationMetric,
        max_drawdown: maximumDrawdown(balanceHistory) * 100,
        calmer: calmerMetric * 100,
        sharpe: sharpeMetric,
        tailing_1_month: trailingPercentChange(balanceHistory, 1, 'month'),
        tailing_3_month: trailingPercentChange(balanceHistory, 3, 'month'),
    }
  }

  private calculateDailyReturns(balances: number[]): number[] {
    if (balances.length < 2) {
        throw new Error("At least two balances are required to calculate returns.");
    }

    const returns: number[] = [];
    
    for (let i = 1; i < balances.length; i++) {
        const dailyReturn = (balances[i] - balances[i - 1]) / balances[i - 1];
        returns.push(dailyReturn * 100);
    }

    return returns;
}
}