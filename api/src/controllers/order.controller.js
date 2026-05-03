const Order = require("../models/order.model");

async function createOrder(req, res, next) {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ message: "Orden creada", data: order });
  } catch (error) {
    next(error);
  }
}

async function getOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
}

async function updateOrder(req, res, next) {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json({ message: "Orden actualizada", data: order });
  } catch (error) {
    next(error);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json({ message: "Orden eliminada" });
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrder, deleteOrder };
