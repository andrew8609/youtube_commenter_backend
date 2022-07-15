const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./src/config/dbConnection');
const typeDefs = require('./src/typeDefs/index');
const resolvers = require('./src/resolvers/index');
const bodyParser = require('body-parser');
const expressPlayground = require("graphql-playground-middleware-express").default;
var cloudinary = require('cloudinary').v2;
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const {seed} = require('./seed')

Sentry.init({
  dsn: "https://fd03633d9ce543b89c313e9f71bd5966@o613569.ingest.sentry.io/5749259",

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

//variables
const PORT = process.env.PORT || 5000;
const app = express();

const httpp = require('http')
const ioo = require('socket.io')

const http = httpp.createServer(app)
const io = ioo(http) 

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
})


//server for graphql
const { ApolloServer } = require('apollo-server-express');
const userAuth = require('./src/middlewares/userAuth');
const { crawler } = require('./crawler');
const getIP = require('ipware')().get_ip;

//routes
app.use(bodyParser.json({limit: '50000mb'}));

//Graphql Server
const server = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: async ({ req, res, next }) => {
    try {
      const user = await userAuth(req, res, next);
      var ip = getIP(req);

      return { user, ip };
    } catch (err) {
      throw err
    }
  }
});

//middlewares
app.use(cors());
app.options('*', cors());
app.use(express.json());
app.get("/graphql", expressPlayground({ endpoint: "/graphql" }));

let channelArr = []
let idArr = []
let usersInChannel = []
let idArr2 = []
let interval = {}
let viewers = []
let idArr3 = []

//Interval function
const updateDuration = (id) => {
  let find = channelArr.find(item => item.id === id && item.totalDuration > item.duration)
  let findIndex = channelArr.findIndex(item => item.id === id && item.totalDuration > item.duration)
  let findChannel = channelArr.find(item => item.id === id)
  if(findChannel) {
    if(findChannel.duration >= findChannel.totalDuration) {
      clearInterval(interval)
    }
  }
  if(find) {
    channelArr[findIndex].duration = channelArr[findIndex].duration + 5;
   
    //Track duration
    io.in(id).emit("trackLive", channelArr[findIndex])
  }
}

//add number of viewer
const addViewer = (socket, id) => {
  socket.on('addViewer', data => {
    if(!idArr3.includes(id)) {
      idArr3.push(id)

      viewers.push({ id, viewers: 1 })

      io.in(id).emit("getViewers", 1)
    } else {
      const findChannel = viewers.find(item => item.id === id)
      const findChannelIndex = viewers.findIndex(item => item.id === id)
      if(findChannel) {
        viewers[findChannelIndex].viewers = viewers[findChannelIndex].viewers + 1;
        io.in(id).emit("getViewers", viewers[findChannelIndex].viewers)
      }
    }
    
    
  })
}

//play stream
const playStream = (socket, id) => {
  socket.on('playStream', data => {
        if(!idArr2.includes(id)) {
          idArr2.push(id)
          usersInChannel.push({ id, users: 1 })
          io.in(id).emit("playStream", 1)
        } else {
          const findChannelIndex = usersInChannel.findIndex(item => item.id === id)
          usersInChannel[findChannelIndex].users = usersInChannel[findChannelIndex].users + 1
          const findChannelUsers = usersInChannel.find(item => item.id === id)
          io.in(id).emit("playStream", findChannelUsers.users)
          if(!idArr.includes(id) && findChannelUsers && findChannelUsers.users >= 3) {
            idArr.push(id)
            channelArr.push({ duration: 0, id, totalDuration: data.body.duration, users: 3 })
            //Add 5 seconds in every 5 seconds interval
            if(channelArr.length) {
              interval = setInterval(() => updateDuration(id), 5000)
            }
          } else if(idArr.includes(id)) {
            const findChannelIndex = channelArr.findIndex(channel => channel.id === id)
            channelArr[findChannelIndex].users = channelArr[findChannelIndex].users + 1
          }  
        }
  })
}

//get duration
const getDuration = (socket, id) => {
  socket.on("getDuration", data => {
    socket.join(data.id)
    let find = channelArr.find(item => item.id === id)
    if(find) {
      io.in(data.id).emit("getDuration", {duration: find.duration, isNew: data.isNew})
      socket.leave(data.id);
    } else {
      io.in(data.id).emit("getDuration", 0)
      socket.leave(data.id);
    }
    
  })
}

//Leave channel
const disconnectSocket = (socket, id) => {
  // Leave the room if the user closes the socket
  socket.on("disconnect", (data) => {
    //Find Channel
    const findChannel = channelArr.find(channel => channel.id === id)
    const findChannelIndex = channelArr.findIndex(channel => channel.id === id)

    //Find Channel
    const findChannel1 = usersInChannel.find(channel => channel.id === id)
    const findChannelIndex1 = usersInChannel.findIndex(item => item.id === id)

    //Find Channelof viewers
    const findChannel2 = viewers.find(channel => channel.id === id)
    const findChannelIndex2 = viewers.findIndex(item => item.id === id)
    
    if(findChannel) {
      channelArr[findChannelIndex].users = findChannel.users - 1
    }

    if(findChannel1) {
      
      usersInChannel[findChannelIndex1].users = usersInChannel[findChannelIndex1].users - 1
    }
    
    if(findChannel2) {
     
      viewers[findChannelIndex2].viewers = findChannel2.viewers - 1
      io.in(id).emit("getViewers", viewers[findChannelIndex2].viewers)
    }

    if(findChannel && findChannel.users === 0) {
      socket.leave(id);
      console.log("disconnect", data)
      clearInterval(interval)

      
      channelArr = channelArr.filter(channel => channel.id !== id)
      idArr = idArr.filter(item => item !== id)

      usersInChannel = usersInChannel.filter(channel => channel.id !== id)
      idArr2 = idArr2.filter(item => item !== id)
      
      viewers = viewers.filter(channel => channel.id !== id)
      idArr3 = idArr3.filter(item => item !== id)
    }
  });
} 

let messages = []

//Chat messages
const sendMessage = (socket, id) => {
  socket.on("sendMessage", (data) => {
    messages.push({id, data})
    getMessages(id)
  })
}

const getMessages = (id) => {
  const filterMessages = messages.filter(message => message.id === id)
  const messagesSend = filterMessages.map(m => m.data)
  io.in(id).emit("getMessages", messagesSend)
}

//Socket connection
io.on('connection', (socket) => {
  const {id} = socket.handshake.query

  //join socket
  socket.join(id)

  //play stream
  playStream(socket, id);

  //send message
  sendMessage(socket, id)

  //get all messages
  getMessages(id)

  //get duration
  getDuration(socket, id)

  //add viewer
  addViewer(socket, id)

  //disconnect and leave channel
  disconnectSocket(socket, id)

});

//connect to DB
connectDB();

//crawl data
crawler()

//seed data
// seed()

server.applyMiddleware({ app })

app.set('socketio', io)

//setup the server
http.listen(PORT, () => console.log(`API Server is running on Port ${PORT}`));
