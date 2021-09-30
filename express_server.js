const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { generateRandomString, findUserByEmail, subsetUrlsByUser } = require('./helpers');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['some-veryveryveryvery-long-key-1', 'not-so-long key 2, but ok!']
}))

const urlDatabase = {};
const users = {};

app.get('/', (req, res) => {
  const isLoggedIn = req.session.user_id;
  isLoggedIn ? res.redirect('/urls') : res.redirect('/login');
});

app.get('/register', (req, res) => {
  const templateVars = { user_id: users[req.session.user_id] };
  if (templateVars.user_id) {
    return res.redirect('/urls');
  }
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (!email || !password) {
    res.status(400).send('Error 400 - Bad Request. Invalid e-mail or password.');

  } else if (findUserByEmail(email, users, 'email')) {
    res.status(400).send('Error 400 - Bad Request. E-mail already registered.');

  } else {
    let id = generateRandomString();
    // If id is already taken, generate again.
    // Highly unlikely, but we may have a trillion users at some point!
    while (findUserByEmail(id, users, 'id')) {
      id = generateRandomString();
    }
    // Now that id is unique, register user
    users[id] = { id, email, password };
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user_id: users[req.session.user_id] };
  if (templateVars.user_id) {
    return res.redirect('/urls');
  }
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = findUserByEmail(email, users, 'email');

  if (!email || !password || !id) {
    res.status(400).send('Error 400 - Bad request. Invalid e-mail or password.');

  } else if (bcrypt.compareSync(password, users[id].password)) {
    req.session.user_id = id;
    res.redirect('/urls');

  } else {
    // Wrong password. Msg states for email/password due to security reasons.
    res.status(400).send('Error 400 - Bad request. Invalid e-mail or password.');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/'); 
});
// NOTE: the requirement was to redirect to /urls. It will lead to an error msg (as previous requirement asked for). 
// As we would redirecting it and it is not an error, it made more sense redirect to the root (and from there, to the login page.)

app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user_id: users[req.session.user_id],
      urls: subsetUrlsByUser(req.session.user_id, urlDatabase, 'userID')
    };
    res.render('urls_index', templateVars);
  } else {
    // Note: it could redirect to login page, but the requirement was for a relevant html.
    res.status(401).send('Error 401 - Unauthorized. <a href="/login">Login</a> or <a href="/register">Register</a>.');
  }
});

app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send('Error 401 - Unauthorized. User not logged in.')
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

// Note: instead of /urls/:id
app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('Error 404 - Not found.')
    // only owner of shortURL may access this page (same for post delete and update)
  } else if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = {
      user_id: users[req.session.user_id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(401).send('Error 401 - Unauthorized. <a href="/login">Login</a> or <a href="/register">Register</a>.');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send('Error 401 - Unauthorized. Not logged in or not the owner.');
  }
});

// Note: instead of post to /urls/:id
app.post('/urls/:shortURL/update', (req, res) => {
  if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    // Only replace if truthy. Ex. if empty str, do nothing and return to /urls.
    if (req.body.updateLongURL) {
      urlDatabase[req.params.shortURL].longURL = req.body.updateLongURL;
    }
    res.redirect('/urls');
  } else {
    res.status(401).send('Error 401 - Unauthorized. Not logged in or not the owner.');
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