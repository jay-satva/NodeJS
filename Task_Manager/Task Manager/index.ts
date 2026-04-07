import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRoutes from "../Task Manager/src/routes/auth.route";
import taskRoutes from "../Task Manager/src/routes/task.routes";
import { errorHandler } from "../Task Manager/src/middleware/errorHandler";
import tagRoutes from "../Task Manager/src/routes/tag.routes"
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tags", tagRoutes);

app.use((_req, res) => {
  res.status(404).json({
    responseStatus: 0,
    message: "Route not found.",
  });
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;