/**
 * Calculates the maximum drawdown from an array of portfolio values (e.g., daily balances).
 *
 * @param values - An array of portfolio values (e.g., daily balances or prices).
 * @returns The maximum drawdown as a percentage.
 */
export const maximumDrawdown = (values: number[]): number => {
    if (values.length < 2) {
        throw new Error("At least two values are required to calculate drawdown.");
    }

    let peak = values[0]; // Initialize the peak with the first value
    let maxDrawdown = 0;

    // Iterate through the array of values
    for (let i = 1; i < values.length; i++) {
        const currentValue = values[i];
        
        // Update the peak value if the current value is higher
        if (currentValue > peak) {
            peak = currentValue;
        }

        // Calculate the drawdown as the percentage decline from the peak
        const drawdown = (peak - currentValue) / peak;

        // Track the maximum drawdown
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
        }
    }

    return maxDrawdown;
}
