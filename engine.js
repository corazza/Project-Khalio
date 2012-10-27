function txt(context, text, x, y, lineHeight, fitWidth) //Thanks to Gaby aka G. Petrioli from Stack Overflow 
{
    fitWidth = fitWidth || 0;
    
    if (fitWidth <= 0)
    {
        context.fillText( text, x, y );
        return;
    }
	
    var words = text.split(' ');
    var currentLine = 0;
    var idx = 1;
	
    while (words.length > 0 && idx <= words.length)
    {
        var str = words.slice(0,idx).join(' ');
        var w = context.measureText(str).width;

        if ( w > fitWidth )
        {
            if (idx==1)
            {
                idx=2;
            }

            context.fillText( words.slice(0,idx-1).join(' '), x, y + (lineHeight*currentLine) );
            currentLine++;
            words = words.splice(idx-1);
            idx = 1;
        }
        else
        {
			idx++;
		}
    }
    if  (idx > 0)
        context.fillText( words.join(' '), x, y + (lineHeight*currentLine) );
}


function setCookie(c_name, value, exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name)
			return unescape(y);

	}
}

clearC = function()
{
	console.log("Reset.");
	setCookie("score", "0", 365);
	setCookie("gpoints", "", 365);
	setCookie("perks", "", 365);
	setCookie("shown", "false", 365);
	setCookie("controls", "false", 365);
	setCookie("AIMS1", "false", 365);
	setCookie("AIMS2", "false", 365);
	setCookie("AIMS3", "false", 365);
	setCookie("AIMS4", "false", 365);
	setCookie("AIMS5", "false", 365);
	setCookie("AIMS6", "false", 365);
	setCookie("AIMS7", "false", 365);
	setCookie("AIMS8", "false", 365);
	setCookie("AIMS9", "false", 365);
	setCookie("AIMS10", "false", 365);
	setCookie("AIMS11", "false", 365);
	setCookie("first", "false", 365);
	setCookie("level", "0:0", 365);
	setCookie("prog", "", 365);
}

collide = function(rect1, rect2)
{
        if (rect1[0] + rect1[2] > rect2[0] && rect1[0] < rect2[0] + rect2[2]  && rect1[1] + rect1[3] > rect2[1] && rect1[1] < rect2[1] + rect2[3])
                return true;
        else
                return false;
}

willCollide = function(rect1, rect2, vx1, vx2, vy1, vy2)
{
	if ((rect1[0] + rect1[2] + vx1 > rect2[0] + vx2 || rect1[0] + vx1 < rect2[0] + rect2[2] + vx2) && (rect1[1] + rect1[3] + vy1 > rect2[1] + vy2 || rect1[1] + vy1 < rect2[1] + rect2[3] + vy2))
		return true;
	else
		return false;
}

flip = function(n)
{
	return Math.abs(n - 1);
}

inside = function(rect1, rect2)
{
	if (rect1[0] + rect1[2] < rect2[0] + rect2[2] && rect1[0] > rect2[0] && rect1[1] > rect2[1] && rect1[1] + rect1[3] < rect2[1] + rect2[3]) 
		return true;
	else
		return false;
}
	
function findPos(obj) 
{
	var curleft = curtop = 0;
	
	if (obj.offsetParent) 
	{
		do 
		{
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;	
		} 
		while (obj = obj.offsetParent);
	}
	return [curleft,curtop];
}

Or = function(rect1, rect2)
{
	if (rect1[0] + rect1[2] <= rect2[0] || rect1[0] >= rect2[0] + rect2[2])
		return "o";
	else if (rect1[1] + rect1[3] <= rect2[1] || rect1[1] >= rect2[1] + rect2[3])
		return "h";
	else
		return undefined;
}


var loaded = false;
var i;


