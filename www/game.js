
var gt = document.getElementById("gt");
var rl = document.getElementById("round-label");
var rowNum = 15;
var colNum = 15;

//存放所有棋子的二维数组
var allps = [];

//记录当前该哪个颜色下棋，true黑色，false白色
var currentRound = true; //黑色

//本局游戏的回合记录
var pieceStack = [];

//记录游戏是否结束
var isOver = true;

//创建棋盘td,并将td里的div存放到allps数组中
function createTds(allps, rowNum, colNum) {
    for(var i = 0; i< rowNum; i++) {
        var tr = gt.insertRow();
        var tempArr = [];
        for(var j = 0; j < colNum; j++) {
            var td = tr.insertCell();
            td.onclick = tdClick;
            var d = document.createElement("div");
            td.appendChild(d);
            tempArr.push(d);
        }
        allps.push(tempArr);
    }
}
//调用创建棋盘createTds函数
createTds(allps, rowNum, colNum);

//初始化游戏函数
function initGame() {
    allps.forEach(tr=>{
        tr.forEach(p=>{
            p.setAttribute("state", "normal");
        });
    });

    //移除红边
    if(pieceStack.length>0){
        var po = pieceStack[pieceStack.length-1];
        allps[po.y][po.x].classList.remove("current");
    }

    //清空栈记录
    pieceStack = [];
    currentRound = true;
    rl.textContent = "当前回合："+(currentRound?"黑":"白");
}

//td点击事件函数
function tdClick(e) {
    if(isOver) {
        return;
    }
    
    var state = e.target.getAttribute("state");
    if(state == "normal") {
        var pos = positionOfPiece(e.target);

        //向服务器发送下子的位置
        cn.send(JSON.stringify({
            type: "put",
            pos: pos
        }));

        putPiece(pos);
        isOver = true;
        printInfo("当前是对手回合请等待！");

    }
}

//下子函数
function putPiece(pos) {
    var piece = allps[pos.y][pos.x];
    if(currentRound) {
        piece.setAttribute("state", "black");

    }else {
        piece.setAttribute("state", "white");
    }
 
    //移除红边
    if(pieceStack.length>0){
        var po = pieceStack[pieceStack.length-1];
        allps[po.y][po.x].classList.remove("current");
    }

    //记录本棋子
    pieceStack.push(pos);

    //判断是否赢了
    if(isWin(pos)) {
        isOver = true;
        alert("恭喜" + (currentRound ? "黑" : "白") + "子获胜！");
        cn.close();
        cn = null;
    }

    //刚下的标红
    if(pieceStack.length > 0) {
        var po = pieceStack[pieceStack.length - 1];
        allps[po.y][po.x].classList.add("current");
    }

    //切换回合
    currentRound = !currentRound;   
    rl.textContent = "当前回合：" + (currentRound ? "黑" : "白");
}

//获得某个棋子的坐标
function positionOfPiece(p) {
    for(var i = 0; i < rowNum; i++) {
        var col = allps[i].indexOf(p);
        if(col >= 0) {
            return {x: col, y: i};
        } 
    }
}

//悔棋按钮事件函数
// function retractClick() {
//     if(isOver) {
//         return;
//     }
    
//     if(pieceStack.length <= 0) {
//         return;
//     }

//     //移除红边
//     if(pieceStack.length>0){
//         var po = pieceStack[pieceStack.length-1];
//         allps[po.y][po.x].classList.remove("current");
//     }

//     var pos = pieceStack.pop();

//     //移除红边
//     if(pieceStack.length>0){
//         var po = pieceStack[pieceStack.length-1];
//         allps[po.y][po.x].classList.add("current");
//     }

//     allps[pos.y][pos.x].setAttribute("state", "normal");
//     currentRound = !currentRound;   
//     rl.textContent = "当前回合：" + (currentRound ? "黑" : "白");
// }

//判断某个方向是否胜利
function dirWin(allps, cp, color, pNum) {
    var aColor = allps[cp.y][cp.x].getAttribute("state");
    if(!isInBoard(cp)) {
        return false;
    }
    if(aColor == color) {
        pNum++;
        var props = {
            pNum: pNum,
            color: color
        }
        return props;
    }else {
        return false;
    }
}

