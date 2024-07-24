const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const Post = require("./post");

const router = express.Router();
const post = new Post("./storage/Storage.json");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destinations = {
      profilepic: "images/profilepic/",
      background: "images/background/",
    };
    cb(null, destinations[file.fieldname] || "images");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

const constructUrl = (req, path) =>
  `${req.protocol}://${req.get("host")}${path}`;

const handleError = (res, err, statusCode = 500) => {
  console.error(err);
  res.status(statusCode).send(err.message || "Internal Server Error");
};

const validatePostData = (data, files) => {
  const { title, description, content, author } = data;
  const profilepic = files?.profilepic?.[0]?.filename;
  const background = files?.background?.[0]?.filename;
  console.log("Validation Check: ", {
    title,
    description,
    content,
    author,
    profilepic,
    background,
  });
  return title && description && content && author && profilepic && background;
};

router.get("/", (req, res) => {
  post.getAllPosts((err, posts) => {
    if (err) return handleError(res, err);
    res.json(
      posts.map((post) => ({
        ...post,
        profilepic: constructUrl(req, post.profilepic),
        background: constructUrl(req, post.background),
      }))
    );
  });
});

router.get("/:id", (req, res) => {
  post.getPostById(req.params.id, (err, post) => {
    if (err || !post) return handleError(res, new Error("Post not found"), 404);
    res.json({
      ...post,
      profilepic: constructUrl(req, post.profilepic),
      background: constructUrl(req, post.background),
    });
  });
});

router.post(
  "/",
  upload.fields([
    { name: "profilepic", maxCount: 1 },
    { name: "background", maxCount: 1 },
  ]),
  (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);

    if (!validatePostData(req.body, req.files)) {
      return handleError(res, new Error("All fields are required"), 400);
    }

    const postData = {
      ...req.body,
      profilepic: `/images/profilepic/${req.files.profilepic[0].filename}`,
      background: `/images/background/${req.files.background[0].filename}`,
    };

    post.createPost(postData, (err, createdPost) => {
      if (err) return handleError(res, err);
      res.status(201).json(createdPost);
    });
  }
);

router.put("/:id", (req, res) => {
  post.updatePostById(req.params.id, req.body, (err) => {
    if (err) return handleError(res, err, 403);
    res.sendStatus(204);
  });
});

router.delete("/:id", (req, res) => {
  post.deletePostById(req.params.id, (err) => {
    if (err) return handleError(res, err, 403);
    res.sendStatus(204);
  });
});

router.post("/:id/comments", (req, res) => {
  const { user, text } = req.body;

  if (!user || !text) {
    return handleError(res, new Error("User and text are required"), 400);
  }

  const comment = {
    user,
    text,
    timestamp: new Date().toISOString().slice(0, 10),
  };

  post.addCommentToPost(req.params.id, comment, (err, addedComment) => {
    if (err) return handleError(res, err);
    res.status(200).json(addedComment);
  });
});

module.exports = { router };
