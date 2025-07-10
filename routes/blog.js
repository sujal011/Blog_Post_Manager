const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const router = Router();
const Comment = require("../models/comment");
const { Blog } = require("../models/blog");
const generateBlog  = require("../services/gemini");
const { checkForAuthenticationCookie } = require("../middlewares/authentication");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

router.get("/add_new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });

  return res.redirect(`/blog/${blog._id}`);
});

router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await Blog.findByIdAndDelete(req.params.id);

    await Comment.deleteMany({ blogId: req.params.id });
    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.post("/generate",async(req,res) => {
  const {title} = req.body;
  try{
  if (!title || title.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Title is required to generate a blog post",
      });
    }
    
    const result = await generateBlog(title);
    return res.status(200).json( {
      status: "success",
      data: result,
    });

  }
  catch(error){
    return res.status(500).json({
      status: "error",
      message: "Failed to generate blog post",
      error: error.message,
    });
  }
});

module.exports = router;
