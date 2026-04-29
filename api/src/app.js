const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "lif-mkt-dashboard-api"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
