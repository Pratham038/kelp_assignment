const express = require("express");
const csvRoutes = require("./src/routes/csvRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use("/api", csvRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
