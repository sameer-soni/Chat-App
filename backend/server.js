const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRouter = require("./Routes/auth");
const cookieParser = require("cookie-parser");
const authVerify = require("./Middelware/authMiddelware");
const messageRouter = require("./Routes/message");
const cors = require("cors");
const chatRouter = require("./Routes/chat");

// parse json and url-data (are Middelwares)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "http://192.168.144.107:5173",
    credentials: true,
  })
);
app.use(cookieParser());

//connect to mongoDB
const DB =
  "mongodb+srv://tenyson2005:tdpBgpewRTuj0OEA@cluster0.adpsjwb.mongodb.net/?retryWrites=true&w=majority";
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
    //server start
    app.listen(8000, "192.168.144.107", () => {
      console.log("server has started at port: 8000");
    });
  })
  .catch((e) => {
    console.log("erroR: ", e);
  });

//Routes
app.use("/auth", authRouter);
app.use("/api", messageRouter);
app.use("/chat", chatRouter);

// app.get('/testDisplay', authVerify)

//just a test: this below one only!
app.post("/user", authVerify, (req, res) => {
  console.log("huehue token : ");
  console.log(req.cookies.token);
  console.log(req.user);
  const user = req.user;
  res.json({ user });
});
