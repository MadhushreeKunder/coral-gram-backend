const getNameFromSocialProfile = (user) =>{
  console.log({user});

  user.name = user.userId.username;
  user.followers = undefined;
  user.userId = undefined;
  return user;
}

module.exports = { getNameFromSocialProfile};