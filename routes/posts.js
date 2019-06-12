var express = require('express');
var router = express.Router();
const mongo = require ('mongodb');
var db = require ('monk')('localhost:27017/nodeblog');

const multer = require ('multer');
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, '../nodeblog/public/images/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});


const uploads = multer({storage: storage}).fields([{name:'mainimage', maxCount: 1 }]);


router.get('/show/:id', function(req, res){
  let posts = db.get('posts');
  posts.findOne(req.params.id, function(err, post){
    res.render('show', {
      'post': post
    });

  })
})


router.get('/add', function(req, res, next) {
  let categories = db.get('categories');
  categories.find({}, {}, function(err, categories){
    res.render('addposts', {
      "title": 'Add Post',
      'categories': categories
    });

  })
 
});


router.post('/addcomment', uploads,  (req, res, next)=>{

  //get values of the felds
  const name = req.body.name;
  const email = req.body.email;
  const body = req.body.body;
  const postid = req.body.postid;
  const commentDate = new Date();
  
  //validate the field
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('email', 'email field is not well formatted').isEmail();
  req.checkBody('body', 'body field is required').notEmpty();

  //check errors
  let errors = req.validationErrors();
  if(errors){
    let posts = db.get('posts');
    posts.findOne(postid, function(err, post){
      res.render('show', {
        "errors": errors,
        "post": post
      })
    })
    
  }else{
    let comment = {"name": name, 'email':email, "body": body, "commentDate": commentDate}
    let posts = db.get('posts');
    //submit to
    posts.update({"_id": postid},
    { $push:{"comments": comment}},
     function(err, doc){
      if(err){
        throw err;
      }else{
        req.flash('success', 'Comment addedd');
        res.location('/posts/show' + postid);
        res.redirect('/posts/show/' + postid);

      }

    })
  }
  
});


router.post('/add', uploads,  (req, res, next)=>{

  //get values of the felds
  const title = req.body.title;
  const category = req.body.category;
  const body = req.body.body;
  const author = req.body.author;
  const date = new Date();
  
  let mainimage;
    
  if(mainimage){
    mainimage = req.files['mainimage'][0].filename;
  } else {
       mainimage = 'noimage.png';
  }

  //validate the field
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('body', 'body field is required').notEmpty();

  //check errors
  let errors = req.validationErrors();

  if(errors){
    res.render('addposts', {
      "errors": errors,
      "title": title,
      "body": body

    })
  }else{

    let posts = db.get('posts');

    //submit to
    posts.insert({
        "title": title,
        "body": body,
        "category": category,
        "date": date,
        "author": author,
       'mainimage': mainimage
    }, function(err, post){
      if(err){
        res.send('There was an issue something the form');
      } else{
        req.flash('success', 'Post submitted successfully');

        res.location('/');
        res.redirect('/');
      }
    });
  }
  
});

module.exports = router;
