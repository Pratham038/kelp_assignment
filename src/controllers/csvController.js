const csvService = require("../services/csvServices");
require("dotenv").config();

const convertAndUploadCSV = async (req, res) => {
  const filePath = process.env.CSV_FILE_PATH;
  const data = csvService.parseCSV(filePath);
  await csvService.uploadToDatabase(data);
  await csvService.generateAgeReport();
  res.send("CSV data processed and uploaded successfully.");
};

module.exports = {
  convertAndUploadCSV,
};
