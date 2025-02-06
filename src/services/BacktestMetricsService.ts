import { annualizedReturn } from "../metrics/annualizedReturn";
import { calmerRatio } from "../metrics/calmerRatio";
import { cumulativeReturn } from "../metrics/cumulativeReturn";
import { formatDuration } from "../metrics/duration";
import { maximumDrawdown } from "../metrics/maximumDrawdown";
import { sharpeRatio } from "../metrics/sharpeRatio";
import { standardDeviationOfReturn } from "../metrics/standardDeviationOfReturn";
import { trailingPercentChange } from "../metrics/trailingPercentChange";
import type { AllocationResult } from "./Backtester"

export type BacktestMetrics = {
    duration: string,
    cumulative_return: number,
    annualized_return: number,
    standard_deviation: number,
    max_drawdown: number,
    calmer: number,
    sharpe: number,
    trailing_1_month: number | null,
    trailing_3_month: number | null,
}

export class BacktestMetricsService {
    private dates: number[] = []

    constructor(dates: number[]) {
        this.dates = dates
    }

    public getMetrics(startingBalance: number, endingBalance: number, history: AllocationResult[]): BacktestMetrics {
        if (startingBalance === undefined || endingBalance === undefined) {
            throw new Error("Starting and ending balance must be defined.");
        }

        const balanceHistory = history.map(r => r.value)

        const duration = formatDuration(this.dates[0], this.dates[this.dates.length - 1]);
        const dailyReturns = this.calculateDailyReturns(balanceHistory);
        const cumulativeReturnMetric = cumulativeReturn(startingBalance, endingBalance);
        const annualizedReturnMetric = annualizedReturn(cumulativeReturnMetric, balanceHistory.length, 252);
        const standardDeviationMetric = standardDeviationOfReturn(dailyReturns);
        const calmerMetric = calmerRatio(annualizedReturnMetric, standardDeviationMetric);
        const sharpeMetric = sharpeRatio(dailyReturns);

        let trailing1Month = null
        try {
            trailing1Month = trailingPercentChange(balanceHistory, this.dates, 1, 'month')
        } catch (e) {
            console.error(e)
        }

        let trailing3Month = null
        try {
            trailing3Month = trailingPercentChange(balanceHistory, this.dates, 3, 'month')
        } catch (e) {
            console.error(e)
        }

        return {
            duration: duration,
            cumulative_return: cumulativeReturnMetric * 100,
            annualized_return: annualizedReturnMetric * 100,
            standard_deviation: standardDeviationMetric,
            max_drawdown: maximumDrawdown(balanceHistory) * 100,
            calmer: calmerMetric * 100,
            sharpe: sharpeMetric,
            trailing_1_month: trailing1Month,
            trailing_3_month: trailing3Month,
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