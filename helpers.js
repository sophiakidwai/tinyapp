const getUserByEmail = (email, database) => {
  for (let key in database) {
    if (database[key].email === email) return database[key];
  }
  return false;
};

const generateRandomString = () => {
  let random = (Math.random() + 1).toString(36).substring(6);
  console.log("random", random);
  return random;
};

const urlsForUser = (id, urlDatabase) => {
  const ownedUrls = {};
  for (const ID in urlDatabase) {
    if (id === urlDatabase[ID].userID) {
      ownedUrls[ID] = urlDatabase[ID];
    }
  } return ownedUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };