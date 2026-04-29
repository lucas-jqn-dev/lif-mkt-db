const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/users", authMiddleware, getUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);

module.exports = router;
