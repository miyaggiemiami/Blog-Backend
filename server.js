const express = require("express");
const cors = require("cors");
const http = require("http");
const enforce = require("express-sslify");
const { router: postsRoutes } = require("./routes");

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json());
app.use(cors());
app.use("/images", express.static("images"));
app.use("/posts", postsRoutes);

// Only enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
