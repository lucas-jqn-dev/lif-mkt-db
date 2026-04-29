const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
} = require("../controllers/item.controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
