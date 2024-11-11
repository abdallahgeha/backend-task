import fs from "fs";
import readline from "readline/promises";

export class ExcessiveCancellationsChecker {
  isFirstLineRead = false;
  intervalStartTime;

  allCompanies = new Set();
  missBehavedCompanies = new Set();

  activeMinInterval = [];
  /* 
        We provide a path to a file when initiating the class
        you have to use it in your methods to solve the task
    */
  constructor(filePath) {
    this.filePath = filePath;
  }

  /**
   * Returns the list of companies that are involved in excessive cancelling.
   * Note this should always resolve an array or throw error.
   */
  async companiesInvolvedInExcessiveCancellations() {
    await this.#loadFile();
    return [...this.missBehavedCompanies];
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * Note this should always resolve a number or throw error.
   */
  async totalNumberOfWellBehavedCompanies() {
    await this.#loadFile();
    const goodCompanies = this.#setDifference(
      this.allCompanies,
      this.missBehavedCompanies
    );
    return [...goodCompanies].length;
  }

  async #loadFile() {
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
        const currTime = new Date(timestamp);

        if (!this.isFirstLineRead) {
          this.intervalStartTime = currTime;
          this.isFirstLineRead = true;
        }

        if (
          !this.#is60SecDifference(this.intervalStartTime, currTime) ||
          timestamp === this.activeMinInterval.at(-1)?.[0]
        ) {
          this.activeMinInterval.push(parsedData);
        } else {
          this.#identifyExcessiveCancelers();
          this.activeMinInterval = this.#shiftSameTimeEntries(
            this.activeMinInterval
          );
          this.activeMinInterval.push(parsedData);
        }
      }

      if (this.activeMinInterval.length > 0) {
        this.#identifyExcessiveCancelers();
      }
    } catch (error) {
      throw error;
    } finally {
      readInterface.close();
    }
  }

  #parseCSV(line) {
    const tradeInfo = line.split(",");
    if (tradeInfo.length !== 4) return null;

    const [timestamp, company, orderType, quantityStr] = tradeInfo;
    const quantity = parseInt(quantityStr, 10);

    if (isNaN(quantity)) return null;

    return [timestamp, company, orderType, quantity];
  }

  #identifyExcessiveCancelers() {
    const companyStats = new Map();

    for (const [_, company, orderType, quantity] of this.activeMinInterval) {
      if (!companyStats.has(company)) {
        companyStats.set(company, { orders: 0, cancels: 0 });
      }

      const stats = companyStats.get(company);
      if (orderType === "D") {
        stats.orders += quantity;
      } else if (orderType === "F") {
        stats.cancels += quantity;
      }
    }

    for (const [company, { orders, cancels }] of companyStats) {
      const cancelRatio = cancels / (orders + cancels);
      if (cancelRatio > 1 / 3) {
        this.missBehavedCompanies.add(company);
      }
    }
  }

  #is60SecDifference = (date1, date2) => {
    return (date2 - date1) / 1000 > 60;
  };

  #shiftSameTimeEntries(tradesInterval) {
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
    return new Set([...setA].filter((element) => !setB.has(element)));
  }
}
