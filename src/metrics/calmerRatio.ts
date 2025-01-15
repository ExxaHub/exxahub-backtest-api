/**
 * Calculates the Calmar Ratio, a measure of risk-adjusted return.
 * 
 * @param annualizedReturn - The annualized return of the investment.
 * @param maxDrawdown - The maximum drawdown of the investment.
 * @returns The Calmar Ratio.
 * @throws An error if the annualized return or maximum drawdown is not positive.
 */
export const calmerRatio = (annualizedReturn: number, maxDrawdown: number): number => {
    if (annualizedReturn <= 0) {
        throw new Error("Annualized return must be greater than zero.");
    }

    // Step 3: Calculate the Calmar Ratio
    if (maxDrawdown <= 0) {
        throw new Error("Maximum drawdown must be greater than zero.");
    }

    return annualizedReturn / maxDrawdown;
}
