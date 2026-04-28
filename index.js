const express = require("express");
const app = express();
const router = require("./router");
const bodyParser = require("body-parser");
const cors = require("cors");

// 解决跨域
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '10mb'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use("/api",router);


app.listen(3001,() =>{
    console.log("服务器运行在3001端口上");
})