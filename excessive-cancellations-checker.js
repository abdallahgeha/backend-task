import fs from "fs";
import readline from "readline/promises";
import { CSVUtils, IntervalUtils } from "./utils";

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
    const goodCompanies = IntervalUtils.setDifference(
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
        const parsedData = CSVUtils.parseCSV(line);
        if (!parsedData) continue;

        const [timestamp, company] = parsedData;

        this.allCompanies.add(company);
        const currentTime = new Date(timestamp);

        if (!this.intervalStartTime) {
          this.intervalStartTime = currentTime;
        }

        if (
          IntervalUtils.isWithinSameInterval(
            this.intervalStartTime,
            currentTime
          ) ||
          timestamp === this.activeIntervalTrades.at(-1)?.[0]
        ) {
          this.activeIntervalTrades.push(parsedData);
        } else {
          IntervalUtils.processActiveInterval(
            this.activeIntervalTrades,
            this.missBehavedCompanies
          );
          this.activeIntervalTrades = IntervalUtils.shiftSameTimestampEntries(
            this.activeIntervalTrades
          );
          this.activeIntervalTrades.push(parsedData);
        }
      }

      if (this.activeIntervalTrades.length > 0) {
        IntervalUtils.processActiveInterval(
          this.activeIntervalTrades,
          this.missBehavedCompanies
        );
      }
    } catch (error) {
      throw error;
    } finally {
      readInterface.close();
    }
  }
}
