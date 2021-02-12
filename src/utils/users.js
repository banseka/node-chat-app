const users = [];

//adding a user to a chat room
const addUser = ({ id, username, room }) => {
  //clean user data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //checking if username and room was provided
  if (!username || !room) {
    return {
      error: "username and room should be provided",
    };
  }

  //check is username is taken in a room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validing user check
  if (existingUser) {
    return {
      error: "username is in use",
    };
  }

  const user = {
    id,
    username,
    room,
  };
  users.push(user);
  return { user };
};

//remove user
const removeUser = (id) => {
  const userIndex = users.findIndex((user) => {
    return user.id === id;
  });

  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};

//get user by id
const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });
  if (!user) {
    return undefined;
  }
  return user;
};

//get users in a room
const getRoomUsers = (room) => {
  const usersInRoom = users.filter((usersIn) => {
    return usersIn.room === room;
  });
  if (!usersInRoom) {
    return;
  }
  return usersInRoom;
};

module.exports = {
  getUser,
  getRoomUsers,
  removeUser,
  addUser,
};