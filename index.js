const express = require("express");
const app=express()
const http = require("http").Server(app)
let io= require("socket.io")(http)

const bodyParser= require('body-parser')

app.use(bodyParser.json());
var users=[]


const {chat}= require("./routes/handleRoutes")

app.get("/chat",chat)
app.get("/login",(req,res)=>{
    res.sendFile(__dirname+"/login.html")
})
app.post("/login",(req,res)=>{
    if(users.indexOf(req.body.username)==-1){
        // users.push({
        //     socketid: null,
        //     name:req.body.username
        // })
        // console.log(users)
        res.status(200).cookie("username",req.body.username).send(req.body.username)
    }else{
        res.status(204).send()
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
        socket.broadcast.emit("newMsg",newMsg)
    })
    socket.on("typing",(value)=>{
        socket.broadcast.emit("typing",value)
    })
    socket.on("online",(online)=>{
        console.log(online)
    })

    socket.on("newUser",(newUser,socketId)=>{
        console.log(newUser + " connected socketid= "+ socketId)
        users.push({
            socketid: socketId,
            name:newUser
        })
        socket.broadcast.emit("newUser", users)
        flashMsg(newUser+" joined")
    })
    socket.on("updateUsers",()=>{
        socket.emit("updateUsers",users)
    })


})

http.listen(3000, ()=>{
    console.log("connection done")
})
