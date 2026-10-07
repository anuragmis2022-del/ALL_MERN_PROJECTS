require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { AuthRouter } = require("./Routes/auth.routes");
const { OwnerRouter } = require("./Routes/owner.routes");
const { adminRouter } = require("./Routes/admin.routes");
const { employeeRouter } = require("./Routes/employee.route");
const { Analytics }=require("./Routes/getAnalytics.route..js")
const cors=require("cors")
// const { addUser } = require("./Utils/AddOwner");
const cp = require("cookie-parser");
const app = express();
app.use(cp());


app.use(cors({
  origin:["deployedUrl", "http://localhost:5173"], 
  credentials:true // allowing browser to request cookies
}))

app.use(express.json());
app.use("/api/auth", AuthRouter);
app.use("/api/owner", OwnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/analytics", Analytics)
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    // addUser("Mickey", "Mickey@gmail.com" , "Testing123!" ,"owner");
    console.log("Database connected");

    const port = process.env.PORT || 8080;

    app.listen(port, () => {
      console.log(`Server Running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(`DB Connection failed : ${error.message}`);
  });

app.use((err, req, res, next) => {
  res.status(err.status || 400).json({
    message: err.message,
  });
});
