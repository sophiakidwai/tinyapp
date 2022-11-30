const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // console.log(urlDatabase) 
  Object.assign(urlDatabase, req.body);
  console.log(urlDatabase)
  res.redirect("/urls/:id");
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {   
  const longURL = urlDatabase.longURL;
    res.redirect(longURL);
  });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// browser is requesting this URL http://localhost:8080/urls/9sm5xK

app.get("/urls/:myid", (req, res) => {
  const templateVars = { 
    id: req.params.myid, 
    longURL: urlDatabase[req.params.myid]
  };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

