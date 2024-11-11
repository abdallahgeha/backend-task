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
    this.#loadFile();
  }

  /**
   * Returns the list of companies that are involved in excessive cancelling.
   * Note this should always resolve an array or throw error.
   */
  async companiesInvolvedInExcessiveCancellations() {
    //TODO Implement...
  }

  /**
   * Returns the total number of companies that are not involved in any excessive cancelling.
   * Note this should always resolve a number or throw error.
   */
  async totalNumberOfWellBehavedCompanies() {
    //TODO Implement...
  }

  #loadFile() {
    const readInterface = readline.createInterface({
      input: fs.createReadStream(this.filePath),
      crlfDelay: Infinity,
    });

    readInterface.on("line", (line) => {
      const parsedData = this.#parseCSV(line);
      if (!parsedData) return;

      const [timestamp, company] = parsedData;

      this.allCompanies.add(company);
      const currTime = new Date(timestamp);

      if (!this.isFirstLineRead) {
        this.intervalStartTime = currTime;
        this.isFirstLineRead = true;
      }
    });

    readInterface.on("close", () => {});
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
}
