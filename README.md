# Excessive-Trade-Cancelling

## Explanation
`data/trades.csv` is a large CSV file that contains a list of trade messages, one per line in the following format:

`Time of trade message, CompanyName, Order Type - New order (D) or Cancel (F), Quantity`

The lines are time ordered although **two or more lines may have the same time**.
Company names will not contain any commas. Ignore any lines which are not properly formatted and **continue to process** the rest of the file.

### Here are some example lines: 

| Time | Company name | Order Type | Quantity |
| ----------- | ----------- | ----------- | ----------- |
| 2015-02-28 07:58:14 | Bank of Mars | D | 140 |
| 2015-02-28 08:00:13 | Bank of Mars | D | 500 |
| 2015-02-28 08:00:14 | Bank of Mars | D | 200 |
| 2015-02-28 08:01:13 | Bank of Mars | F | 200 |
| 2015-02-28 08:04:29 | Joe traders | D | 110 |
| 2015-02-28 08:05:22 | Joe traders | F | 11 |
| 2015-02-28 08:05:25 | Joe traders | D | 70 |

If, in any given **60 second** period and for a given company, the ratio of the cumulative quantity of cancels to cumulative quantity of orders is greater than **1/3** then the company is engaged in excessive cancelling.

### Consider the above lines:
- During the period 08:00:14 to 08:01:13 `Bank of Mars` made 400 new orders and cancels,
of which 200 were cancels. This is 50% and is excessive cancelling.
- First line `2015-02-28 07:58:14,Bank of Mars,D,140` is just one event in any 60 seconds interval, because nothing more happend at +-60 seconds.
That means that at this interval `Bank of Mars` is not engaged in excessive cancelling.
- `Joe traders` did not engage in excessive cancelling.

## Your Task

In the [excessive-cancellations-checker.js](excessive-cancellations-checker.js) you will find a `ExcessiveCancellationsChecker` class that must have 2 methods to be implemented:
- **companiesInvolvedInExcessiveCancellations**: should return array of companies, that are engaged in excessive cancelling
- **totalNumberOfWellBehavedCompanies**: should return a number of companies that are not engaged in excessive cancelling
  
The `ExcessiveCancellationsChecker` class accepts filepath to csv (example file is [data/trades.csv](data/trades.csv)), which you need to parse and calculate the result. You are free to add your own methods to the class, but above mentioned a **required** to be there.

## Tests
Run `npm install` to install all dependencies and then run `npm run test` to run the unit tests. These should all pass if your solution has been implemented correctly.

The unit tests in the [tests/excessive-cancellations-checker.spec.js](tests/excessive-cancellations-checker.spec.js) class should pass if the functions
in [excessive-cancellations-checker.js](excessive-cancellations-checker.js) are implemented correctly. You are welcome to add more tests.

## Requirements

The [data/trades.csv](data/trades.csv) file and the [tests/excessive-cancellations-checker.spec.js](tests/excessive-cancellations-checker.spec.js) file should not be modified. If you would like
to add your own unit tests you can add these in a separate file in the `tests` folder.

The [package.json](package.json) file should only be modified in order to add any third-party dependencies required for your solution. The `jest` and `babel` versions should not be changed.

Your solution must use/be compatible with Node.js version `18`.

##

Good luck!

## Solution

### Installation

To use this class, ensure you have `Node.js` v18 installed on your machine. You will also need the following dependencies.  

### Dependencies

- `fs`: Built-in Node.js module for file system operations.
- `readline/promises`: Built-in Node.js module for reading files line by line asynchronously.  
- No 3rd party library was installed.  

### High-Level Explanation of the File Processing Logic

The `ExcessiveCancellationsChecker` class processes a CSV file line by line to identify companies that are involved in excessive cancellations of orders. The processing is designed to handle large files efficiently by reading them incrementally, without loading the entire file into memory at once. Here's a high-level breakdown of how the file processing works:

#### 1. Initialization

When an instance of the `ExcessiveCancellationsChecker` class is created, it initializes several key properties:

- **filePath**: The path to the CSV file containing trade data.
- **allCompanies**: A Set that stores all companies encountered during the file processing.
- **missBehavedCompanies**: A Set that stores companies identified as having excessive cancellations.
- **activeIntervalTrades**: An array that temporarily holds trades occurring within a 60-second window.
- **intervalStartTime**: Tracks the start time of the current 60-second interval.

#### 2. Reading the File Line by Line

The method `#processFile()` is responsible for reading the CSV file line by line using Node.js's readline/promises module. This approach allows for memory-efficient processing, especially when dealing with large files.

For each line in the file:

- The line is parsed using `CSVUtils.parseCSV()`, which extracts relevant fields (timestamp, company, order type, and quantity).
- If the line is valid, the parsed data is used to analyze trades and cancellations.

#### 3. Tracking Time Intervals

The core logic revolves around grouping trades into 60-second intervals and analyzing them in batches. For each trade:

- **First Trade in an Interval**:
If this is the first trade being processed or if it starts a new interval, its timestamp becomes the `intervalStartTime`.
The trade is added to `activeIntervalTrades`.
- **Subsequent Trades**:
If a subsequent trade occurs within the same 60-second window as `intervalStartTime`, it is added to `activeIntervalTrades`.
If a trade occurs outside of this 60-second window (i.e., more than 60 seconds after intervalStartTime), the current interval is processed before moving on to the next one.

#### 4. Processing Active Intervals

When an interval ends (i.e., when a new trade falls outside of the current 60-second window), all trades in that interval are analyzed together:

- The method `IntervalUtils.processActiveInterval()` calculates how many orders and cancellations were made by each company during that interval.
- For each company, if more than one-third of their transactions are cancellations, they are flagged as "miss-behaved" and added to the missBehavedCompanies set.

After processing an interval:

- The trades that occurred at exactly the same timestamp as the last trade are retained for further analysis (to avoid missing trades that happen at boundary times).
- The next trade starts a new interval.

#### 5. Final Processing

After all lines in the file have been read, any remaining trades in `activeIntervalTrades` are processed one last time to ensure no unprocessed intervals remain.  

#### 6. Results

Once all lines have been processed:

- The method `companiesInvolvedInExcessiveCancellations()` returns a list of companies that exhibited excessive cancellations.
- The method `totalNumberOfWellBehavedCompanies()` calculates how many companies did not exhibit excessive cancellations by comparing all encountered companies (allCompanies) with those flagged as "miss-behaved" (`missBehavedCompanies`).  
