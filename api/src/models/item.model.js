const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    categoria: {
      type: String,
      required: true,
      trim: true
    },
    estado: {
      type: String,
      required: true,
      trim: true
    },
    fecha: {
      type: String,
      required: true,
      trim: true
    },
    hora: {
      type: String,
      required: true,
      trim: true
    },
    precio: {
      type: Number,
      required: true,
      min: 0
    },
    need_stand: {
      type: Boolean,
      default: false
    },
    cans_amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    cans_cost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    telefono: {
      type: String,
      default: "",
      trim: true
    },
    correo: {
      type: String,
      default: "",
      trim: true,
      lowercase: true
    },
    obs: {
      type: String,
      default: "",
      trim: true
    },
    latitud: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitud: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Item", itemSchema);
