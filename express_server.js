const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "b2xVn3": { longURL: "http://www.lighthouselabs.ca", userID: "user2RandomID" },
  "9sm5xi": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "9sm5xL": { longURL: "http://www.canada.ca", userID: "user2RandomID" },
  "A2xVn3": { longURL: "http://www.lighthouselabs.ca", userID: "userMyself" },
  "98m5xL": { longURL: "http://www.canada.ca", userID: "userMyself" }
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

const retrieveInfo = function(checkParam, dbParam, db, single=true) {
  const allOccurrences = {};
  for (let item in db) {
    if (db[item][dbParam] === checkParam) {
		if (single) { return item; }
		allOccurrences[item] = db[item];
  }
  }
  if (Object.keys(allOccurrences).length === 0) { return false; }
  return allOccurrences;
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
  const templateVars = { user_id: null };
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
  res.clearCookie("user_id");
  res.redirect("/");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: users[req.cookies.user_id],
    urls: retrieveInfo(req.cookies.user_id, "userID", urlDatabase, false) };
  console.log(templateVars.urls)
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies.user_id };
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
    longURL: urlDatabase[req.params.shortURL].longURL
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
    urlDatabase[req.params.shortURL].longURL = req.body.updateLongURL;
  }
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});