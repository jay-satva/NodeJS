import { Router } from "express";
import clientRouter from "./client.routes";
import employeeRouter from "./employee.routes";
import leaveRouter from "./leave.routes";
import projectRouter from "./project.routes";
import salaryAccountRouter from "./salaryAccount.routes";

const apiRouter = Router();

apiRouter.use("/employees", employeeRouter);
apiRouter.use("/salary-accounts", salaryAccountRouter);
apiRouter.use("/leaves", leaveRouter);
apiRouter.use("/clients", clientRouter);
apiRouter.use("/projects", projectRouter);

export default apiRouter;
