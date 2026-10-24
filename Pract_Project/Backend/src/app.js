
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");
const { addUser } = require("./Utils/AddOwner");

const { AuthRouter } = require("./Routes/auth.routes");
const { OwnerRouter } = require("./Routes/owner.routes");
const { adminRouter } = require("./Routes/admin.routes");
const { employeeRouter } = require("./Routes/employee.route");
const { Analytics } = require("./Routes/getAnalytics.route..js");
const { chatRouter } = require("./Routes/Chat.Route.js");
const { User } = require("./Model/User.Schema");

const app = express();
const server = http.createServer(app);

// 1. Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://teamflow-frontend-p2qn.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

// 2. Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// 3. Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

// 4. Check login token for chat
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";

    const cookies = cookieParser.JSONCookies(
      require("cookie").parse(cookieHeader)
    );

    const token = cookies.token;

    if (!token) {
      return next(new Error("Please login first"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return next(new Error("Invalid user"));
    }

    socket.userId = user._id.toString();

    next();

  } catch (error) {
    next(new Error("Authentication failed"));
  }
});

// 5. Real-time chat connection
io.on("connection", (socket) => {

  console.log("User connected:", socket.userId);

  socket.join(socket.userId);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
  });

});

// 6. API routes
app.use("/api/auth", AuthRouter);
app.use("/api/owner", OwnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/analytics", Analytics);
app.use("/api/chat", chatRouter);

// 7. Error handling
app.use((err, req, res, next) => {
  console.log(err.message);

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// 8. Database and server
mongoose.connect(process.env.DB_URL)
  .then(async () => {
    console.log("Database connected");

    // Temporary owner creation
    await addUser({
      name: process.env.OWNER_NAME,
      email: process.env.OWNER_EMAIL,
      password: process.env.OWNER_PASSWORD,
    });

    server.listen(process.env.PORT || 8080, () => {
      console.log("Server running");
    });
  })
  .catch((error) => {
    console.log("Startup error:", error.message);
  });