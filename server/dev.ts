import "dotenv/config";
import { createServer } from "./index";

const PORT = process.env.PORT || 5000;

const app = createServer();

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

