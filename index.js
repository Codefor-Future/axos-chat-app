let app = require("express")();
let http= require("http").Server(app)
let io= require("socket.io")(http)
let bodyParser= require('body-parser')

app.use(bodyParser.json());

app.get("/", function(req, res){
    res.sendFile(__dirname+"/index.html")
});



io.on("connection", (socket)=>{
    console.log("One connected");
    socket.on("disconnect",()=>{
        console.log("disconnected")
    })


    socket.on("newMsg",(newMsg)=>{
        socket.broadcast.emit("newMsg",newMsg)
    })
    socket.on("typing",(value)=>{
        socket.broadcast.emit("typing",value)
    })
    socket.on("online",(online)=>{
        console.log(online)
    })

})



http.listen(3000, ()=>{
    console.log("connection done")
})
