import dotenv from "dotenv";
import { app } from "./app";
import connectDB from "./db";
dotenv.config();

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 4000;

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });

    // Error handling for server-level errors
    server.on("error", (error: any) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });
  })
  .catch((error: any) => {
      console.error('❌ Database connection failed:', error.message);
  });