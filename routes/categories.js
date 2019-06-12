var express = require('express');
var router = express.Router();
const mongo = require ('mongodb');
var db = require ('monk')('localhost:27017/nodeblog');

//home page blog. 


router.get('/show/:category', function(req, res){
    let posts = db.get('posts');
      posts.find({category: req.params.category}, {}, function(err, posts){
        res.render('index', {
          "title": req.params.category,
          'posts': posts
        });
    
      })
  })
  
router.get('/add', function(req, res, next) {

    res.render('addCategories', {
        title: 'Add Categories'
    });
});



router.post('/add',  (req, res, next)=>{

    //get values of the felds
    const title = req.body.title;    
    //validate the field
    req.checkBody('title', 'Title field is required').notEmpty();
   
  
    //check errors
    let errors = req.validationErrors();
  
    if(errors){
      res.render('addposts', {
        "errors": errors,
        "title": title
      })
    }else{
  
      const categories = db.get('categories');
  
      //submit to
      categories.insert({
          "title": title
      }, function(err, category){
        if(err){
          res.send('There was an issue something the category');
        } else{
          req.flash('success', 'category submitted ');
  
          res.location('/');
          res.redirect('/');
        }
      });
    }
    
  });

module.exports = router;
