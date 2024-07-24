const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

class Post {
  constructor(filePath) {
    this.filePath = filePath;
  }

  readPostsFromFile(callback) {
    fs.readFile(this.filePath, "utf8", (err, data) => {
      if (err) {
        return callback(err);
      }
      const posts = JSON.parse(data);
      callback(null, posts);
    });
  }

  writePostsToFile(posts, callback) {
    fs.writeFile(this.filePath, JSON.stringify(posts, null, 2), "utf8", callback);
  }

  getAllPosts(callback) {
    this.readPostsFromFile(callback);
  }

  getPostById(id, callback) {
    this.readPostsFromFile((err, posts) => {
      if (err) {
        return callback(err);
      }
      const post = posts.find((post) => post.id === parseInt(id));
      callback(null, post);
    });
  }

  createPost(postData, callback) {
    this.readPostsFromFile((err, posts) => {
      if (err) {
        return callback(err);
      }

      const newId = posts.length > 0 ? Math.max(...posts.map(post => post.id)) + 1 : 1;
      const post = {
        id: newId,
        ...postData,
        comments: [],
      };

      posts.push(post);

      this.writePostsToFile(posts, (err) => {
        if (err) {
          return callback(err);
        }
        callback(null, post);
      });
    });
  }

  updatePostById(id, updatedPostData, callback) {
    this.readPostsFromFile((err, posts) => {
      if (err) {
        return callback(err);
      }
      const postIndex = posts.findIndex((post) => post.id === parseInt(id));
      if (postIndex === -1) {
        return callback(new Error("Post not found"));
      }
      posts[postIndex] = { ...posts[postIndex], ...updatedPostData };
      this.writePostsToFile(posts, callback);
    });
  }

  deletePostById(id, callback) {
    this.readPostsFromFile((err, posts) => {
      if (err) {
        return callback(err);
      }
      const postIndex = posts.findIndex((post) => post.id === parseInt(id));
      if (postIndex === -1) {
        return callback(new Error("Post not found"));
      }
      posts.splice(postIndex, 1);
      this.writePostsToFile(posts, callback);
    });
  }

  addCommentToPost(id, comment, callback) {
    this.readPostsFromFile((err, posts) => {
      if (err) {
        return callback(err);
      }
      const post = posts.find((post) => post.id === parseInt(id));
      if (!post) {
        return callback(new Error("Post not found"));
      }
      post.comments.push(comment);
      this.writePostsToFile(posts, (err) => {
        if (err) {
          return callback(err);
        }
        callback(null, comment);
      });
    });
  }
}

module.exports = Post;
