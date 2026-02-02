import app from "./app";
import config from "./config/config";
import { prisma } from "./lib/prisma";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(config.port, () => {
      console.log(
        `Server is running in ${config.nodeEnv} mode on port ${config.port}`,
      );
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
