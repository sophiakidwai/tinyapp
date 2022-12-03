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
};

//Find email function
// const checkEmail = (email) => {
//   for (let keyID in users) {
//     if (users[keyID].email === email)
//       return users[keyID];
//   }
//   return false;
// };
const checkEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) return database[key];
  }
  return false;
};


//URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Users database
const users = {
  userRandomId: {
    id: "userRandomID",
    email: "user@example.com",
    password: "test",
  },
  user2RandomId: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Route Handlers

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_Id"];
  const user = users[userId]

  const templateVars = {
    urls: urlDatabase,
    user: user
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
  // check if email exists
  let user = checkEmail(req.body.email, users);
  if (user === false) {
    res.sendStatus(403);
  } else if (req.body.password === user.password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.sendStatus(403);
  }
});

//log in template
app.get("/urls/login", (req, res) => {
  let templateVars = { 
    email: req.body.email, 
    password: req.body.password, 
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

// Registration 
// app.get("/register", (req, res) => {
//   const templateVars = { user: null };
//   res.render("urls_register", templateVars);
// });

//Handles regstration data
// app.post("/register", (req, res) => {
//   if (req.body.email === "" || req.body.password === "") {
//     res.sendStatus(400);
//   }
//   if (checkEmail(req.body.email)) {
//     res.sendStatus(400);
//   } else {
//     // create a new user in user database
//     const userId = generateRandomString();
//     users[userId] = {
//       email: req.body.email,
//       password: req.body.password,
//       id: userId,
//     }
//     res.cookie("user_Id", userId);
//     console.log(users)
//     res.redirect('/urls');
//   }
// });

// User registration page
app.get("/urls/register", (req, res) => {
  const templateVars = { email: req.body.email, password: req.body.password, user: req.cookies.userId };
  res.render("urls_register", templateVars);
});

// registration event handler
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else if (checkEmail(req.body.email, users)) {
    res.sendStatus(400);
  } else {
    const userID = generateRandomString();
    users["id"] = userID;
    users["email"] = req.body.email;
    users["password"] = req.body.password;
    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
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
  const templateVars = { user: req.cookies.user };
  res.render("urls_new", templateVars);
});

//Display a URL and its shortened form
app.get("/urls/:myid", (req, res) => {
  console.log(urlDatabase[req.params.myid])
  const templateVars = {
    user: req.cookies["user_id"],
    id: req.params.myid,
    longURL: urlDatabase[req.params.myid]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// }); 