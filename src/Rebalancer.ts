import { type Allocations } from "./Interpreter"

export class Rebalancer {
    private currentAllocations: Allocations = {}

    rebalance(newAllocations: Allocations) {
        const buy: Allocations = {};
        const sell: Allocations = {};
      
        for (const ticker in newAllocations) {
          const current = this.currentAllocations[ticker] || 0;
          const updated = newAllocations[ticker];
      
          if (updated === null) {
            if (current > 0) {
                sell[ticker] = current;  
            }
          } else {
            if (updated > current) {
              buy[ticker] = updated - current;
            } else if (updated < current) {
              sell[ticker] = current - updated;
            }
          }
        }

        console.log({ buy, sell })

        this.currentAllocations = newAllocations
      
        return { buy, sell };
    }
}