//判断胜利函数
function isWin(pos) {
    var flag = true;
    var color = currentRound ? "black" : "white";

    var pNum = 1;
    var cp = {x: pos.x, y: pos.y};
    //检查左右是否够5个
    
    //检查左侧
    while(flag) {
        cp.x--;
        var isStop = dirWin(allps,cp, color, pNum);    
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
       
    }
    //检查右侧
    cp = {x: pos.x, y: pos.y};
    while(flag) {
        cp.x++;
        var isStop = dirWin(allps,cp, color, pNum); 
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
        
    }
    if(pNum >= 5) {
        return true;
    }
    

// ------------------------------------------------------------------

    var pNum = 1;
    var cp = {x: pos.x, y: pos.y};
    //检查上侧
    while(flag) {
        cp.y--;
        var isStop = dirWin(allps,cp, color, pNum);    
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
    
    }
    //检查下侧
    cp = {x: pos.x, y: pos.y};
    while(flag) {
        cp.y++;
        var isStop = dirWin(allps,cp, color, pNum); 
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
        
    }
    if(pNum >= 5) {
        return true;
    }

// ----------------------------------------------------------------------

    var pNum = 1;
    var cp = {x: pos.x, y: pos.y};
    //检查左上侧
    while(flag) {
        cp.x--;
        cp.y--;
        var isStop = dirWin(allps,cp, color, pNum);    
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
    
    }
    //检查右下侧
    cp = {x: pos.x, y: pos.y};
    while(flag) {
        cp.x++;
        cp.y++;
        var isStop = dirWin(allps,cp, color, pNum); 
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
        
    }
    if(pNum >= 5) {
        return true;
    }

// ----------------------------------------------------------------
    var pNum = 1;
    var cp = {x: pos.x, y: pos.y};
    //检查左下侧
    while(flag) {
        cp.x++;
        cp.y--;
        var isStop = dirWin(allps,cp, color, pNum);    
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        }
    }
    //检查右上侧
    cp = {x: pos.x, y: pos.y};
    while(flag) {
        cp.x--;
        cp.y++;
        var isStop = dirWin(allps,cp, color, pNum); 
        if(!isStop) {
            break;
        }else {
            pNum = isStop.pNum;
            color = isStop.color;
        } 
    }
    if(pNum >= 5) {
        return true;
    } 
}

//判断一个坐标是否在棋盘内
function isInBoard(point) {
    return point.x >= 0 && point.x < rowNum && point.y >= 0 && point.y < colNum;
}

var cn = null;

//匹配对手函数
function beginMatch() {
    if(cn) {
        alert("游戏正在进行，请结束后再匹配！");
        return;
        
    }
    var me = document.getElementById("me");
    var address = "ws://" + location.host + "?" + me.textContent.trim();
    cn = new WebSocket(address);

    cn.onopen = function() {
        printInfo("连接成功，正在匹配对手，请稍等！");
    }

    cn.onmessage = function(e) {
        var msg = JSON.parse(e.data);
        switch(msg.type) {
            case "start":
                var black = msg.color == "black" ? "你" : "对方";
                alert("已匹配到对手：" + msg.oppo + "," + black + "拿黑棋先走");
                printInfo("当前是" + black + "的回合");
                var oppo = document.getElementById("oppo");
                oppo.textContent = "对手：" + msg.oppo;
                initGame();
                if(msg.color == "black") {
                    isOver = false;
                }
                break;
            case "put":
                isOver = false;
                putPiece(msg.pos);
                printInfo("当前是你的回合，请落子！");
                break;
            case "oppoLeave":
                isOver = true;
                alert("你的对手已逃跑！");
                printInfo("游戏结束，请重新匹配！");
                cn.close();
                cn = null;
                break;
            
        }
    }

    cn.onerror = function() {
        alert("连接失败，请检查网络设置");
        cn = null;
    }

    cn.onclose = function() {
        printInfo("游戏已结束，请重新匹配！");
    }

}

//显示游戏提示
function printInfo(i) {
    var info = document.getElementById('info');
    info.textContent = i;
}