const express = require('express')
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: process.env.FRONT_END_URL, //your website origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

let channelArr = []
let idArr = []

//Interval function
const updateDuration = (id) => {
    let find = channelArr.find(item => item.id === id && item.totalDuration > item.duration)
    let findIndex = channelArr.findIndex(item => item.id === id && item.totalDuration > item.duration)
    if(find) {
      channelArr[findIndex].duration = channelArr[findIndex].duration + 5;
      console.log(channelArr[findIndex].duration)
      //Track duration
      io.in(id).emit("trackLive", channelArr[findIndex])
    }
}

const playStream = (socket, id) => {
    socket.on('playStream', data => {
        io.in(id).emit("playStream", data)
        if(!idArr.includes(id)) {
          idArr.push(id)
          channelArr.push({ duration: 0, id, totalDuration: data.body.duration })
          //Add 5 seconds in every 5 seconds interval
          let interval = {}
          if(channelArr.length) {
            interval = setInterval(() => updateDuration(id), 5000)
            clearInterval()
          }
        }  
    })
}

const disconnectSocket = (socket, id) => {
    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
        socket.leave(id);
        channelArr = channelArr.filter(channel => channel.id !== id)
        idArr = idArr.filter(item => item !== id)
    });
} 

// const socketIO = () => {
//     //Socket connection
//     io.on('connection', (socket) => {
//         const {id} = socket.handshake.query
    
//         socket.join(id)
    
//         playStream(socket);
    
//         disconnectSocket(socket)
    
//     });
// }

module.exports = {playStream, disconnectSocket}
