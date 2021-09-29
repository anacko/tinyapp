const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userMyself": {
    id: "userMyself",
    email: "user@email.com",
    password: "pass"
  },
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = function() {
  let source = 'abcdefghijklmnopqrstuvwxyz';
  source += source.toUpperCase();
  source += '0123456789';
  let str = '';
  for (let k = 1; k <= 6; k++) {
    str += source[Math.floor(Math.random() * source.length)];
  }
  return str;
};

const retrieveInfo = function(checkParam, objItem, obj) {
  for (let item in obj) {
    if (obj[item][objItem] === checkParam) return item;
  }
  return false;
};

app.get("/", (req, res) => {
  const isLoggedIn = req.cookies.user_id;
  if (isLoggedIn) {
  res.redirect(`/urls`);
  } else {
  res.redirect(`/login`);
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user_id: users[req.cookies.user_id] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send('Error 400 - Bad Request. Invalid e-mail or password.');
  } else if (retrieveInfo(email, "email", users)) {
    res.status(400).send('Error 400 - Bad Request. E-mail already registered.');
  } else {
    let id = generateRandomString();
    while (retrieveInfo(id, "id", users)) {
      id = generateRandomString();
    }
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect(`/urls`);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user_id: null };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = retrieveInfo(email, "email", users);
  if (!email || !password) {
    res.status(400).send('Error 400 - Bad Request. Invalid e-mail or password.');
  } else if (!id) {
    res.status(403).send('Error 403 - Forbidden. E-mail not registered.');
  } else {
    if (password !== users[id].password) {
      res.status(403).send('Error 403 - Forbidden. Password doesn\'t match.');
    } else {
      res.cookie("user_id", id);
      res.redirect(`/urls`);
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/");
});

app.get("/urls", (req, res) => {
  const templateVars = { user_id: users[req.cookies.user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send('Error 403 - Forbidden. User not logged in.')
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: users[req.cookies.user_id] };
  if (!templateVars.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/update", (req, res) => {
  // Only replace if truthy. Ex. if empty str, do nothing and return to /urls.
  if (req.body.updateLongURL) {
    urlDatabase[req.params.shortURL] = req.body.updateLongURL;
  }
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});