/**
 * Calculates the annualized standard deviation (volatility) of an array of daily returns.
 *
 * @param returns - An array of daily returns.
 * @param periodsInYear - The number of periods in a year (default is 252 for trading days).
 * @returns The annualized standard deviation of the returns.
 */
const standardDeviationOfReturn = (returns: number[], periodsInYear: number = 252): number => {
    if (returns.length === 0) {
        throw new Error("Returns array must not be empty.");
    }
    if (periodsInYear <= 0) {
        throw new Error("Periods in a year must be greater than zero.");
    }

    // Step 1: Calculate the mean (average)
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Step 2: Calculate the variance
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;

    // Step 3: Calculate the standard deviation
    const standardDeviation = Math.sqrt(variance);

    // Step 4: Annualize the standard deviation
    return standardDeviation * Math.sqrt(periodsInYear);
}

export { standardDeviationOfReturn };