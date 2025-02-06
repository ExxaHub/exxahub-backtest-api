import dayjs from "dayjs";

export const trailingPercentChange = (
    history: number[], 
    dates: number[],
    lookbackValue: number, 
    lookbackInterval: 'day' | 'month' | 'year'
): number => {
    // Step 1: Find the most recent data point (the last value in the backtest)
    const mostRecentDate = dates[dates.length - 1];

    if (!mostRecentDate) {
        throw new Error("At least one data point is required.");
    }

    // Step 2: Get most recent date and calculate the target date based on the lookback period
    const targetDate = dayjs.unix(mostRecentDate).subtract(lookbackValue, lookbackInterval).startOf('day').unix();

    // Step 3: Find the value closest to the target date (from the specified lookback period)
    let startIndex = dates.length - 1

    // Iterate over the values array in reverse to find the closest date before or on the target date
    for (let index = dates.length - 1; index >= 0; index--) {
        const date = dates[index];

        if (date === targetDate || date <= targetDate) {
            startIndex = index;
            break;
        }
    }

    if (startIndex === null) {
        throw new Error("No data point found for the specified lookback period.");
    }

    const startValue = history[startIndex];
    const endValue = history[history.length - 1];

    // Step 4: Calculate the percent change
    return ((endValue - startValue) / startValue) * 100
};