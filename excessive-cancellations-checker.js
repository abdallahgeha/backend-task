import fs from "fs";
import readline from "readline/promises";

export class ExcessiveCancellationsChecker {
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
      const trade = this.#parseCSV(line);
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
}
