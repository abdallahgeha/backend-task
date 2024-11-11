import { COMMA_SEPARATOR } from "./constants";

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
}
