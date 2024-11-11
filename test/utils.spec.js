import { CSVUtils, IntervalUtils } from "../utils";

describe("CSVUtils", () => {
  describe("parseCSV", () => {
    it("should correctly parse a valid CSV line", () => {
      const line = "2024-11-11T10:00:00Z,CompanyA,D,100";
      const result = CSVUtils.parseCSV(line);
      expect(result).toEqual(["2024-11-11T10:00:00Z", "CompanyA", "D", 100]);
    });

    it("should return null if the CSV line is missing fields", () => {
      const line = "2024-11-11T10:00:00Z,CompanyA,D"; // Missing quantity
      const result = CSVUtils.parseCSV(line);
      expect(result).toBeNull();
    });

    it("should return null if the quantity is not a number", () => {
      const line = "2024-11-11T10:00:00Z,CompanyA,D,abc";
      const result = CSVUtils.parseCSV(line);
      expect(result).toBeNull();
    });

    it("should return null if the CSV line is empty", () => {
      const line = "";
      const result = CSVUtils.parseCSV(line);
      expect(result).toBeNull();
    });
  });
});

describe("IntervalUtils", () => {
  describe("isWithinSameInterval", () => {
    it("should return true if timestamps are within 60 seconds", () => {
      const startTime = new Date("2024-11-11T10:00:00Z");
      const currentTime = new Date("2024-11-11T10:00:30Z"); // 30 seconds later
      expect(IntervalUtils.isWithinSameInterval(startTime, currentTime)).toBe(
        true
      );
    });

    it("should return false if timestamps are more than 60 seconds apart", () => {
      const startTime = new Date("2024-11-11T10:00:00Z");
      const currentTime = new Date("2024-11-11T10:01:01Z"); // 61 seconds later
      expect(IntervalUtils.isWithinSameInterval(startTime, currentTime)).toBe(
        false
      );
    });
  });

  describe("shiftSameTimestampEntries", () => {
    it("should remove entries with the same timestamp as the first entry", () => {
      const trades = [
        ["2024-11-11T10:00:00Z", "CompanyA", "D", 100],
        ["2024-11-11T10:00:00Z", "CompanyB", "F", 50],
        ["2024-11-11T10:01:00Z", "CompanyC", "D", 200],
      ];
      const result = IntervalUtils.shiftSameTimestampEntries(trades);
      expect(result).toEqual([["2024-11-11T10:01:00Z", "CompanyC", "D", 200]]);
    });

    it("should return an empty array if all entries have the same timestamp", () => {
      const trades = [
        ["2024-11-11T10:00:00Z", "CompanyA", "D", 100],
        ["2024-11-11T10:00:00Z", "CompanyB", "F", 50],
        ["2024-11-11T10:00:00Z", "CompanyC", "D", 200],
      ];
      const result = IntervalUtils.shiftSameTimestampEntries(trades);
      expect(result).toEqual([]);
    });
  });

  describe("processActiveInterval", () => {
    it("should add companies with excessive cancellations to missBehavedCompanies set (more than one-third cancellations)", () => {
      const activeTrades = [
        ["2024-11-11T10:00:00Z", "CompanyA", "D", 100], // Orders
        ["2024-11-11T10:01:00Z", "CompanyA", "F", 60], // Cancellations
        ["2024-11-11T10:02:00Z", "CompanyB", "D", 200], // Orders
        ["2024-11-11T10:03:00Z", "CompanyB", "F", 50], // Cancellations
      ];

      const missBehavedCompanies = new Set();

      IntervalUtils.processActiveInterval(activeTrades, missBehavedCompanies);

      expect(missBehavedCompanies.has("CompanyA")).toBe(true); // CompanyA has >33% cancellations
      expect(missBehavedCompanies.has("CompanyB")).toBe(false); // CompanyB has <=33% cancellations
    });

    it("should not add companies with no cancellations to missBehavedCompanies set (0% cancellations)", () => {
      const activeTrades = [
        ["2024-11-11T10:00:00Z", "CompanyA", "D", 100], // Orders only
        ["2024-11-11T10:01:00Z", "CompanyB", "D", 200], // Orders only
      ];

      const missBehavedCompanies = new Set();

      IntervalUtils.processActiveInterval(activeTrades, missBehavedCompanies);

      expect(missBehavedCompanies.size).toBe(0); // No company should be added
    });
  });
});
