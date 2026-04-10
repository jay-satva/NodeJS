import dotenv from "dotenv";
dotenv.config();
import express from "express";
import swaggerUi from "swagger-ui-express";
import openApiDocument from "./src/docs/openapi.json";
import authRoutes from "./src/routes/auth.route";
import organizationRoutes from "./src/routes/organization.route";
import projectRoutes from "./src/routes/project.route";
import taskRoutes from "./src/routes/task.route";
import tagRoutes from "./src/routes/tag.route";
import commentRoutes from "./src/routes/comment.route";
import { errorHandler } from "./src/middleware/errorHandler";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(["/api-docs.json", "/api/openapi.json"], (_req, res) => {
  res.status(200).json(openApiDocument);
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    explorer: true,
  })
);

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/organizations", organizationRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/organizations/:orgId/tags", tagRoutes);
app.use("/api/organizations/:orgId/tags", tagRoutes);
app.use("/organizations/:orgId/projects", projectRoutes);
app.use("/api/organizations/:orgId/projects", projectRoutes);
app.use("/organizations/:orgId/projects/:projectId/tasks", taskRoutes);
app.use("/api/organizations/:orgId/projects/:projectId/tasks", taskRoutes);
app.use(
  "/organizations/:orgId/projects/:projectId/tasks/:taskId/comments",
  commentRoutes
);
app.use(
  "/api/organizations/:orgId/projects/:projectId/tasks/:taskId/comments",
  commentRoutes
);
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
