const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    status: { type: String, required: true, trim: true },
    open_in_dashboard: { type: Boolean, default: false },
    last_open: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Order", orderSchema);
