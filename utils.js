import {
  CANCELLATION,
  CANCELLATION_THRESHOLD,
  COMMA_SEPARATOR,
  ORDER,
} from "./constants";

export class CSVUtils {
  static parseCSV(line) {
    const [timestamp, company, orderType, quantityStr] =
      line.split(COMMA_SEPARATOR);

    if (!timestamp || !company || !orderType || isNaN(parseInt(quantityStr)))
      return null;

    return [timestamp, company, orderType, parseInt(quantityStr)];
  }
}

export class IntervalUtils {
  static isWithinSameInterval(startTime, currentTime) {
    return (currentTime - startTime) / 1000 <= 60;
  }

  static shiftSameTimestampEntries(tradesInterval) {
    const firstDate = tradesInterval[0][0];
    let index = 0;

    while (
      index < tradesInterval.length &&
      tradesInterval[index][0] === firstDate
    ) {
      index++;
    }

    return tradesInterval.slice(index);
  }

  static processActiveInterval(activeTrades, missBehavedCompanies) {
    const companyStats = new Map();

    for (const [_, company, orderType, quantity] of activeTrades) {
      if (missBehavedCompanies.has(company)) continue;
      if (!companyStats.has(company)) {
        companyStats.set(company, { orders: 0, cancels: 0 });
      }

      const stats = companyStats.get(company);
      if (orderType === ORDER) {
        stats.orders += quantity;
      } else if (orderType === CANCELLATION) {
        stats.cancels += quantity;
      }
    }

    for (const [company, { orders, cancels }] of companyStats) {
      const cancelRatio = cancels / (orders + cancels);
      if (cancelRatio > CANCELLATION_THRESHOLD) {
        missBehavedCompanies.add(company);
      }
    }
  }

  static setDifference(setA, setB) {
    // Set.difference not available in in node 18
    return new Set([...setA].filter((element) => !setB.has(element)));
  }
}
