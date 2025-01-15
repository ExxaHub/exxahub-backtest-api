/**
 * Calculates the Sharpe Ratio, a measure of risk-adjusted return.
 * If the risk-free rate is unknown, it defaults to 0.
 * 
 * @param returns - An array of returns (e.g., daily returns).
 * @param riskFreeRate - The risk-free rate (as a decimal, e.g., 0.02 for 2%). Defaults to 0 if unknown.
 * @param periodsInYear - The number of periods in a year (default is 252 for daily returns).
 * @returns The Sharpe ratio.
 */
export const sharpeRatio = (returns: number[], riskFreeRate: number = 0, periodsInYear: number = 252): number => {
    if (returns.length < 2) {
        throw new Error("At least two returns are required to calculate the Sharpe ratio.");
    }

    // Step 1: Calculate the mean return (arithmetic mean)
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Step 2: Calculate the standard deviation (annualized)
    const standardDeviation = Math.sqrt(returns.reduce((sum, r) => sum + (r - meanReturn) ** 2, 0) / (returns.length - 1)) * Math.sqrt(periodsInYear);

    // Step 3: Subtract the risk-free rate (annualized) and calculate the excess return
    const excessReturn = (meanReturn - riskFreeRate) * periodsInYear;

    // Step 4: Calculate the Sharpe Ratio
    return excessReturn / standardDeviation;
}

