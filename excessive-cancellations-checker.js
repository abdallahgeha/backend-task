import fs from "fs";
import readline from "readline/promises";
import {
  CANCELLATION,
  CANCELLATION_THRESHOLD,
  COMMA_SEPARATOR,
  ORDER,
} from "./constants";

export class ExcessiveCancellationsChecker {
  /* 
        We provide a path to a file when initiating the class
        you have to use it in your methods to solve the task
    */
  constructor(filePath) {
    this.filePath = filePath;
    this.allCompanies = new Set();
    this.missBehavedCompanies = new Set();
    this.activeIntervalTrades = [];
    this.intervalStartTime = null;
  }
  /**
   * Returns the list of companies that are involved in excessive cancelling.
   * Note this should always resolve an array or throw error.
   */
  async companiesInvolvedInExcessiveCancellations() {
    await this.#processFile();
    return [...this.missBehavedCompanies];
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * Note this should always resolve a number or throw error.
   */
  async totalNumberOfWellBehavedCompanies() {
    await this.#processFile();
    const goodCompanies = this.#setDifference(
      this.allCompanies,
      this.missBehavedCompanies
    );
    return [...goodCompanies].length;
  }

  async #processFile() {
    const readInterface = readline.createInterface({
      input: fs.createReadStream(this.filePath),
      crlfDelay: Infinity,
    });

    try {
      for await (const line of readInterface) {
        const parsedData = this.#parseCSV(line);
        if (!parsedData) continue;

        const [timestamp, company] = parsedData;

        this.allCompanies.add(company);
        const currentTime = new Date(timestamp);

        if (!this.intervalStartTime) {
          this.intervalStartTime = currentTime;
        }

        if (
          this.#isWithinSameInterval(this.intervalStartTime, currentTime) ||
          timestamp === this.activeIntervalTrades.at(-1)?.[0]
        ) {
          this.activeIntervalTrades.push(parsedData);
        } else {
          this.#processActiveInterval();
          this.activeIntervalTrades = this.#shiftSameTimestampEntries(
            this.activeIntervalTrades
          );
          this.activeIntervalTrades.push(parsedData);
        }
      }

      if (this.activeIntervalTrades.length > 0) {
        this.#processActiveInterval();
      }
    } catch (error) {
      throw error;
    } finally {
      readInterface.close();
    }
  }

  #parseCSV(line) {
    const [timestamp, company, orderType, quantityStr] =
      line.split(COMMA_SEPARATOR);

    if (!timestamp || !company || !orderType || isNaN(parseInt(quantityStr)))
      return null;

    return [timestamp, company, orderType, parseInt(quantityStr)];
  }

  #processActiveInterval() {
    const companyStats = new Map();

    for (const [_, company, orderType, quantity] of this.activeIntervalTrades) {
      if (this.missBehavedCompanies.has(company)) continue;
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
        this.missBehavedCompanies.add(company);
      }
    }
  }

  #isWithinSameInterval(currentTime) {
    return (currentTime - this.intervalStartTime) / 1000 <= 60;
  }

  #shiftSameTimestampEntries(tradesInterval) {
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

  #setDifference(setA, setB) {
    // Set.difference not available in in node 18
    return new Set([...setA].filter((element) => !setB.has(element)));
  }
}
