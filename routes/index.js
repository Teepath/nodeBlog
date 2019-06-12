var express = require('express');
var router = express.Router();
const mongo = require ('mongodb');
var db = require ('monk')('localhost:27017/nodeblog');

//home page blog. 
router.get('/', function(req, res, next) {
  var posts = db.get('posts');
  posts.find({},{}, (err, posts)=>{
    console.log(posts);
    res.render('index',{
      'posts': posts
    })
  })
 
});

module.exports = router;
