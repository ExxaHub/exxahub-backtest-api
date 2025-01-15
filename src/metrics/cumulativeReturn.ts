
export const cumulativeReturn = (startingBalance: number, endingBalance: number): number => {
    if (startingBalance === 0) {
        throw new Error("Starting balance cannot be 0");
    }
    return ((endingBalance - startingBalance) / startingBalance);
}