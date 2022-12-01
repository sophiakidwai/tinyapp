const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

//body-parser middleware for POST requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.set("view engine", "ejs");

//Generate random string for short URL
function generateRandomString() {
  let random = (Math.random() + 1).toString(36).substring(6);
  console.log("random", random);
  return random;
}

//URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// Route Handlers


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});


// generate random short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.post("/login", (req, res) => {
  username = req.body.username;
  res.cookie
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//Deletes URL 
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


//
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// app.get("/u/:id", (req, res) => {
//   const longURL = urlDatabase.longURL;
//   res.redirect(longURL);
// });

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies.username};
  res.render("urls_new", templateVars);
});

//Display a URL and its shortened form
app.get("/urls/:myid", (req, res) => {
  console.log(urlDatabase[req.params.myid])
  const templateVars = {
    username: req.cookies["username"],
    id: req.params.myid,
    longURL: urlDatabase[req.params.myid]
  };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); //

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
}); //