var sources =
[
	"cube.png", //0
	"player_right.png", //1
	"player_left.png", //2
	"-background1.png", //3
	"portalBlue.png", //4
	"portalGreen.png", //5
	"doors.png", //6
	"doorsActive.png", //7
	"doorsDeactivated.png", //8
	"laser.png", //9
	"sensorD.png", //10
	"sensorA.png", //11
	"-background4.png", //12
	"background3.png", //13
	"-background2.png", //14
	"background5.png", //15
	"point.png", //16
	"temps/controls3_temp.png", //17
	"background6.png", //18
	"leverD.png", //19
	"leverA.png", //20
	"background7.png", //21
	"-test.png", //22
	"temps/aims.png", //23
	"background8.png", //24
	"-background9.png", //25
	"-e.png", //26
];

var positions = [];

for (i = 0; i < sources.length; i ++)
{
	if (sources[i][0] != "-")
	{
		sources[i] = "res/images/" + sources[i];
	}
	else
	{
		sources[i] = "-";
	}
}

var images = new Array();
var np = sources.length;
var nl = 0;

var cb = false;

var load = function(i)
{		
	if (sources.length == images.length)
	{
		loaded = true;
		
		if (cb)
		{
			cb();
			cb = false;
		}
	}
	if (sources[i] != undefined && sources[i][0] != "-")
	{
		images[i] = new Image();
		images[i].onload = function()
		{
			console.log(i);
			nl ++;
			load(i + 1);			
		};
		images[i].src = sources[i];	
	}
	else if (sources[i] != undefined && sources[i][0] == "-")
	{
		console.log("Discarded " + sources[i]);
		images[i] = "-";
		nl ++;
		load(i + 1);			
	}
}

var sload = function(cbb)
{
	cb = cbb;
	load(0);
}

contains = function(e, l)
{
	for (var i = 0; i < l.length; i ++)
		if (e == l[i])
			return true;
			
	return false;
}

sliceHere = function(list, i)
{
	buffOne = list.slice(0, i);
	buffTwo = list.slice(i + 1);

	return buffOne.concat(buffTwo);         
}

getLasers = function(start, end)
{
	var n = Math.abs(end[0] - start[0])/(11) - 0;

	var ret = new Array();
	
	for (i = 0; i < n; i ++)
		ret.push([start[0] + i*11, start[1]]);
		
	return ret;
}

/*playSound = function(id)
{
	var toPlay = document.getElementById(id);
	toPlay.play();
}*/

var soundSources =
[
	"ported2.wav", //0
	"-box.wav", //1
	"pw.wav", //2
	"fire.wav", //3
	"-intro_1.wav", //4
	"beep.wav", //5
	"beep2.wav", //6
	"point.wav", //7
	"-buy.wav", //8
	"-intro_1.mp3", //9
	"-intro_2.wav", //10
	"-intro_3.wav", //11
	"-intro_4.wav", //12
	"-intro_5.wav", //13
	"poweron.wav", //14
	"lever.wav", //15
	"lightson.wav", //16
	"es.wav", //17
];

var ns = 5; //The number of sounds to preload. This depends on how often the sounds need to be played, but if too big it will probably cause lond loading times.
var sounds = []; //This will be a matrix of all the sounds

for (i = 0; i < ns; i ++) //We need to have ns different copies of each sound, hence:
	sounds.push([]);

for (i = 0; i < soundSources.length; i ++)
	for (j = 0; j < ns; j ++)
		if (soundSources[i][0] != "-")
		{
			sounds[j].push(new Audio("res/sounds/" + soundSources[i]));
		}
		else
		{
			sounds[j].push("-");
			console.log("Discarded " + soundSources[i]);
		}
		
var playing = []; //This will be our play index, so we know which version has been played the last.

for (i = 0; i < soundSources.length; i ++)
	playing[i] = 0; 
	
playSound = function(id, vol) //id in the sounds[i] array., vol is a real number in the [0, 1] interval
{
	if (vol <= 1 && vol >= 0)
		sounds[playing[id]][id].volume = vol;
	else
		sounds[playing[id]][id].volume = 1;
		
	sounds[playing[id]][id].play();
	++ playing[id]; //Each time a sound is played, increment this so the next time that sound needs to be played, we play a different version of it,
	
	if (playing[id] >= ns)
		playing[id] = 0;
}

var played = [];

playIntro = function(id)
{	
	if (!contains(id, played))
	{
		if (window.chrome) 
			sounds[id].load();
			
		sounds[id].play();

		played.push(id);
	}
}
