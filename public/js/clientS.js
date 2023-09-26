
isFromServer = false;
var isPlaying = false;
var isPaused = true;

const socket = io('/');

const videoGrid = document.getElementById('video-grid')

var lastname = sessionStorage.getItem("username");
console.log("result = " + lastname);

const myVideo = document.createElement('video')

const message = document.getElementById('message');
userNameInput = document.getElementById('userNameInput');
button = document.getElementById('submit');
output = document.getElementById('output');
logsOutput = document.getElementById("logsOutput");
typing = document.getElementById('typing');
btnSubmitYtUrl = document.getElementById('btnSubmitYtUrl');
btnSubmitWebUrl = document.getElementById('btnSubmitWebUrl');

const yt_player = new Plyr('#yt_player');

var username;
var typingTimer;

var doneTypingInterval = 2000;



myVideo.muted = true
const peers = {}

let myVideoStream;



// query DOM


function roomInterval() {
  socket.emit('reconnectUser', roomName, username);
}
// Events

$('#exampleModal').modal({
  backdrop: 'static',
  keyboard: false
});

$('#submitName').click(function () {
  username = userNameInput.value;
  socket.emit('roomJoinedFirst', roomName, username);
  $("#exampleModal").modal('hide');
  setInterval(roomInterval, 600000);
});

$('#myList a').on('click', function (e) {
  e.preventDefault()
  $('a.list-group-item.active').removeClass("active");
  $(this).addClass("active");
})

btnSubmitYtUrl.addEventListener('click', () => {
  const ipYoutubeUrl = document.getElementById('ipYoutubeUrl');
  var yt_url = ipYoutubeUrl.value;

  socket.emit('sYoutubeURL', roomName, yt_url);

  setYoutubeURL(yt_url);
});

btnSubmitWebUrl.addEventListener('click', () => {
  const ipWebUrl = document.getElementById('ipWebUrl');
  var web_url = ipWebUrl.value;

  socket.emit('sWebURL', roomName, web_url);

  setWebURL(web_url);
});

yt_player.on('play', event => {
  if (!isFromServer) {
    if (!isPlaying && isPaused) {
      isPlaying = true;
      isPaused = false;
      socket.emit('sYt_State', roomName, {
        state: "play",
        currentTime: yt_player.currentTime
      });

    }
  }
})

yt_player.on('pause', event => {
  if (!isFromServer) {
    if (isPlaying && !isPaused) {
      isPlaying = false;
      isPaused = true;
      socket.emit('sYt_State', roomName, {
        state: "pause",
        currentTime: yt_player.currentTime
      });
    }
  }
})
// yt_player.on('playing', event => {
//   socket.emit('sYt_State', roomName, {
//     state: "playing",
//     currentTime: yt_player.currentTime
//   });
// })


button.addEventListener('click', () => {
  socket.emit('chat', {
    room: roomName,
    message: message.value,
    userNameInput: username
  })
  output.innerHTML += '<div class="d-flex justify-content-end mb-4">\
                  <div class="msg_container_send">\
                  '+ message.value +
    '<span class="msg_time_send">9:05 AM, Today</span>\
                  </div>\
                </div>\
                ';

  message.value = "";
});

message.addEventListener('keyup', () => {
  socket.emit('userTyping', roomName, username)
  clearTimeout(typingTimer);
  if (message.value) {
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  }
});

//user is "finished typing," do something
function doneTyping() {
  //do something
  socket.emit('doneTyping', roomName)
}


// Listen to socket events


socket.on('error', reason => {
  console.log('error from client : ' + reason);
})

socket.on('name', (data) => {
  logsOutput.innerHTML += '<p> <strong>' + data.message + ' joined </strong> </p>'
})

socket.on('usersList', (user_names) => {
  $("#usersList").html("");
  
  user_names.forEach(function (client) {
    var randNum = Math.round(Math.random())
    var icon_link = "";
    if (randNum == 0)
      icon_link = "https://github.com/shyamshr93/tempAssets/blob/main/eve_52.png?raw=true";
    else
      icon_link = "https://github.com/shyamshr93/tempAssets/blob/main/walle_52.png?raw=true";
    $("#usersList").append('<div class="users-cont d-flex"><img class="profile-icon" src="'+ icon_link + '"><p class="profile-name">' + client.customName + '</p></div>');
  })
});

socket.on('userLeft', (data) => {

  //output.innerHTML += '<p> <strong>' + data.message + ' left </strong> </p>'
  logsOutput.innerHTML += '<p> <strong>' + data.userName + ' left </strong> </p>'
  socket.emit('getTotalUsers', roomName);
})

