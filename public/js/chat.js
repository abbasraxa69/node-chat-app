const socket = io();

//DOM Elements
const $messageForm = document.getElementById("message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormBtn = $messageForm.querySelector("button");
const $sendLocationBtn = document.getElementById("send-location");
const $messages = document.getElementById("messages");

//Templates
const $messageTemplate = document.getElementById("message-template").innerHTML;
const $locationTemplate =
  document.getElementById("location-template").innerHTML;
const $sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//funtions
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // // Visible height
  const visibleHeight = $messages.offsetHeight;

  // // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render($messageTemplate, {
    message: message.text,
    time: moment(message.createdAt).format("h:mm A"),
    username: message.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});

socket.on("locationMessage", (locationMessage) => {
  const html = Mustache.render($locationTemplate, {
    message: locationMessage.url,
    time: moment(locationMessage.createdAt).format("h:mm A"),
    username: locationMessage.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //disable form
  $messageFormBtn.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormBtn.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
  });
});

$sendLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("GeoLocation not supported by the browses");
  }
  //disable location button
  $sendLocationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      longitude: position.coords.latitude,
      latitude: position.coords.longitude,
    };
    socket.emit("sendLocation", location, () => {
      $sendLocationBtn.removeAttribute("disabled");
      console.log("Location Shared!");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
