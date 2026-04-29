require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 4000;



async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No fue posible iniciar la API:", error.message);
    process.exit(1);
  }
}

startServer();
