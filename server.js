var express = require('express');
var session = require('express-session');
var ws = require('ws');
var ejs = require('ejs');

var http = require('http');
var path = require('path');
var url = require('url');

var app = express();
app.use(express.static('www'));
app.use(session({
    secret: 'keyboard cat', //与cookieParser中的一致
    resave: false,
    saveUninitialized:true
}));

//使用模板引擎
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


var server = http.createServer(app);

//所有的socket连接
var matchQueue = [];

//已匹配成功的玩家数组
var matchedPlayer = [];

//创建socket服务
var wss = new ws.Server({
    server: server
});

wss.on("connection", function(ws, req) {

    var urlObj = url.parse(req.url);
    ws.account = urlObj.query;
    //将新连接放入匹配队列
    matchQueue.push(ws);
    if(matchQueue.length >= 2) {
        var p1 = matchQueue.pop();
        var p2 = matchQueue.pop();
        p1.oppo = p2;
        p2.oppo = p1;

        //随机分配谁拿黑子
        if(Math.random() < 0.5) {
            var temp = p1;
            p1 = p2;
            p2 = temp;
        }
        var data = JSON.stringify({
            type: "start",
            color: "black",
            oppo: p2.account
        });
        p1.send(data);

        //p2拿白子
        data = JSON.stringify({
            type: "start",
            color: "white",
            oppo: p1.account
        });
        p2.send(data);

        matchedPlayer.push(p1);
        matchedPlayer.push(p2);
    }

    ws.on("message", function(data) {
        var msg = JSON.parse(data);
        switch (msg.type) {
            case "put":
                if(matchedPlayer.indexOf(ws) >= 0) {
                    ws.oppo.send(data);
                }
                break;
        }
    });

    ws.on("error", function() {
        console.log("err");
    });

    ws.on("close", function() {
        var ind = matchedPlayer.indexOf(ws)
        if(ind >= 0) {
            try {
                ws.oppo.send(JSON.stringify({
                    type: "oppoLeave"
                }));
            }catch (error) {

            }
            matchedPlayer.splice(ind, 1);
        }
    });
})

//-----------------------------------
//http接口
app.get('/api/login', function(req, res) {
    var account = req.query.account.trim();
    if(!account) {
        res.send(`
            <script>
                alert("账号不能为空");
                location.href = "/";
            </script>
        `);
    }else {
        req.session.account = account;
        res.redirect("/game");
    }
});

//游戏页面接口
app.get('/game', function(req, res) {
    if(!req.session.account) {
        res.send(`
            <script>
                alert("请先登录");
                location.href = "/";
            </script>
        `);
    }else {
        var data = {
            account: req.session.account
        };
        res.render("game", data);
    }
});

server.listen(3000, function() {
    console.log('服务器已开启');
});
