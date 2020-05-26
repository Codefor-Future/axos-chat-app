var express = require('express')
var http = require('http');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

const bodyParser= require('body-parser')

app.use(bodyParser.json());
var users=[]
const {chat}= require("./routes/handleRoutes")


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port,()=>{
    console.log("connection done")
});





app.get("/chat",chat)
app.get("/login",(req,res)=>{
    res.sendFile(__dirname+"/login.html")
})
app.post("/login",(req,res)=>{
    if(users.indexOf(req.body.username)===-1){
        res.status(200).cookie("username",req.body.username).send(req.body.username)
    }else{
        res.status(404).send()
    }
})

io.on("connection", (socket)=>{
    socket.emit("connect",users)
    socket.on("disconnect",()=>{
        for(var user in users){
            if(users[user].socketid== socket.id){
                users.splice(user,1)
                socket.broadcast.emit("updateUsers",users)
                flashMsg("Someone left")
                break;
            }
        }
    })

    function flashMsg(msg){
        socket.broadcast.emit("flashMsg",msg)
    }

    socket.on("newMsg",(newMsg)=>{
        if(newMsg.to===null){
            socket.broadcast.emit("newMsg",newMsg)
        }else{
            socket.to(newMsg.to).emit("newMsg",newMsg)
        }
    })
    socket.on("typing",(value)=>{
        if(value.to===null){
            socket.broadcast.emit("typing",value)
        }else{
            socket.to(value.to).emit("typing",value)
        }
    })
       socket.on("online",(online)=>{
        for(user in users){
            if(users[user].socketid==online.user){
                users[user].online=online.online
            }
        }
        socket.emit("updateUsers",users)
    })

    socket.on("newUser",(newUser,socketId,online)=>{
        console.log(newUser + " connected socketid= "+ socketId)
        users.push({
            socketid: socketId,
            name:newUser,
            online:online
        })
        socket.broadcast.emit("newUser", users)
        flashMsg(newUser+" joined")
    })
    socket.on("updateUsers",()=>{
        socket.emit("updateUsers",users)
    })
    socket.on("invitation",(invitation)=>{
        if(invitation.to==null){
            socket.broadcast.emit("invitation",invitation)
        }else{
            socket.to(invitation.to).emit("invitation",invitation)
        }
    })
    socket.on("invitResp",(accepted,sender)=>{
        if(accepted){
            socket.to(sender).emit("invitResp",accepted)
        }else{
            socket.to(sender).emit("invitResp",accepted)

        }
    })


})
