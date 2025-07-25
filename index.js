const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { Blog } = require("./models/blog");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const app = express();
const PORT = 8000;

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blog_post_manager")
  .then((e) => console.log("mongodb connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`server started at port : ${PORT}`);
});
