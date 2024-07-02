const fs = require("fs");
const path = require("path");
const pool = require("../models/db");

const parseCSV = (filePath) => {
  const absoluteFilePath = path.resolve(filePath);
  const content = fs.readFileSync(absoluteFilePath, "utf-8");
  const [headerLine, ...lines] = content
    .split("\n")
    .filter((line) => line.trim());
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    const obj = headers.reduce((acc, header, index) => {
      const keys = header.trim().split(".");
      let current = acc;
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          current[key] = values[index].trim();
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      });
      return acc;
    }, {});

    console.log("Parsed Object:", obj); // Debugging line to print parsed object
    return obj;
  });
};

const uploadToDatabase = async (data) => {
  const client = await pool.connect();
  try {
    for (const item of data) {
      console.log("Item to be inserted:", item); // Debugging line to print each item before insertion
      const { name, age, ...rest } = item;
      const firstName = name.firstName;
      const lastName = name.lastName;
      const address = rest.address || null;
      const additionalInfo = { ...rest };
      delete additionalInfo.address;

      await client.query(
        `INSERT INTO public.users (name, age, address, additional_info) 
         VALUES ($1, $2, $3, $4)`,
        [`${firstName} ${lastName}`, age, address, additionalInfo]
      );
    }
  } finally {
    client.release();
  }
};

const generateAgeReport = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT age FROM public.users");
    const ageGroups = result.rows.reduce(
      (acc, { age }) => {
        if (age < 20) acc["< 20"] += 1;
        else if (age <= 40) acc["20 to 40"] += 1;
        else if (age <= 60) acc["40 to 60"] += 1;
        else acc["> 60"] += 1;
        return acc;
      },
      { "< 20": 0, "20 to 40": 0, "40 to 60": 0, "> 60": 0 }
    );

    const total = result.rows.length;
    console.log("Age-Group % Distribution");
    for (const group in ageGroups) {
      console.log(
        `${group}: ${((ageGroups[group] / total) * 100).toFixed(2)}%`
      );
    }
  } finally {
    client.release();
  }
};

module.exports = {
  parseCSV,
  uploadToDatabase,
  generateAgeReport,
};
