const express = require("express")
const app = express()
const PORT = 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser')
app.use(cookieParser());

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "sv9snd": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function randomStringGenerator(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
let rstring = randomStringGenerator(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  let templateVars = { urls: urlDatabase, username: users[req.cookies.userID] };
  
  
  res.render("urls_index", templateVars);
  });

  app.get("/urls/new", (req, res) => {
   
    let templateVars = { urls: urlDatabase, username: req.cookies["userID"] };
    res.render("urls_new", templateVars);
  });

  app.post("/urls", (req, res) => {
    urlDatabase[rstring] = req.body.longURL
    res.redirect("/urls/" + rstring)        
  });
  
  app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["userID"] };
    res.render("urls_show", templateVars);
  });
  
  app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]
    res.redirect(longURL);
  });
  
  app.post("/urls/:shortURL", (req, res) => {
    urlDatabase[req.params.shortURL] = req.body.newURL
    res.redirect("/urls")

     
  
    
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls")
  });
  
  app.post("/login", (req, res) => {
   if (duplicationChecker(req.body) === true){
    
    for (elem in users) {
      if ((users[elem].email === req.body.email) && (users[elem].password === req.body.password)){
        res.cookie("userID", elem);
        res.redirect("/urls")
        return
      } 
     }
     console.log("error 403: password incorrect")
     res.redirect("/login")
     return
   }
   console.log("please register first " + req.body.email)
   res.redirect("/login");
      
    

  });

  app.post("/logout", (req, res) => {
    res.clearCookie("userID")
    res.redirect("/urls");
    
  });

app.get("/registration", (req, res) => {
  
  let templateVars = {username: req.cookies["userId"] };
  res.render("urls_registration", templateVars);
  });

  function duplicationChecker(data){
  for (elem in users){
    if (users[elem].email === data.email)
    return true
  }
  return false
  }
  
  app.post("/registration", (req, res) => {
    if (duplicationChecker(req.body) === true) {
      console.log("error 403: user with that email already exists!");
      return;
    }
    const newUserID = rstring;
    users[newUserID] = {
      id: newUserID,
      email: req.body.email,
      password: req.body.password,
    };
    res.cookie("userID", newUserID);
    res.redirect("/urls");

    console.log(users);
  });

  app.get("/login", (req, res) => {
    let templateVars = { urls: urlDatabase, username: req.cookies["userID"] };
    res.render("urls_login", templateVars);
  })

  

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});