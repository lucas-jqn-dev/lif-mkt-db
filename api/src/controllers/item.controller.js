const Item = require("../models/item.model");

async function createItem(req, res, next) {
  try {
    const item = await Item.create({
      ...req.body,
      createdBy: req.user._id
    });

    return res.status(201).json({
      message: "Item creado correctamente",
      item
    });
  } catch (error) {
    return next(error);
  }
}

async function getItems(req, res, next) {
  try {
    const filters = {};

    if (req.query.categoria) {
      filters.categoria = req.query.categoria;
    }

    if (req.query.estado) {
      filters.estado = req.query.estado;
    }

    const items = await Item.find(filters)
      .populate("createdBy", "username")
      .sort({ fecha: 1, hora: 1, createdAt: -1 });

    return res.json(items);
  } catch (error) {
    return next(error);
  }
}

async function getItemById(req, res, next) {
  try {
    const item = await Item.findById(req.params.id).populate("createdBy", "username");

    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    return res.json(item);
  } catch (error) {
    return next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("createdBy", "username");

    if (!item) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    return res.json({
      message: "Item actualizado correctamente",
      item
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    return res.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
};
