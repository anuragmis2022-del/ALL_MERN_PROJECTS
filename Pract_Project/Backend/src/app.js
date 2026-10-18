require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const { AuthRouter } = require("./Routes/auth.routes");
const { OwnerRouter } = require("./Routes/owner.routes");
const { adminRouter } = require("./Routes/admin.routes");
const { employeeRouter } = require("./Routes/employee.route");
const { Analytics } = require("./Routes/getAnalytics.route..js");
const { chatRouter } = require("./Routes/Chat.Route.js");

const cors = require("cors");
// const { addUser } = require("./Utils/AddOwner");
const cp = require("cookie-parser");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);


io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);

    console.log("USER JOINED:", userId);
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);
  });
});
app.use(cp());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // allowing browser to request cookies
  }),
);

app.use(express.json());
app.use("/api/auth", AuthRouter);
app.use("/api/owner", OwnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/analytics", Analytics);
app.use("/api/chat", chatRouter);
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    //  addUser("Anurag", "Annurag@gmail.com" , "Testing123!" ,"owner");
    console.log("Database connected");

    const PORT = process.env.PORT || 8080;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(`DB Connection failed : ${error.message}`);
  });

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || err.status || 500).json({
    message: err.message || "Internal server error",
  });
});
