export const annualizedReturn = (cumulativeReturn: number, totalPeriods: number, periodsInYear: number): number => {
    if (totalPeriods <= 0 || periodsInYear <= 0) {
        throw new Error("Periods must be greater than zero.");
    }
    return Math.pow(1 + cumulativeReturn, periodsInYear / totalPeriods) - 1;
}