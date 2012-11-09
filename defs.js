OSI = setInterval; //Wrapper for setInterval
OCI = clearInterval; //Wrapper for clearInterval
IC = 0; //Interval counter

setInterval = function (func, delay)
{
    if(func && delay)
        IC++;
    
    return OSI(func, delay);
};

clearInterval = function (id)
{
    if(id !== true) //JQuery sometimes hands in true which doesn't count
        IC--;

    return OCI(id);
};

var game = false; //The game object, it will be assigned later.
ni = false; //No input, used by input.js.

var LU = function(id, t, pi)
{
    $("#" + id).animate({"borderColor":"#8E3900", "padding": pi+"px"}, t);
}

var LD = function(id, t)
{
    $("#" + id).animate({"borderColor":"#111", "padding":"0px"}, t);
}

var AU = function(ut, nt, pi) //all up
{
    LU("f", ut, pi);
    setTimeout(function(){LU("t", ut, pi)}, nt);
    setTimeout(function(){LU("g", ut, pi)}, nt*2);
}

var AD = function(dt, nt) //all down
{
    LD("f", dt);
    setTimeout(function(){LD("t", dt)}, nt);
    setTimeout(function(){LD("g", dt)}, nt*2);
}

var shine = function(ut, nt, st, pi) //up time (how long does it take for an element to light up), next time (how long before we switch to the next one), switch time (how long before they start shutting down)
{				
    AU(ut, nt, pi);
    setTimeout(function(){AD(ut, nt)}, st)
}


var init = function()
{				
    var canvas = document.getElementById("c");
    
    fps = 60;
    
    game = new Game(canvas);
    
    game.FFPS = fps; //Forced FPS
    
    sload(function()
    {
        game.LSA = 0
        game.run = setInterval(game.update, 1000/game.FFPS);
        game.draw(); //This requests an animationFrame for itself, so the browser handles calling it.
        
        game.focus = function(e)
        {
            game.draw();
        };
        
        window.addEventListener('focus', game.focus);
        
        game.blur = function(e)
        {
            if (!game.paused)
            {
                game.pause();
                p.setAttribute("class", "clicked");
                
                for (var i = 0; i < game.sensors.length; i ++)
                    clearTimeout(game.sensors[i].sd);
            }
        };

        window.addEventListener('blur', game.blur); 					
    });			
    
    game.LSA = 1; //loading screen alpha

    game.loading = setInterval(function()
    {
        game.context.save();
        
        game.context.globalAlpha = game.LSA;
        game.context.fillStyle = "#111";
        game.context.fillRect(0, 0, canvas.width, canvas.height);
    
        game.context.font="24pt Helvetica";
        game.context.fillStyle = "#CCC";
        game.context.fillText("Loading...", 40, 40);		

        game.context.fillStyle = "#EEE";
        game.context.fillRect(60, 60, 400, 10);
        game.context.fillStyle = "#111";
        game.context.fillRect(61, 61, 398, 8);
        
        w = 396 * (nl/np);
        game.context.fillStyle = "#EEE";
        game.context.fillRect(62, 62, w, 6);
        
        game.context.restore();
    }, 1000/game.FFPS);
}

var pause = function()
{
    if (game.player.alive)
    {
        var p = document.getElementById("p");

        if (!game.paused)
        {
            game.pause(true);
            p.setAttribute("class", "clicked");
        }
        else
        {
            game.unpause(true);
            p.setAttribute("class", "topMenu");
        }
    }
}

var noinput = function()
{
    ni = true;
}

var doinput = function()
{
    ni = false;
}

var fff = function(i)
{
    game.loadLevel(game.levels[levelCodes[i].l]);
    game.unpause(); 
}

var ll = function()
{
    var toLoad = document.getElementById("lc").value;

    for (var itt = 0; itt < levelCodes.length; itt++)
        if (levelCodes[itt].code == toLoad)
        {
            game.pause();
            (function(i)
            {
                setTimeout(function(){fff(i);}, 1000);
            })(itt);
        }
            
    document.getElementById("lc").value = "";
}

var reload = function()
{
    if (game.player.alive)
    {
        clearInterval(game.level.preping);
        game.level.score = 0;
        game.level.gp = [];
        game.pause(false);
        
        setTimeout(function()
        {				
            game.unpause(false);
            game.loadLevel(game.levels[game.level.id[0]][game.level.id[1]]);
        }, game.pauseL);
    }
}

var reset = function()
{
    if (game.reset)
    {					
        if (game.player.alive)
        {
            clearC();

            game.messages = [];
            game.level = undefined;
            game.pause(false);
            
            setTimeout(function()
            {
                game.unpause();
                game.loadLevel(game.levels[0][0]);
            }, game.pauseL);				
        }
    }
    else
    {
        document.getElementById("res").innerHTML = "Sure?";
        document.getElementById("res").setAttribute("class", "clicked");
        game.reset = true;
    }
}

var beta = function()
{
    $("#b").replaceWith("<div id='b' onmouseover='beta();' onmouseout='beta2();'>- beta just like you</div>");
}

var beta2 = function()
{
    $("#b").replaceWith("<div id='b' onmouseover='beta();' onmouseout='beta2();'>- beta</div>");
}
