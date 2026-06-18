import "dotenv/config";
import express from "express";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    responseStatus: 1,
    message: "Server is healthy.",
  });
});

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({
    responseStatus: 0,
    message: "Route not found.",
  });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
