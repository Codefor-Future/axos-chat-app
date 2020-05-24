const express = require("express");
const app=express()
const cookieParser= require("cookie-parser")
app.use(cookieParser())

function chat(req,res){
    res.sendFile(__dirname+'/index.html')
}


module.exports={
    chat
}