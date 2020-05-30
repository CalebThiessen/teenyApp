module.exports = { getUserByEmail : getUserByEmail }
function getUserByEmail(email, usersDatabase){
    for (elem in usersDatabase){
      if (usersDatabase[elem].email === email)
      return true
    }
    return false
    }

   