socket.on('totalusers', (data) => {
  document.getElementById('totalUsers').innerHTML = "USERS CONNECTED - " + data;
})

socket.on('chat', (data) => {
  typing.innerHTML = "";
  output.innerHTML += '<div class="d-flex justify-content-start mb-4">\
                  <div class="msg_container">\
                  <div class="msg_header">\
                  '+ data.userNameInput +
    '</div>\
                  '+ data.message +
    '<span class="msg_time">9:05 AM, Today</span>\
                  </div>\
                </div>\
                ';
  //output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
})

socket.on('userTyping', (data) => {
  typing.innerHTML = data.userName + ' is typing...'
});

socket.on('doneTyping', (data) => {
  typing.innerHTML = '';
});

socket.on('reconnectUser', (data) => {
  console.log(data);
});


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
});


socket.on('cYoutubeURL', yt_url => {
  setYoutubeURL(yt_url);
})

socket.on('cWebURL', web_url => {
  setWebURL(web_url);
})

socket.on('cYt_State', yt_data => {

  isFromServer = true;
  switch (yt_data.state) {
    case "play":
      yt_player.currentTime = yt_data.currentTime;
      yt_player.play();
      isPlaying = true;
      isPaused = false;
      break;
    case "pause":
      yt_player.currentTime = yt_data.currentTime;
      yt_player.pause();
      isPlaying = false;
      isPaused = true;
      break;

    // case "playing":
    //   yt_player.currentTime = yt_data.currentTime;
    //   break;
  }
  isFromServer = false;
})



//Functions
function reconnectUser() {
  socket.emit('reconnectUser', roomName, username);
}

function btYt_Player_Click() {
  var yt_main_div = document.getElementById("yt_main_div");
  var local_main_div = document.getElementById("local_main_div");
  var web_main_div = document.getElementById("web_main_div");
  yt_main_div.style.display = "block";
  local_main_div.style.display = "none";
  web_main_div.style.display = "none";
  setYoutubeURL('https://www.youtube.com/watch?v=-iW1-BuJ_Hc');
}

function btLocal_Player_Click() {
  var yt_main_div = document.getElementById("yt_main_div");
  var local_main_div = document.getElementById("local_main_div");
  var web_main_div = document.getElementById("web_main_div");
  yt_main_div.style.display = "none";
  local_main_div.style.display = "block";
  web_main_div.style.display = "none";
  setYoutubeURL('https://www.youtube.com/watch?v=tfrWuiQ4QNc');
}

function btWeb_Player_Click() {
  var yt_main_div = document.getElementById("yt_main_div");
  var local_main_div = document.getElementById("local_main_div");
  var web_main_div = document.getElementById("web_main_div");
  yt_main_div.style.display = "none";
  local_main_div.style.display = "none";
  web_main_div.style.display = "block";
  setYoutubeURL("https://www.youtube.com/watch?v=4NRXx6U8ABQ");
  //setYoutubeURL('https://www.youtube.com/watch?v=xMKzdQrC5TI');
}

function setYoutubeURL(yt_url) {
  var video_id = yt_url.toString().split('v=')[1];
  var ampersandPosition = video_id.indexOf('&');
  if (ampersandPosition != -1) {
    video_id = video_id.substring(0, ampersandPosition);
  }
  yt_player.source = {
    type: 'video',
    sources: [
      {
        src: video_id,
        provider: 'youtube',
      },
    ],
  };
}

function loadLocalVideo() {

  var URL = window.URL || window.webkitURL
  var file = document.getElementById("btLocalFile").files[0];
  var fl_type = file.type



  var stream = file.stream();

  var fileURL = URL.createObjectURL(file)
  
  document.getElementById('vid-label').innerHTML = file.name;

  console.log(file.name);

  yt_player.source = {
    type: 'video',
    title: 'Example title',
    sources: [
      {
        src: fileURL,
      }
    ],
  };
}

function setWebURL(web_url) {
  yt_player.source = {
    type: 'video',
    title: 'Example title',
    sources: [
      {
        src: web_url,
      }
    ],
  };
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
  playStop()
}

const muteFunctionality = () => {
  if (myVideoStream != null && myVideoStream.getAudioTracks != null) {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnMuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
}

const playStop = () => {
 
}
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnMuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>UnMute</span>
    `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
  document.querySelector('.main__video_button').innerHTML = html;
}

