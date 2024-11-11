import { CSVUtils } from "../utils";

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
