//socket io client initialization
const socket = io();

//elements
const form = document.querySelector("form");
const formMessage = document.querySelector("input");
let renderMessage = document.querySelector("#renderMessage");
const shareLocation = document.querySelector("#share-location");
const messages = document.querySelector("#messages");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//autoscroll

const autoScroll = () => {
  //new message element
  const newMessage = messages.lastElementChild;

  //new message height
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offSetHeight + newMessageMargin;

 //visible height
  const visibleHeight = messages.offSetHeight

  //height of messages container
  const msgContainerHeight = messages.scrollHeight

  //how far dow i have scrolled
  const scrollOffset = messages.scrollTop + visibleHeight

  if (msgContainerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
};

//event for messages
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
    username: message.username,
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

//event for location shared
socket.on("location", (location) => {
  const html = Mustache.render(locationTemplate, {
    location: location.text,
    createdAt: moment(location.createdAt).format("h:mm a"),
    username: location.username,
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

//when a user wants to joins a chat
socket.emit("join", { username, room }, function (error) {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

//chat room data from server
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector(".chat__sidebar").innerHTML = html;
});


//on form submition
form.addEventListener("submit", (event) => {
  event.preventDefault();
  form.setAttribute("disabled", "disabled");
  let messageValue = formMessage.value;
  socket.emit("sendMessage", messageValue, function () {
  });
  form.removeAttribute("disabled");
  formMessage.focus();
  formMessage.value = "";
});

//on location share buton click
shareLocation.addEventListener("click", (e) => {
  e.preventDefault();

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by this browser");
  }
  shareLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "share-location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      function () {
        shareLocation.removeAttribute("disabled");
      }
    );
  });
});

