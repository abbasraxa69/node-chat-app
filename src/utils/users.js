const users = [];
const addUser = ({ id, username, room }) => {
  //data cleaning
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validating data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //check for exisiting user
  const exisitingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validating username
  if (exisitingUser) {
    return {
      error: "Username is in use!",
    };
  }

  //storing user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
};
