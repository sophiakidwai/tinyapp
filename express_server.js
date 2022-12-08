const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080

//body-parser middleware for POST requests
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["1234"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



app.set("view engine", "ejs");

//Generate random string for short URL
function generateRandomString() {
  let random = (Math.random() + 1).toString(36).substring(6);
  console.log("random", random);
  return random;
};

const checkEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) return database[key];
  }
  return false;
};

const urlDatabase = {
  // b6UTxQ: {
  //   longURL: "https://www.tsn.ca",
  //   userID: "user2RandomID",
  // },
  // i3BoGr: {
  //   longURL: "https://www.google.ca",
  //   userID: "userRandomID",
  // },
  // x3StFj: {
  //   longURL: "https://www.amazon.ca",
  //   userID: "userRandomID",
  // },
};

//Users database
const users = {
  // userRandomID: {
  //   id: "userRandomID",
  //   email: "user@example.com",
  //   password: (bcrypt.hashSync("test", 10)),
  // },
  // user2RandomID: {
  //   // id: "user2RandomID",
  //   // email: "user2@example.com",
  //   // password: (bcrypt.hashSync("test", 10)),
  // },
};

const urlsForUser = (id, urlDatabase) => {
  // console.log("URL Database", urlDatabase)
  const ownedUrls = {};
  for (const ID in urlDatabase) {
    // console.log("ID", ID)
    // console.log("Check", users[id], urlDatabase[ID].userID)
    if (id === urlDatabase[ID].userID) {
      ownedUrls[ID] = urlDatabase[ID];
      // console.log("Owned", ownedUrls)
    }
  } return ownedUrls;
};


// Route Handlers

app.get("/", (req, res) => {
  const userId = req.session["user_id"];
  if (!userId) {
  res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id
  if (!userID) {
    res.redirect("/urls/login");
  }
  const ownedUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { 
    urls: ownedUrls, 
    user: users[userID] 
  };
  res.render("urls_index", templateVars);
});


// generate random short url
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  const userID = req.session.user_id;
  urlDatabase[shortUrl] = {longURL: req.body.longURL, userID  }
  res.redirect(`/urls/${shortUrl}`);
});

//Deletes URL 
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id
  if (!userID) return res.send("You need to be logged in")

  if (urlDatabase[req.params.id].userID === (req.session.user_id)) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
    } else {
      res.status(403).send("Only owners can delete Urls");
    }
  });

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id
  if (!userID) return res.send("You need to be logged in")

  if (urlDatabase[req.params.id].userID === (req.session.user_id)) {
     urlDatabase[req.params.id].longURL = req.body.longURL
    res.redirect("/urls");
    } else {
      res.status(403).send("Only owners can delete Urls");
    }
});



app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(404).send("This URL does not exist")
  }
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);

});


app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Display a URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session["user_id"];
  if (!urlDatabase[id]) {
    return res.status(404).send("Please log in to view Urls")
  }
  if (!userId) {
    return res.send("Please login for access.");
  }
  const ownedUrls = urlsForUser(userId, urlDatabase);
  if(!ownedUrls[id]) {
    return res.status(401).send("This URL is not owned by you.");
  }
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    id,
    longURL,
    user: users[req.session["user_id"]],
  };

  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = checkEmail(email, users);
  
  if (!userExists) {
    return res.status(400).send("User does not exist");
  }
  if (userExists && bcrypt.compareSync(password, userExists.password)){
    req.session.user_id = userExists.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Incorrect username or password")
  }
}); 

//log in template
app.get("/login", (req, res) => {
  const userInfo = (users[req.session.user_id]);
  if (userInfo) return res.redirect("/urls");

  const templateVars = {
    email: req.body.email, 
    password: req.body.password, 
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// User registration page
app.get("/register", (req, res) => {
  const userInfo = (users[req.session.user_id]);
  if (userInfo) return res.redirect("/urls");

  const templateVars = {
    email: req.body.email,
    password: req.body.password,
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

// registration event handler
app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter a valid email address and password");
  } else if (checkEmail(req.body.email, users)) {
    res.status(400).send("User already exists");
  } else {
    const userID = generateRandomString();
    const newUser = {
      id: userID,
      email: req.body.email,
      password: hashedPassword,
    }
    users[userID] = newUser;
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// }); 