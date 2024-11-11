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
});
