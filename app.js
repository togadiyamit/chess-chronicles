//jshint esversion:6
//jshint esversion:6
// require('dotenv').config();
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const ejs = require("ejs")
const encrypt = require("mongoose-encryption")
// const md5 = require("md5")
const bcrypt = require("bcrypt")
const saltRounds = 1;
const _ = require("lodash")
const session = require('express-session');


let globalUsername;



// const { max } = require("lodash");

mongoose.set('strictQuery',false)
mongoose.connect("mongodb+srv://meet:o4VT7M2kaSISQ1Hh@cluster0.lplz9.mongodb.net/test")


const userSchema = new mongoose.Schema({
  username:String,
  email:String,
  password:String
})

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password']});

const User = new mongoose.model("User",userSchema)


const postSchema = {
  username:String,
  title:String,
  content:String
}

const Post = new mongoose.model("Post",postSchema)


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/",function(req,res){
  res.render("default")
})

app.get("/login",function(req,res){
  res.render("login")
})
app.get("/register",function(req,res){
  res.render("register")
})

app.post("/register",function(req,res){
bcrypt.hash(req.body.password,saltRounds,function(err,hash){

  const newUser = new User({
      username:req.body.username,
      email:req.body.email,
      password:hash
      // password:md5(req.body.password)
    })
   

  newUser.save(function(err){
      if(err){
          console.log(err);
      }
      else{
        globalUsername = req.body.username;
        res.redirect("/home")
        res.render("partials/header",{
          username:globalUsername
        })
      }
  });

})

})
// console.log(username);

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            globalUsername = foundUser.username;
            if (foundUser.email === "chess44@gmail.com") {
              res.redirect("/admin");
            } else {
              res.redirect("/home");
            }
          }
        });
      }
    }
  });
});






app.get('/home', function(req, res) {
  Post.find({}, function(err, posts) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal server error');
      return;
    }

    // Assuming you have defined the globalUsername variable somewhere in your code
    // const globalUsername = 'Vishwarajsinh Jadeja';

    // Render the home view and pass the necessary data to it
    try {
      res.render('home', {
        startingContent: homeStartingContent,
        username: globalUsername,
        posts: posts
      }, function(err, html) {
        if (err) {
          console.log(err);
        }

        // Render the header partial and pass the username variable to it
        res.render('partials/header', {
          username: globalUsername
        }, function(err, headerHtml) {
          if (err) {
            console.log(err);
          }

          // Replace the <header> tag in the home view with the header partial HTML
          html = html.replace('<header></header>', headerHtml);

          // Send the final HTML response to the client
          res.send(html);
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  });
});

app.get("/about",function(req,res){
  res.render("about",{
    username: globalUsername,
    aboutContent:aboutContent
  })
})

app.get("/contact",function(req,res){
  res.render("contact",{
    username: globalUsername,
    contactContent:contactContent
  })
})

app.get("/compose", function(req, res) {
  if (globalUsername) {
    res.render("compose", {
      username: globalUsername
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/posts/:postId", function(req, res) {
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal server error');
      return;
    }

    res.render("post", {
      username: globalUsername, // replace globalUsername with the username variable you want to use
      title: post.title,
      content: post.content
    });
  });
});

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.username = globalUsername || null;
  next();
});


app.get("/admin",function(req,res){
  Post.find({}, function(err, posts) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal server error');
      return;
    }

    // Assuming you have defined the globalUsername variable somewhere in your code
    // const globalUsername = 'Vishwarajsinh Jadeja';

    // Render the home view and pass the necessary data to it
    try {
      res.render('admin', {
        startingContent: homeStartingContent,
        username: globalUsername,
        posts: posts
      }, function(err, html) {
        if (err) {
          console.log(err);
        }

        // Render the header partial and pass the username variable to it
        res.render('partials/header', {
          username: globalUsername
        }, function(err, headerHtml) {
          if (err) {
            console.log(err);
          }

          // Replace the <header> tag in the home view with the header partial HTML
          html = html.replace('<header></header>', headerHtml);

          // Send the final HTML response to the client
          res.send(html);
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal server error');
    }
  });
});


app.post("/compose",function(req,res){
  // console.log(req.body.postTitle);
  // console.log(req.body.postBody);
const post = new Post ({
  username:globalUsername,
  title : req.body.postTitle,
  content :req.body.postBody
  
})

post.save(function(err){
  if(!err){
    res.render("/admin")
  }
});
// console.log(post);
// posts.push(post)
res.redirect("/admin")
// console.log(post.title);
})


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;

  Post.findByIdAndDelete(checkedItemId,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Sucessfully deleted checked item");
      res.redirect("/admin");
    }
  })
})







app.listen(3000, function() {
  console.log("Server started on port 3000");
});