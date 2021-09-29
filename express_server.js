const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'userRandomID' },
  'b2xVn3': { longURL: 'http://www.lighthouselabs.ca', userID: 'user2RandomID' },
  '9sm5xi': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  '9sm5xL': { longURL: 'http://www.canada.ca', userID: 'user2RandomID' },
  'A2xVn3': { longURL: 'http://www.lighthouselabs.ca', userID: 'userMyself' },
  '98m5xL': { longURL: 'http://www.canada.ca', userID: 'userMyself' }
};

const users = {
  'userMyself': {
    id: 'userMyself',
    email: 'user@email.com',
    password: 'pass'
  },
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
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

app.get('/', (req, res) => {
  const isLoggedIn = req.session.user_id;
  if (isLoggedIn) {
  res.redirect('/urls');
  } else {
  res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  const templateVars = { user_id: null };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (!email || !password) {
    res.status(400).send('Error 400 - Bad Request. Invalid e-mail or password.');
  } else if (retrieveInfo(email, 'email', users)) {
    res.status(400).send('Error 400 - Bad Request. E-mail already registered.');
  } else {
    let id = generateRandomString();
    while (retrieveInfo(id, 'id', users)) {
      id = generateRandomString();
    }
    users[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user_id: null };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = retrieveInfo(email, 'email', users);
  if (!email || !password || !id) {
    res.status(400).send('Error 400 - Bad request. Invalid e-mail or password.');
  } else if (bcrypt.compareSync(password, users[id].password)) {
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    // Wrong password. Msg states for email/password due to security reasons:
    // https://stackoverflow.com/questions/14922130/which-error-message-is-better-when-users-entered-a-wrong-password
    res.status(400).send('Error 400 - Bad request. Invalid e-mail or password.');
  }
});

app.post('/logout', (req, res) => {
  //res.clearCookie('user_id');
  req.session.user_id = null;
  res.redirect('/');
});

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user_id: users[req.session.user_id],
      urls: retrieveInfo(req.session.user_id, 'userID', urlDatabase, false) };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send('Error 401 - Unauthorized. User not logged in.')
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user_id: users[req.session.user_id] };
  if (!templateVars.user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {

  // only owner of shortURL may access this page (same for post delete and update)
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      user_id: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(401).send('Error 401 - Unauthorized. Not the owner.');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = { user_id: users[req.session.user_id] };
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send('Error 401 - Unauthorized. Not the owner.');
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = { user_id: users[req.session.user_id] };
    // Only replace if truthy. Ex. if empty str, do nothing and return to /urls.
    if (req.body.updateLongURL) {
      urlDatabase[req.params.shortURL].longURL = req.body.updateLongURL;
    }
    res.redirect('/urls');
  } else {
    res.status(401).send('Error 401 - Unauthorized. Not the owner.');
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('Error 404 - Not found. We couldn\'t find this url!');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});