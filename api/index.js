const app = require("./src/app");
const { PORT } = require("./src/config");

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
  console.log(`📍 POST /resolver - Resolver asignaciónes de guardias medicas`);
  console.log(`📍 GET /health - Health check`);
});
