const express = require("express")
const app = express()
const PORT = 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["user_id"]
}))

const { getUserByEmail } = require('./helpers')
const bcrypt = require('bcrypt');

const urlDatabase = {
    "b2xVn2": {longURL: "http://www.lighthouselabs.ca", user_id: "defUser"},
    "sv9snd": {longURL: "http://www.google.com", user_id: "defUser"}
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

function urlsForID(id) {
  let idURLS = {}
  for (elem in urlDatabase) {
      if (urlDatabase[elem].user_id === id.session.user_id) {
        idURLS[elem] = urlDatabase[elem]
        
      }
      
    }
 return idURLS;
}

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/urls", (req, res) => {

  if (req.session.user_id) {
    // console.log(users[req.session.user_id])
    // console.log(users)
    let usersURLS = urlsForID(req);
    let templateVars = { urls: usersURLS, username: users[req.session.user_id] };
    res.render("urls_index", templateVars);
  } else {
    
    res.redirect("/pleaseLogin");
  }
});

app.get("/pleaseLogin", (req, res) => {
  let templateVars = { username: users[req.session.user_id] }
  res.render("pleaselogin", templateVars)
})

app.get("/existingEmail", (req, res) => {
  let templateVars = { username: users[req.session.user_id] }
  res.render("existingEmail", templateVars)
})
  
app.get("/urls/new", (req, res) => {
   
    let templateVars = { urls: urlDatabase, username: users[req.session.user_id] };
   
    if (templateVars.username){
    res.render("urls_new", templateVars);
    } else {
      res.redirect("/login")
    };
  });

  app.post("/urls", (req, res) => {
    let urlRString = randomStringGenerator(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
    urlDatabase[urlRString] = {longURL: req.body.longURL, user_id: req.session.user_id }
    
    res.redirect("/urls/" + urlRString)        
  });
  
  app.get("/urls/:shortURL", (req, res) => {
   if((urlDatabase[req.params.shortURL]) && (users[req.session.user_id].id === urlDatabase[req.params.shortURL].user_id)) {
     
      
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, username: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  
  } else {
      let templateVars = { username: users[req.session.user_id] }
      res.render("invalidShortURL", templateVars)
    }
    
    
  });
  
  app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL].longURL
   res.redirect(longURL);
  });
  
  app.post("/urls/:shortURL", (req, res) => {
    if (urlDatabase[req.params.shortURL].user_id === req.session.user_id){
    urlDatabase[req.params.shortURL].longURL = req.body.newURL
    }
    res.redirect("/urls")

     
  
    
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    if (urlDatabase[req.params.shortURL].user_id === req.session.user_id){
    delete urlDatabase[req.params.shortURL]}
    res.redirect("/urls")
  });
  
  app.post("/login", (req, res) => {
   if (getUserByEmail(req.body.email, users) === true){
    
    for (elem in users) {
      if ((users[elem].email === req.body.email) && (bcrypt.compareSync(req.body.password, users[elem].password))){
        
        req.session.user_id = elem;
        //let templateVars = { username: users[req.session.user_id] }
        
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
    res.clearCookie("session")
    res.redirect("/urls");
    
  });

app.get("/registration", (req, res) => {
  
  let templateVars = { username: users[req.session.user_id] }
  res.render("urls_registration", templateVars);
  });

  app.post("/registration", (req, res) => {
    
    // const password = "purple-monkey-dinosaur"; // found in the req.params object
    // const hashedPassword = bcrypt.hashSync(password, 10);

    if (getUserByEmail(req.body.email, users) === true) {
      console.log("error 403: user with that email already exists!");
      let templateVars = { username: users[req.session.user_id] }
      res.render("existingEmail", templateVars)
      return;
    }
    const user_id = randomStringGenerator(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    users[user_id] = {
      id: user_id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    
    req.session.user_id = user_id;
   
    
    //res.cookie("user_id", newuser_id);
    res.redirect("/urls");

    
  });

  app.get("/login", (req, res) => {
    let templateVars = { urls: urlDatabase, username: users[req.session.user_id] };
   
    res.render("urls_login", templateVars);
  })

  

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});