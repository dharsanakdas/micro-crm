const express = require("express");
const cors = require("cors");
const config = require("./config.json");
const connectDB = require("./db");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


connectDB();
const authRouter = require("./routes/auth");
const contactsRouter = require("./routes/contacts");
const userRouter = require("./routes/user");

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/contacts", contactsRouter);
app.use("/api/v1/user", userRouter);

const port = process.env.PORT || config.port;
app.listen(port, () => {
  console.log(`Backend running at port ${port}`);
});
