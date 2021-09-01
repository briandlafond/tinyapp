const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express(); //app = server
const PORT = 8000; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {};
const users = {};

// ***** ROUTES *****

app.get("/", (req, res) => {      // "/" = routes to home page or root
  res.send("Hello!");             // response from server
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/register", (req, res) => {
  let userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    userID: userID,
    urls: urlDatabase
  };
  res.render("urls_registration", templateVars);
});


app.get("/login", (req, res) => {
  let userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    userID: userID,
    urls: urlDatabase
  };
  res.render("urls_login", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users,
    urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});


app.get("/urls", (req, res) => {
  let userID = req.cookies["user_id"];
  const templateVars = {
    user: users[userID],
    userID: userID,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params.longURL,
    user: users
  };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  let longURL = req.body.longURL;
  if (!longURL.includes('http')) {
    longURL = `http://${longURL}`;
  }
  urlDatabase[shortURL] = longURL; //adds key: value to urlDatabase object
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let newURL = `http://${req.body.newURL}`; //req.body is the input from field
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});


app.post("/register", (req, res) => {
  let newUserID = generateRandomString(10);
  let submittedEmail = req.body.email;
  let submittedPassword =  req.body.password;
  if (!submittedEmail || !submittedPassword) {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(submittedEmail, users)) {
    res.status(400).send("An account already exists for this email address");
  } else {
    users[newUserID] = {   // *************** adds new user to users object
      id: newUserID,
      email: submittedEmail,
      password: submittedPassword
    };
  }
  res.cookie('user_id', newUserID);
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  let submittedEmail = req.body.email;
  let submittedPassword =  req.body.password;

  if (!submittedEmail || !submittedPassword) {
    return res.status(403).send("Please enter both email and password.");
  }
  const user = emailHasUser(submittedEmail, users);
  if (!user) {
    return res.status(403).send("Invalid email, please register for TinyApp.");
  }

  if (user.password !== submittedPassword) {
    return res.status(403).send("Invalid password, please try again.");
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls");

});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});




// // ***** HELPER FUNCTIONS *****

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateRandomString = function(length) {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const emailHasUser = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};