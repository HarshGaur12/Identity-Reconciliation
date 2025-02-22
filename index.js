const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const identifyRoute = require("./routes/identify");



dotenv.config();
const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use("/api", identifyRoute);


// Root endpoint
app.get("/", (req, res) => {
    res.send("Emotorad Backend Task - Identity Reconciliation");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
