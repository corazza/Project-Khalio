//CLEAR THE LOADING!


var Game = function (canvas, perks) 
{
	
	//"use strict";
	
	//<init>
	var self = this;
	self.context = canvas.getContext("2d");
	self.CO = findPos(canvas);
	
	//<settings>
		self.wallc = "#888"; //The color of walls.
		self.metc = "#2E1D1A"; //The color of walls.
		self.walkc = "rgba(150,150,120,0.7)"; //The color of the wall you can shoot portals through.
		self.dlc = "rgba(33,200,250,0.4)"; //The color of the wall you can go through, but portals can't.
		self.mirc = "rgba(150,150,200,0.3)";
		self.outc = "#888"; //The color of the four outer walls.
		self.wallT = 12; //Wall thickness.
		self.PSpeed = 4.5; //Player speed.
		self.PForce = 30;
		self.JPSpeed = 15*0.8*0.7; //Jump speed. This is added to the player's Y speed (actually, it's substracted).
		self.grav = 0.8*0.8*0.7; //Gravity.
		self.f = 0.7; //Friction.
		self.armLength = 43*0.8*0.7; //The length of arms.
		self.shotSpeed = 3; //The speed of the portal projectiles.
		self.TV = 15; //Terminal velocity. This is the maximum velocity you can travel at.
		self.lastPorted = 100; //You can be ported for the next <lastPorted> seconds after being ported.
		self.portalSize = 130*0.8*0.7; //The size of portals. This is either width or height, depending on their orientation, so it can be called "length" of portals.
		self.portalMult = 1; //Your velocities are multiplied by this upon exiting a portal.
		self.bgm = "http://www.youtube.com/embed/VVGb7JU4TSU"; //The background music.
		self.endText = "Thanks for playing, but this isn't the end! New rooms will be released, and the story (which might seem nonexistent to you now) will progress.";
		self.pauseL = 1000;
		self.bsp = [150, 150];
		self.bs = [190, 60];
		self.wallM = 4; //Wall margin, space between the darker and the lighter part of the wall, used for rendering
		self.SM = 7; //Shadow margin, shadow's distantance from the object
		self.PW = 5; //Portal width
		self.OFR = 0.9; //Object friction 
		self.PFR = 0.85; //Player friction 
		self.SCT = 400; //Sensor cool time, in milliseconds
		self.DCT = 400; //Door cool time, in milliseconds
		self.mesM = 5; //The message margin
		self.mesH = 25; //The message height
		self.mesF = 12; //The message font
		
	//</settings>

	self.rel = false;
	self.CA = 1; //Control alpha
	self.perks = false; //True while buying perks
	self.sw = true;
	self.mouse = [0, 0]; //Always has the mouse's relative position
	self.paused = false; //True when pasued
	self.dg = false;
	self.pd = 0; //The previous door
	self.lights = self.context.createLinearGradient(0, 0, 0, 80); //This is rendered while !self.places["power"]
	self.lights.addColorStop(0, "rgba(0, 0, 0, 0.7)");
	self.lights.addColorStop(1, "rgba(0, 0, 0, 0)");
	self.CT = new Date().getTime(); //Used for FPS calculation
	self.FPS = 60; //Only used for the FPS average
	self.reset = false;
	
	if (getCookie("prog") && getCookie("prog") != "")
	{
		self.places = JSON.parse(getCookie("prog"));
	}
	else
	{
		self.places = 
		{
			"power": false,
			"engines": false,
			"sur": false,
			"wep": false,
			"MFC": false
		};
	}
	
	self.pm = 
	[
		"none",
		"power",
		"engines",
		"sur",
		"wep",
		"MFC"
	];
	
	self.portals = [];
	self.walls = [];
	self.objects = [];
	self.levels = [];
	self.phyobs = []; //Easy access to anything that is affected by forces and has mass
	self.doors = [];
	self.shots = [];
	self.lasers = [];
	self.sensors = [];
	self.points = [];
	self.buttons = [];
	self.levers = [];
	//</init>
	
	

	self.messages =	[];

	//<func "classes">
	self.Mes = function(img, n, s, text)
	{
		if (getCookie(n) == "shown")
			return;
			
		var m = this;
		
		m.img = img;
		m.n = n;
		m.s = s;
		m.t = text;
		
		if (n != "controls")
		{
			m.CA = 0;
			
			m.HA = setInterval(function()
			{
				if (m.CA <= 1 - 1/20)
					m.CA += 1/20;
			}, 12.5);
			
			setTimeout(function()
			{
				m.CA = 1;			
				clearInterval(m.HA);
			}, 250);
		}
		else
		{
			m.CA = 0.5;
		}
		
		m.dim = function()
		{
			m.LA = setInterval(function() //Low alpha
			{
				if (m.CA >= 1/20)
					m.CA -= 1/20;
			}, 12.5);
			
			setTimeout(function()
			{
				m.s = "shown";
				setCookie(m.n, "shown", 5);
				clearInterval(m.LA);
				
				for (var i = 0; i < self.messages.length; i ++)
					if (self.messages[i] == m)
						self.messages = sliceHere(self.messages, i);
						
			}, 250);
		}
		
		if (m.s != "shown")
			self.messages.push(m);
	}
			
	self.Button = function(oC, text, levels, level)
	{
		var b = this;
		
		b.oC = oC;		
		b.text = text;
		b.levels = levels;
		
		if (level && level != "one")
			b.level = level;
		else if (level != "one")
			b.level = 0;
		else
			b.level = "one";
			
		if (level == levels.length)
			b.max = true;
		else
			b.max = false;
	}
	
	self.Level = function(n, wc, walls, objects, w, h, doors, init, sp, bg, gun, i, j)
	{
		var l = this;
		
		l.n = n;
		
		if (l.n != "end")
		{
			l.walls = walls;
			l.objects = objects;
			l.doors = doors;
			l.w = w;
			l.h = h;
			l.init = init;
			l.sp = sp;
			l.bg = bg;
			l.gun = gun;
			l.wc = wc;
			l.s = sp.s;
			l.id = [i, j];
			
			l.walls.push([[0, 0, l.w, self.wallT], l.wc, function(){}]);
			l.walls.push([[0, l.h - self.wallT, l.w, self.wallT], l.wc, function(){}]);
			l.walls.push([[0, 0, self.wallT, l.h], l.wc, function(){}]);
			l.walls.push([[l.w - self.wallT, 0, self.wallT, l.h], l.wc, function(){}]);
		}
	}

	self.Phy = function(m, o, e)
	{
		var p = this;
		
		p.m = m;
		p.o = o;
		p.e = 0.5; //elasticity
		p.fr = 0.9 ; //friction
		
		p.vx = 0;
		p.vy = 0;
		p.ax = 0;
		p.ay = 0;
		p.forces = [];
		p.names = [];
		p.lastPorted = 0;
		
		p.addForce = function(x, y, name)
		{
			p.forces.push([x, y]);
			p.names.push(name);
		}
		
		p.removeForce = function(name)
		{
			for (var i = 0; i < p.forces.length; i ++)
				if (p.names[i] == name)
				{
					p.forces = sliceHere(p.forces, i);
					p.names = sliceHere(p.names, i);
				}
		}
		
		p.hasForce = function(name)
		{
			for (var i = 0; i < p.forces.length; i ++)
				if (p.names[i] == name)
					return true;

			return false;
		}
		
		 
		p.addForce(0, p.m*self.grav, "grav");		
		
		self.mult = -1;
		
		p.allForces = function()
		{
			var result = [0, 0];
			
			for (f = 0; f < p.forces.length; f ++)
			{
				result[0] += p.forces[f][0];
				result[1] += p.forces[f][1];
			}
			
			return result;
		}
		
		p.calc = function()
		{
			var result = p.allForces();
			
			p.vx += result[0]/p.m;
			p.vy += result[1]/p.m;
		}
		
		self.phyobs.push(p);
	}	
	//</func "classes">

	//<func functions>
	self.onClick = function(e)
	{
		self.reset = false;
		document.getElementById("res").setAttribute("class", "topMenu");
		document.getElementById("res").innerHTML = "New game";

		if (!self.player.holding.held && !self.paused && self.player.gun && !self.perks && self.messages.length == 0)
		{
			var pos = [self.player.getRect()[0] + self.player.getRect()[2]/2, self.player.getRect()[1] + 28];

			var a = pos[0] - self.player.handend[0]; 
			var b = pos[1] - self.player.handend[1]; 
			var c = Math.sqrt(a*a + b*b);

			var rat = self.shotSpeed/c;

			var vx = -a*rat*self.shotSpeed;
			var vy = -b*rat*self.shotSpeed;
		
			if (e.button == 0)
				var color = "blue";
			else if(e.button == 2)
				var color = "green";
			
			var pos = [self.player.getRect()[0] + self.player.getRect()[2]/2 - 5.5, self.player.getRect()[1] + 28 - 5.5]; //Sad je na pocetku ruke, ali gornjelijevim kuten, centar treba bit
			
			
			new self.Shot(vx, vy, color, pos);
		}
		else if (self.perks && self.messages.length == 0)
		{
			var offset = [0, 0];
			
			for (var i = 0; i < self.buttons.length; i ++)
			{
				if (collide([self.mouse[0], self.mouse[1], 1, 1], [self.bsp[0] + offset[0], self.bsp[1] + offset[1], self.bs[0], self.bs[1]]) && !self.buttons[i].max)
				{
					if (self.buttons[i].level != "one")
					{
						if (self.player.score >= self.buttons[i].levels[self.buttons[i].level])
						{
							playSound(8);
							self.buttons[i].oC();
							self.player.score -= self.buttons[i].levels[self.buttons[i].level];
							
							setCookie("score", self.player.score, 365);
							
							++ self.buttons[i].level;
							
							if (self.buttons[i].level == self.buttons[i].levels.length)
								self.buttons[i].max = true;
							
							self.savePerks();
						}
					}
					else if (self.player.score >= self.buttons[i].levels[0])
					{
						playSound(8);
						self.buttons[i].oC();
						self.player.score -= 1;
						
						setCookie("score", self.player.score, 365);
					}
				}

				offset[1] += 68;
			}
		}
		else if (self.messages.length != 0 && !self.paused)
		{
			for (var i = 0; i < self.messages.length; i ++)
				if (self.messages[i].s != "shown" && self.messages[i].LA == undefined)
					self.messages[i].dim();
		}
		else if (self.paused)
			pause() //This actually unpauses the game, using the same PAUSE BUTTON
	}

	self.makeLevel = function(level, ii, jj)
	{
		level = JSON.parse(level);

		if (level.n == "end")
		{
			self.levels[ii].push(level);
			return;
		}
		
		var walls = [];
		var objects = [];
		var doors = [];
		var init = self.standard;
		var sp = {"lasers": [], "points": [], "sensors": [], "s": level.s, "levers": [], "mes":level.mes, "shine":level.shine};
		var i;
				
		for (i = 0; i < level.walls.length; i ++)
			walls.push([level.walls[i].rect.slice(), level.walls[i].color, level.walls[i].o, function(){}]);

		for (i = 0; i < level.objects.length; i ++)
		{
			if (level.objects[i].n == "box")
				objects.push([level.objects[i].img, level.objects[i].pos.slice(), function(){}, 70]);

			if (level.objects[i].n == "lasers")
				sp.lasers.push(level.objects[i].pos.slice());
			
			if (level.objects[i].n == "zone")
				doors.push([level.objects[i].pos.slice(), level.objects[i].zone, "zone"]);
			
			if (level.objects[i].n == "entranced")
			{			
				if (jj == 0 && ii == 0)
					doors.push([level.objects[i].pos.slice(), [ii, jj], "back"]);
				else if (jj == 0)
					doors.push([level.objects[i].pos.slice(), [0, 6], "back"]);
				else
					doors.push([level.objects[i].pos.slice(), [ii, jj - 1], "back"]);					
			}
			
			if (level.objects[i].n == "exitd")
				doors.push([level.objects[i].pos.slice(), [ii, jj + 1], "forth"]);

			if (level.objects[i].n == "spec")
				doors.push([level.objects[i].pos.slice(), [ii, jj + 1], "spec"]);

			if (level.objects[i].n == "ze")
				doors.push([level.objects[i].pos.slice(), [0, 6], "ze"]); //This is a zone exit door, it's always on, and should be at the end of the zone. Always leads to the control room.

				
			if (level.objects[i].n == "point")
				sp.points.push([level.objects[i].pos.slice(), level.n + i]);

			if (level.objects[i].n == "sensor")
			{
				sp.sensors.push([level.objects[i].pos.slice(), 1]);
			}
			
			if (level.objects[i].n == "lever")
			{
				sp.levers.push([level.objects[i].pos.slice()]);
			}
		}
		
		self.levels[ii].push(new self.Level(level.n, level.color, walls, objects, level.w, level.h, doors, init, sp, level.bg, true, ii, jj));
	}

	self.onMove = function(e)
	{
		self.mouse[0] = e.pageX - self.CO[0];
		self.mouse[1] = e.pageY - self.CO[1];
	}

	self.oncontextmenu = function(e) 
	{
		e.preventDefault();
	};

	self.allTrue = function(ob)
	{
		ret = true;
		
		for (var x in ob)
			if (!ob[x])	
				ret = false;
				
		return ret;
	}
		
	self.pause = function(ss)
	{
		clearInterval(self.run);
		self.paused = true; 	
		$("#cd").animate({opacity:0.4}, self.pauseL);
		
		//if (ss)
			//document.getElementById("bgm").src = "";
	}
	
	self.unpause = function(rs)
	{
		self.run = setInterval(self.update, 1000/self.FFPS);
		self.paused = false;
		self.CT = new Date().getTime(); //Current time
		
		//if (rs)
		//{
		//	document.getElementById("bgm").src = self.bgm + "?autoplay=1&loop=1";
		//}
		
		$("#cd").animate({opacity:1}, self.pauseL);
	}		
	
	self.standard = function(p, c, s)
	{
		for (var i = 0; i < self.doors.length; i ++)
			if (p[0] == c[0])
			{
				if (((self.doors[i].tag == "zone" || self.doors[i].tag == "forth" || (self.doors[i].tag == "spec" && self.allTrue(self.places))) && p[1] <= c[1]) || (self.doors[i].tag == "back" && p[1] > c[1]))
					self.doors[i].a();
			}
			else
			{
				if (((self.doors[i].tag == "zone" || self.doors[i].tag == "forth" || (self.doors[i].tag == "spec" && self.allTrue(self.places))) && p[0] <= c[0]) || (((self.doors[i].tag == "spec" && self.allTrue(self.places)) || self.doors[i].tag == "back") && p[0] > c[0]))
					self.doors[i].a();
			}
	}
	
	self.savePerks = function()
	{
		var ll = [];
		
		for (var i = 0; i < self.buttons.length; i ++)
			ll.push(self.buttons[i].level);
					
		setCookie("perks", ll.join(":"), 365);
	}
	
	self.saveProg = function()
	{
		setCookie("prog", JSON.stringify(self.places), 365);
	}
	
	self.placePlayer = function(i)
	{
		var bla = i;
		
		self.player.pos = [self.doors[i].pos[0] + self.doors[i].getRect()[2]/2 - self.player.getRect()[2]/2, self.doors[i].pos[1] + self.doors[i].getRect()[3]/2 - self.player.getRect()[2]/2];
		self.doors[bla].d();
		self.da = setTimeout(self.doors[bla].a, 2000); //Doors activation
	}	

	self.checkS = function()
	{
		var will = true;
		
		for (var i = 0; i < self.sensors.length; i ++)
			if (self.sensors[i].s != "a")
				will = false;

		if (will)
			for (i = 0; i < self.doors.length; i ++)
				if (self.doors[i].tag == "forth")
					self.OD = setTimeout(self.doors[i].a, self.SCT + self.DCT);
	}
	
	self.loadLevel = function(level)
	{				
		if (level.sp.shine == "yes")
			shine(500, 500, 2000, 5);
		
		self.reset = false;
		document.getElementById("res").setAttribute("class", "topMenu");
		document.getElementById("res").innerHTML = "New game";

		setCookie("first", "false", 365);
		
		self.messages = [];
		document.getElementById("ln").innerHTML = level.n;
		
		if (self.da)
			clearTimeout(self.da);
		
		if (self.level)
		{
			self.prev = self.level.id;
			
			if (self.level.rot)
				clearInterval(self.level.rot);
			
			self.player.score += self.level.score;
			self.player.gp = self.player.gp.concat(self.level.gp);
			
			setCookie("score", self.player.score + "", 365);
			setCookie("gpoints", self.player.gp.join(":"), 365);
		}
		else
			self.prev = [0, 0];
		

		for (var i = 0; i < self.levels.length; i ++)
			for (var j = 0; j < self.levels[i].length; j ++)
				if (self.levels[i][j] == level)
					setCookie("level", [i, j].join(":"), 365);
		
		if (self.level)
			clearInterval(self.level.preping);
			
		self.drew = 0;
		
		self.player.release();
		self.rel = false;
		self.sw = true;
		self.lnig = true;
		self.offsetx = 0;
		self.player.gun = level.gun;
		self.offsety = 0;
		self.player.alive = true;
		self.bgI = level.bg;
		self.player.jumped = true;

		self.portals = [];
		self.walls = [];
		self.objects = [];
		self.phyobs = [];
		self.doors = [];
		self.shots = [];
		self.lasers = [];
		self.sensors = [];
		self.points = [];
		self.levers = [];
		
		for (i = 0; i < level.walls.length; i ++)
			self.walls.push(new self.Wall( level.walls[i][0].slice(), level.walls[i][1], level.walls[i][2], level.walls[i][3]  ));
		
		for (i = 0; i < level.objects.length; i ++)
			self.objects.push(new self.Objekt( level.objects[i][0], level.objects[i][1].slice(), level.objects[i][2], level.objects[i][3]  ));
		
		for (i = 0; i < level.doors.length; i ++)
			self.doors.push(new self.Door( level.doors[i][0].slice(), level.doors[i][1], level.doors[i][2]));

		if (level.sp.lasers)
			for (i = 0; i < level.sp.lasers.length; i ++)
				self.lasers.push(new self.Laser(level.sp.lasers[i].slice()));
		
		if (level.sp.sensors)
			for (i = 0; i < level.sp.sensors.length; i ++)
				self.sensors.push(new self.Sensor(level.sp.sensors[i][0].slice(), level.sp.sensors[i][1]));
				
		if (level.sp.points)
			for (i = 0; i < level.sp.points.length; i ++)
				self.points.push(new self.Point(level.sp.points[i].slice()[0].slice(), level.sp.points[i].slice()[1]));		
		
		if (level.sp.levers)
			for (i = 0; i < level.sp.levers.length ; i ++)
				self.levers.push(   new self.Lever(level.sp.levers[i].slice()[0].slice(), self.pm[level.id[0]])    );
			
		for (i = 0; i < self.points.length; i ++)
			for (var j = 0; j < self.player.gp.length; j ++)
				if (self.points[i].id == self.player.gp[j])
				{
					self.points = sliceHere(self.points, i);
					i --;
					break;
				}
		
			
		self.level = level;
		
		//document.getElementById("lc").value = self.level.c;
				
		self.portals = [];
		self.shots = [];
		
		self.player.phy.vx = 0;
		self.player.phy.vy = 0;

		for (i = 0; i < self.doors.length; i ++)
		{
			if (self.doors[i].tag != "spec")
				self.doors[i].a();
			else if (self.allTrue(self.places))
				self.doors[i].a();
			else
				self.doors[i].d();
		}
			
		var found = false;
		
		if (self.prev[0] > self.level.id[0])
		{			
			for (i = 0; i < self.doors.length; i ++)
			{
				if (self.doors[i].level == self.prev[0])
				{
					self.placePlayer(i);
					found = true;
				}
			}
		}

		if (!found)
			for (i = 0; i < self.doors.length; i ++)
				if (self.prev[0] == self.level.id[0])
				{
					if ((self.prev[1] > self.level.id[1] && (self.doors[i].tag == "forth" || self.doors[i].tag == "spec")) || (self.prev[1] < self.level.id[1] && self.doors[i].tag == "back"))
					{
						self.placePlayer(i);//self.player.pos = [self.doors[i].pos[0] + self.doors[i].getRect()[2]/2, self.doors[i].pos[1]];
						found = true;
					}
				}
				else
				{
					if ((self.prev[0] > self.level.id[0] && self.doors[i].tag == "zone") || (self.prev[0] < self.level.id[0] && self.doors[i].tag == "back"))
					{
						self.placePlayer(i);//self.player.pos = [self.doors[i].pos[0] + self.doors[i].getRect()[2]/2, self.doors[i].pos[1]];				
						found = true;
					}
				}
		
		if (!found)
			for (i = 0; i < self.doors.length; i ++)
				if (self.doors[i].tag == "back")
					self.placePlayer(i);//self.player.pos = [self.doors[i].pos[0] + self.doors[i].getRect()[2]/2, self.doors[i].pos[1]];
		

		/*self.level.preping = setTimeout(function()
		{			
			if (self.prev[0] == self.level.id[0])
			{
				for (i = 0; i < self.doors.length; i ++)
					if ((self.doors[i].tag == "back" && self.prev[1] <= self.level.id[1]) || ((self.doors[i].tag == "forth" || self.doors[i].tag == "spec" || self.doors[i].tag == "zone") && self.prev[1] > self.level.id[1]))
						self.doors[i].a();
			}
			else
			{
				for (i = 0; i < self.doors.length; i ++)
					if ((self.doors[i].tag == "back" && self.prev[0] <= self.level.id[0]) || (self.doors[i].tag == "zone" && self.prev[0] > self.level.id[0]))
						self.doors[i].a();				
			}

			if (self.sensors.length != 0)
				for (i = 0; i < self.doors.length; i ++)
					if (self.doors[i].tag == "forth")
						self.doors[i].d();
		}, 5000);*/

		//self.level.init(self.prev, self.level.id, self.level.sp.s);
		
		self.level.score = 0;
		self.level.gp = [];
		
		if (self.points)
		{
			self.level.rot = setInterval(function()
			{
				for (var i = 0; i < self.points.length; i ++)
					++ self.points[i].degree;
			}, 100);
		}
		
		if (self.sensors.length != 0)
			for (i = 0; i < self.doors.length; i ++)
				if (self.doors[i].tag == "forth")
					self.doors[i].d();
		
		self.phyobs.push(self.player.phy);

		if (self.level.sp.mes)
			new self.Mes(self.level.sp.mes.img, self.level.sp.mes.n, false, self.level.sp.mes.text);
	}

	//<new physics>
	self.isOb = function(ob)
	{
		if (ob instanceof self.Objekt || ob instanceof self.Player)//(ob instanceof self.Point || ob instanceof self.Wall || ob instanceof self.Laser || ob instanceof self.Lever || ob instanceof self.Door || ob instanceof self.Sensor)
			return true;
		else
			return false;
	}
	
	self.OW = function(ob1, ob2) //Object to wall, first argument is always an object, and the second one is always a wall
	{
		ob1.flags.col = true;
		
		if (ob2.style == "rgba(33,200,250,0.4)")
			return;
		else if (ob2.style == "rgba(150,15,150,0.3)")
		{
			ob1.flags.colrg = true;
			
			if (ob1.phy.hasForce("grav"))
			{
				ob1.phy.removeForce("grav");
				ob1.flags.RG = true; //Removed gravity
			}
			
			return;
		}
		
		
		var or = Or(ob1.getRect().slice(), ob2.getRect().slice());

		if (or == "o")
		{			
			var sp = Math.abs(ob1.phy.vx);
			
			if (sp > 6)
				playSound(2, sp/self.TV);

			ob1.phy.vx = -ob1.phy.vx*ob1.phy.e;
			ob1.phy.vy = ob1.phy.vy*ob1.phy.fr;
			
			if (ob1.pos[0] < ob2.getRect()[0])
				ob1.pos[0] = ob2.getRect()[0] - ob1.getRect()[2] - ob1.phy.vx - 1; //+ ob1.phy.vx;
			else
				ob1.pos[0] = ob2.getRect()[0] + ob2.getRect()[2] - ob1.phy.vx + 1; //+ ob1.phy.vx;

		}
		else
		{
			var sp = Math.abs(ob1.phy.vy);
			
			if (sp > 4)
				playSound(2, sp/self.TV);

			if (ob1 == self.player && ob1.pos[1] < ob2.getRect()[1])
				self.player.jumped = false;

			ob1.phy.vy = -ob1.phy.vy*ob1.phy.e;
			
			if (ob1 != self.player || (!input.right && !input.left))
				ob1.phy.vx = ob1.phy.vx*ob1.phy.fr;
			
			if (ob1.pos[1] < ob2.getRect()[1])
				ob1.pos[1] = ob2.getRect()[1] - ob1.getRect()[3] + ob1.phy.vy;
			else
				ob1.pos[1] = ob2.getRect()[1] + ob2.getRect()[3] + ob1.phy.vy;
		}
		
		if (Math.abs(ob1.phy.vy) < 0.01)
		{
			ob1.phy.vy = 0;
		}
		
		if (Math.abs(ob1.phy.vx) < 0.5)
		{
			ob1.phy.vx = 0;
		}
	}
	
	self.port = function(ob1, ob2) //First argument is always an object, and the second argument is always a portal
	{
		playSound(0);	
		
		for (var i = 0; i < self.portals.length; i ++)
			if (self.portals[i] == ob2)
				break;
				
		var j = flip(i);
		
		//i, j: i is ob2, the entrance portal, and j is the exit portal
		
		var p1 = self.portals[i]; //The entrance portal
		var p2 = self.portals[j]; //The exit portal
		
		ob1.phy.lastPorted = new Date().getTime();
				
		if (p2.o == "down")
			ob1.pos = [p2.rect[0] + p2.rect[2]/2 - ob1.getRect()[2]/2, p2.rect[1] - p2.rect[3] - ob1.getRect()[3] - 1];				
		if (p2.o == "top")
			ob1.pos = [p2.rect[0] + p2.rect[2]/2 - ob1.getRect()[2]/2, p2.rect[1] + p2.rect[3] + 1];	
		if (p2.o == "right")
			ob1.pos = [p2.rect[0] - p2.rect[2] - ob1.getRect()[2] - 1, p2.rect[1] + p2.rect[3]/2 - ob1.getRect()[3]/2];		
		if (p2.o == "left")
			ob1.pos = [p2.rect[0] + p2.rect[2] + 1, p2.rect[1] + p2.rect[3]/2 - ob1.getRect()[3]/2];						


		if (ob1 == self.player)
		{
			self.player.release();
			
			input =
			{
				right: false,
				up: false,
				left: false,
				down: false,
				e: false,
				z: false,
				one: false,
				ctrl: false,
				plus: false,
				minus: false,
				shift: false,
			};

			self.player.j ++;
			self.player.handend = self.player.getHandend(self.armlength);
		}
		
		//I don't need to worry about:
			// top down
			// left right
			// down top
			// right left
			
		if (p1.o == "top" && p2.o == "top")
		{
			ob1.phy.vy *= -1;
		}

		if (p1.o == "down" && p2.o == "down")
		{
			ob1.phy.vy *= -1;
		}
		
		if (p1.o == "right" && p2.o == "right")
		{
			ob1.phy.vx *= -1;
		}		

		if (p1.o == "left" && p2.o == "left")
		{
			ob1.phy.vx *= -1;
		}		
				
		if (p1.o == "top" && p2.o == "right")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = vy;
			ob1.phy.vy = -vx;
		}		
		if (p2.o == "top" && p1.o == "right")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = -vy;
			ob1.phy.vy = vx;
		}		
				
		if (p1.o == "right" && p2.o == "down")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = vy;
			ob1.phy.vy = -vx;
		}
		if (p2.o == "right" && p1.o == "down")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = -vy;
			ob1.phy.vy = vx;
		}

		if (p1.o == "down" && p2.o == "left")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = vy;
			ob1.phy.vy = -vx;
		}		
		if (p2.o == "down" && p1.o == "left")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = -vy;
			ob1.phy.vy = vx;
		}		

		if (p1.o == "left" && p2.o == "top")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = vy;
			ob1.phy.vy = -vx;
		}		
		if (p2.o == "left" && p1.o == "top")
		{
			var vy = ob1.phy.vy;
			var vx = ob1.phy.vx;
			
			ob1.phy.vx = -vy;
			ob1.phy.vy = vx;
		}
	}
	
	self.collision = function(ob1, ob2)
	{		
		ob1.flags.col = true;
		ob2.flags.col = true;
		
		//<object specific collisions>	
		if (ob1 instanceof self.Sensor && self.isOb(ob2))
			ob1.c = true;
			
		if (ob2 instanceof self.Sensor && self.isOb(ob1))
			ob2.c = true;

			
		if(ob2 instanceof self.Sensor && ob1 instanceof self.Objekt && self.level.id[0] == 0 && self.level.id[1] == 2)
		{
			self.addMes("The doors are activated.", ob2, 10);
		}

		if (ob1 instanceof self.Sensor && ob2 instanceof self.Objekt && self.level.id[0] == 0 && self.level.id[1] == 2)
		{
			self.addMes("The doors are activated.", ob1, 10);
		}

		if (ob1 instanceof self.Sensor && ob2 == self.player && self.level.id[0] == 0 && self.level.id[1] == 2)
		{
			self.addMes("Box goes here.", ob1, 10);
		}

		if (ob2 instanceof self.Sensor && ob1 == self.player && self.level.id[0] == 0 && self.level.id[1] == 2)
		{
			self.addMes("Box goes here.", ob2, 10);
		}

		if (ob1 instanceof self.Objekt && ob2 == self.player && self.level.id[0] == 0 && self.level.id[1] == 2)
		{
			self.addMes("E", ob2);
		}

		if (ob2 instanceof self.Objekt && ob1 == self.player && self.level.id[0] == 0 && self.level.id[1] == 2)
		{
			self.addMes("E", ob1);
		}
		
			
		if (ob1.held && self.willDrop(ob2)) //(ob2 instanceof self.Wall || ob2 instanceof self.Objekt || ob2 instanceof self.Laser || ob2 instanceof self.Portal))
		{
			self.player.release();
		}
		
		if (ob2.held && self.willDrop(ob1)) //(ob1 instanceof self.Wall || ob1 instanceof self.Objekt || ob1 instanceof self.Laser || ob1 instanceof self.Portal))
		{
			self.player.release();	
		}
		
		if (self.isOb(ob1) && ob1.alive && ob2 instanceof self.Laser)
		{
			playSound(3);
			ob1.alive = false;
			setTimeout(ob1.die, 150)
		}

		if (self.isOb(ob2) && ob2.alive && ob1 instanceof self.Laser)
		{
			playSound(3);
			ob2.alive = false;
			setTimeout(ob2.die, 150)
		}
		
		if ((ob1 == self.player || ob2 == self.player) && (ob1 instanceof self.Lever || ob2 instanceof self.Lever))
		{
			if (input.e)
			{
			}
			else if ((ob1 instanceof self.Lever && ob1.s == "d") || (ob2 instanceof self.Lever && ob2.s == "d"))
			{
				self.addMes("E");
			}
		}

		if (!(ob1.held || ob2.held))
		{
			if ((ob1 == self.player && ob2 instanceof self.Point) || (ob2 == self.player && ob1 instanceof self.Point))
			{
				playSound(7);
				
				++ self.level.score;
				
				if (ob1 instanceof self.Point)
					self.level.gp.push(ob1.id);
				else
					self.level.gp.push(ob2.id);
				
				for (var k = 0; k < self.points.length; k ++)
					if (ob1 == self.points[k] || ob2 == self.points[k])
						self.points = sliceHere (self.points, k);
			}
						
			if (self.isOb(ob1) && ob2 instanceof self.Portal && self.portals.length == 2 && ob1.phy.lastPorted + self.lastPorted < new Date().getTime())
				self.port(ob1, ob2);
			
			if (self.isOb(ob2) && ob1 instanceof self.Portal && self.portals.length == 2 && ob2.phy.lastPorted + self.lastPorted < new Date().getTime())
				self.port(ob2, ob1);
			//</object specific collisions>
		
			//<physics>
			if ((self.isOb(ob1) && ob2 instanceof self.Wall)) //If the first one is an object and the second one is a wall
			{
				self.OW(ob1, ob2);
			}
			else if ((self.isOb(ob2) && ob1 instanceof self.Wall)) //If the first one is a wall and the second one is an object
			{
				self.OW(ob2, ob1);		
			}
			else if (self.isOb(ob1) && self.isOb(ob2)) //If both are objects
			{
				if (ob1 == self.player || ob2 == self.player)
					self.player.jumped = false;
			}
			//</physics>
		}
	}
	//</new physics>
	
	self.posit = function()
	{
		for (var i = 0; i < self.all.length; i ++)
			if (self.all[i].phy && !self.all[i].held && !self.all[i].col)
			{
				if (self.all[i].phy.vx > self.TV)
					self.all[i].phy.vx = self.TV

				if (self.all[i].phy.vy > self.TV)
					self.all[i].phy.vy = self.TV
					
				//if (self.all[i].phy.vy < 0.01)
					//self.all[i].phy.vy = 0;

				if (Math.abs(self.all[i].phy.vx) < 0.5)
					self.all[i].phy.vx = 0;
				
				self.all[i].pos[0] += self.all[i].phy.vx;
				self.all[i].pos[1] += self.all[i].phy.vy;
			}
	}

    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
    
	self.draw = function()
	{   
	    window.requestAnimFrame(self.draw, canvas);   
	    
		self.context.fillStyle = "#000";
		self.context.fillRect(0, 0, canvas.width, canvas.height);	
		
		self.context.drawImage(images[self.bgI], 0, 0);

		if (self.level.id[0] == 0 && self.level.id[1] == 6)
		{
			var yc = 237;
			var xc = 181; //+ 70 
			
			for (x in self.places)
			{
				if (self.places[x])
				{
					self.context.fillStyle = "rgba(51, 255, 52, 0.3)";
				}
				else
				{
					self.context.fillStyle = "rgba(255, 63, 63, 0.3)";
				}
				
				self.context.fillRect(xc, yc - 20, 52, 20);
				
				self.context.fillStyle = "#111";
				self.context.font = "8pt Helvetica";
				t = x.slice();
				t = t.toUpperCase();
				
				var w = self.context.measureText(t).width;
				
				self.context.fillText(t, xc + 26 - w/2, yc - 5);		
				
				xc += 70;
			}
			
			for (i = 0; i < self.doors.length; i ++)
				if (self.doors[i].tag == "spec")
				{
					if (self.allTrue(self.places))
					{
						self.context.fillStyle = "rgba(51, 255, 52, 0.3)";
					}
					else
					{
						self.context.fillStyle = "rgba(255, 63, 63, 0.3)";
					}
					
					xc = self.doors[i].pos[0];
					yc = self.doors[i].pos[1];
					
					self.context.fillRect(xc, yc - 20, 51, 20);

					self.context.fillStyle = "#111";
					self.context.font = "8pt Helvetica";
					t = "EXIT";

					var w = self.context.measureText(t).width;
					
					self.context.fillText(t, xc + 26 - w/2, yc - 5);		
				}
		}

		for (m = 0; m < self.shots.length; m ++)
			self.shots[m].manage();
			
		
		if (self.all)		
		for (i = 0; i < self.all.length; i ++)
		{
			if ((self.all[i] == self.player || self.all[i] instanceof self.Objekt || self.all[i] instanceof self.Lever || self.all[i] instanceof self.Sensor || self.all[i] instanceof self.Door) && self.places["power"])
			{
				self.context.fillStyle = "rgba(0, 0, 0, 0.2)";
				self.context.fillRect();
				self.context.fillRect(self.all[i].getRect()[0] - self.SM, self.all[i].getRect()[1] + self.SM, self.all[i].getRect()[2], self.all[i].getRect()[3] - self.SM);				
			}
			
			if (self.all[i].alive == undefined || self.all[i].alive)
			{
				self.all[i].draw();
			}
			else
			{
				self.all[i].draw();
				self.context.fillStyle = "rgba(250,50,50,0.5)";
				self.context.fillRect(self.all[i].getRect()[0], self.all[i].getRect()[1], self.all[i].getRect()[2], self.all[i].getRect()[3]);				
			}			
			
			if (self.all[i] == self.player)
			{
				self.player.drawArm();
			}
		}
		
		if (!self.places["power"])
		{
			self.context.fillStyle = self.lights;
			self.context.fillRect(0, -20, canvas.width, 120);
		}

		if (self.dg && self.player.sgs != 1)
		{
			self.context.fillStyle = "rgba(40,40,40,0.5)";
			self.context.fillRect(canvas.width - 80, canvas.height - 80, 40, 40);
		}
		
		if (!self.perks)
		{
			self.context.font="24pt Helvetica";
			
			self.context.fillStyle = "#111";
			self.context.fillText(self.player.score + "", self.wallT*2, canvas.height - self.wallT*2);

			if (self.level.score != 0)
			{
				self.context.fillStyle = "#331";
				self.context.fillText("+" + self.level.score, self.wallT*2 + self.context.measureText(self.player.score + "").width + 7, canvas.height - self.wallT*2);
			}
		}
		else
		{
			self.context.fillStyle = "rgba(20,20,20,0.6)";
			self.context.fillRect(0, 0, canvas.width, canvas.height);	

			self.context.fillStyle = "#EEA";
			self.context.font = "40pt Helvetica";
			self.context.fillText("Score: " + self.player.score + "", canvas.width/2 - self.context.measureText("Score: " + self.player.score + "").width/2, 70);		
		
			var offset = [0, 0];			
			self.context.font = "15pt Helvetica";

			for (var i = 0; i < self.buttons.length; i ++)
			{
				self.context.fillStyle = "#212121";
				self.context.fillRect(self.bsp[0] + offset[0], self.bsp[1] + offset[1], self.bs[0], self.bs[1]);

				if (collide([self.mouse[0], self.mouse[1], 1, 1], [self.bsp[0] + offset[0], self.bsp[1] + offset[1], self.bs[0], self.bs[1]]))
				{
					self.context.fillStyle = "rgba(255,255,0,0.05)";
					self.context.fillRect(self.bsp[0] + offset[0], self.bsp[1] + offset[1], self.bs[0], self.bs[1]);
				}

				self.context.fillStyle = "#CCC";

				self.context.font = 12 + "pt Helvetica";
				
				if (self.buttons[i].level != "one")
					self.context.fillText(self.buttons[i].text + " L" + self.buttons[i].level, self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 20);
				else
					self.context.fillText(self.buttons[i].text, self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 20);
				
				self.context.font = 8 + "pt Helvetica";
				
				if (!self.buttons[i].max && self.buttons[i].level != "one")
				{
					if (self.buttons[i].levels[self.buttons[i].level] != 1)
						self.context.fillText("Costs: " + self.buttons[i].levels[self.buttons[i].level] + " points.", 4 + self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 52);
					else
						self.context.fillText("Costs: " + self.buttons[i].levels[self.buttons[i].level] + " point.", 4 + self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 52);
				}
				else if (self.buttons[i].level != "one")
					self.context.fillText("Max.", 4 + self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 52);
				else
				{
					if (self.buttons[i].levels[0] != 1)
						self.context.fillText("Costs: " + self.buttons[i].levels[0] + " points.", 4 + self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 52);
					else
						self.context.fillText("Costs: " + self.buttons[i].levels[0] + " point.", 4 + self.bsp[0] + offset[0] + 4, self.bsp[1] + offset[1] + 52);					
				}
					
				offset[1] += 68;
			}
		}	

		for (var i = 0; i < self.messages.length; i ++) //Draw all the messages.
			if (self.messages[i].s != "shown")
			{
				self.context.globalAlpha = self.messages[i].CA;
				self.context.drawImage(images[self.messages[i].img], canvas.width/2 - images[self.messages[i].img].width/2, canvas.height/2 - images[self.messages[i].img].height/2);
				
				if (self.messages[i].t)
				{
					self.context.fillStyle = "#111";
					self.context.font = "8pt Monospace";
					
					//txt(self.context, self.messages[i].t, canvas.width/2 - images[self.messages[i].img].width/2 + 100, canvas.height/2 - images[self.messages[i].img].height/2, 15, 400);
					txt(self.context, self.messages[i].t, canvas.width/2 - images[self.messages[i].img].width/2 + 10, canvas.height/2 - images[self.messages[i].img].height/2 + 50, 15, 490);
				}
				
				self.context.globalAlpha = 1;
			}
	}
	
	self.addMes = function(text, ob, ho)
	{
		if (ob == undefined)
			ob = self.player;
			
		if (ho == undefined)
			ho = 0;
			
		self.all.push(
		{
			"draw":function()
			{
				self.context.font = self.mesF + "pt Helvetica";

				var w = self.context.measureText(text).width;

				self.context.fillStyle = "#444";
				self.context.fillRect(ob.pos[0] + ob.getRect()[2]/2 - w/2 - 1 - self.mesM, ob.pos[1] - self.mesH - self.mesM - 1 - ho, w + 2 + self.mesM*2, self.mesF + self.mesM*2 + 2);
				
				self.context.fillStyle = "#DDD";
				self.context.fillRect(ob.pos[0] + ob.getRect()[2]/2 - w/2 - self.mesM, ob.pos[1] - self.mesH - self.mesM - ho, w + self.mesM*2, self.mesF + self.mesM*2);
			
				self.context.fillStyle = "#222";
				self.context.fillText(text, ob.pos[0] + ob.getRect()[2]/2 - w/2, ob.pos[1] - self.mesH + self.mesF - ho);
			},
			"flags":[]
		});
	}
	
	self.logic = function()
	{		
		for (var i = 0; i < self.sensors.length; i++)
			self.sensors[i].c = false;
			
		for (i = 0; i < self.doors.length; i ++)
		{
			if (collide(self.player.getRect(), self.doors[i].getRect()) && self.doors[i].state == "a" && input.e)
			{
				self.doors[i].activate();
			}
			else if (collide(self.player.getRect(), self.doors[i].getRect()) && self.doors[i].state == "a")
			{
				self.addMes("E");
			}
		}
			
		for (var i = 0; i < self.all.length; i ++)
		{
			if (self.all[i].getRect == undefined)
				continue;
			
			if (self.all[i].phy && !self.all[i].held)
				self.all[i].phy.calc();
			
			if (self.all[i].held)
			{
				if (self.player.side == "left")
				{
					self.all[i].pos = [self.player.pos[0] - self.player.holding.getRect()[2] - 12, self.player.pos[1] + 8];							
				}
				else
				{
					self.all[i].pos = [self.player.pos[0] + self.player.getRect()[2] + 12, self.player.pos[1] + 8];							
				}
			}
				
			for (var j = i + 1; j < self.all.length; j ++) //This avoids checking a pair of objects multiple times, and checking objects against themselves
			{
				if (self.all[j].getRect == undefined)
					continue;
				
				var rect1 = self.all[i].getRect().slice();
				var rect2 = self.all[j].getRect().slice();
				
				if (self.all[i] == self.player)
				{
					rect1[0] -= 1;
					rect1[2] += 2;
				}

				if (self.all[j] == self.player)
				{
					rect2[0] -= 1;
					rect2[2] += 2;
				}
				
				if (self.all[i].phy)
				{
					rect1[0] += self.all[i].phy.vx;
					rect1[1] += self.all[i].phy.vy;
				}
				
				if (self.all[j].phy)
				{
					rect2[0] += self.all[j].phy.vx;
					rect2[1] += self.all[j].phy.vy;
				}

				if (self.all[j].held)
				{
					rect2[0] += self.player.phy.vx;
					rect2[1] += self.player.phy.vy;
				}
				
				if (self.all[i].held)
				{
					rect1[0] += self.player.phy.vx;
					rect1[1] += self.player.phy.vy;
				}
				
				if (collide(rect1, rect2))
					self.collision(self.all[i], self.all[j]);
			}		
		}

		for (i = 0; i < self.sensors.length; i++)
			if (self.sensors[i].c && self.sensors[i].s == "d")
			{
				self.sensors[i].onC();
			}
			else if (!self.sensors[i].singd && !self.sensors[i].c && self.sensors[i].s == "a")
			{
				self.sensors[i].nonC();
			}
			else if (self.sensors[i].c)
			{
				clearTimeout(self.sensors[i].sd);
				self.sensors[i].singd = false;
			}
	}
	
	self.willDrop = function(ob)
	{
		if (ob instanceof self.Sensor || ob instanceof self.Door || ob instanceof self.Objekt || ob instanceof self.Point)
		{
			return false;
		}
		else if (ob instanceof self.Wall)
		{
			if (ob.style == "rgba(150,15,150,0.3)" || ob.style == self.dlc)
				return false;
			else
				return true;
		}
		
		return true;
	}

	self.parseInput = function()
	{
		if (input.right)
		{
			clearTimeout(self.player.left);

			if (self.player.bHolding && self.player.side == "left"/* && self.player.holdingPos == "normal"*/)
			{
				var clear = true;
				
				for (var i = 0; i < self.all.length; i ++)
					if (self.all[i].getRect)
						if (collide([self.player.pos[0] + self.player.getRect()[2] + 12 + self.player.phy.vx, self.player.pos[1] + 8, self.player.holding.getRect()[2], self.player.holding.getRect()[3]], self.all[i].getRect()) && self.player.holding != self.all[i] && self.willDrop(self.all[i]))
							self.player.release();						
			}			

			if (self.player.phy.vx < self.PSpeed && !self.player.phy.hasForce("right"))
			{
				self.player.phy.addForce(self.PForce, 0, "right");
			}
			else
			{
				//self.player.phy.vx = self.PSpeed;
			}
			
			if (self.player.holding.held)
			{
				self.player.img = 1;
				self.player.side = "right";
			}
			
			self.player.pr = true;
		}
		else if (!input.right && self.player.pr)
		{
			self.player.pr = false;
			
			if (self.player.phy.hasForce("right")) //&& !self.player.pr)
				self.player.phy.removeForce("right");
		}
		
		if (input.left)
		{
			if (self.player.bHolding && self.player.side == "right"/* && self.player.holdingPos == "normal"*/)
			{
				var clear = true;
				
				for (i = 0; i < self.all.length; i ++)
					if (self.all[i].getRect)
						if (collide([self.player.pos[0] - self.player.holding.getRect()[2] - 12 + self.player.phy.vx, self.player.pos[1] + 8, self.player.holding.getRect()[2], self.player.holding.getRect()[3]], self.all[i].getRect()) && self.player.holding != self.all[i] && self.willDrop(self.all[i]))
							self.player.release();
			}

			
			if (self.player.phy.vx > -self.PSpeed && !self.player.phy.hasForce("left"))
			{
				self.player.phy.addForce(-self.PForce, 0, "left");
			}
			else
			{
				//self.player.phy.vx = -self.PSpeed;
			}

			if (self.player.holding.held)
			{
				self.player.img = 2;
				self.player.side = "left";
			}
			
			self.player.pl = true;
		}
		else if (!input.left && self.player.pl)
		{
			self.player.pl = false;

			if (self.player.phy.hasForce("left")) //&& !self.player.pr)
				self.player.phy.removeForce("left");
		}
		
		if (input.up && !self.player.jumped && !self.u)
		{
			self.u = true;
			self.player.j ++;

			if (self.player.j >= self.player.jn)
			{
				self.player.jumped = true;		
				self.player.j = 0;
			}
			
			self.player.phy.vy = -self.JPSpeed;
		}
		else if (!input.up)
			self.u = false;
		
		if (input.e && !self.rel)
		{
			self.rel = true;
			
			if (self.sw)			
			{
				for (i = 0; i < self.all.length; i ++)
					if (self.all[i] instanceof self.Objekt && collide([self.player.getRect()[0] - 32, self.player.getRect()[1] - 32, self.player.getRect()[2] + 64, self.player.getRect()[3] + 64], self.all[i].getRect()) && !self.player.bHolding)
					{
						self.all[i].vx = 0;
						self.all[i].vy = 0;
						
						if (self.player.side == "right")
						{
							var clear = true;
							
							for (j = 0; j < self.all.length; j ++)
								if (self.all[j].getRect)
									if (collide([self.player.pos[0] + self.player.getRect()[2] + 12, self.player.pos[1] + 8, self.all[i].getRect()[2], self.all[i].getRect()[3]], self.all[j].getRect()) && self.all[i] != self.all[j] && self.willDrop(self.all[j]) /*&& self.player.holding != self.all[j]*/)
										clear = false;

							if (!clear)
							{
								self.player.img = 2;
								self.player.side = "left";
							}

							self.all[i].held = true;
							self.player.holding = self.all[i];
							self.player.bHolding = true;		
							self.player.holding.pos[1] --;

							if (self.player.side == "left")
								self.all[i].pos = [self.player.pos[0] - self.player.holding.getRect()[2] - 12, self.player.pos[1] + 8];							
							else
								self.all[i].pos = [self.player.pos[0] + self.player.getRect()[2] + 12, self.player.pos[1] + 8];							
						}

						if (self.player.side == "left")
						{
							var clear = true;
							
							for (j = 0; j < self.all.length; j ++)
								if (self.all[j].getRect)
									if (collide([self.player.pos[0] - self.all[i].getRect()[2] - 12, self.player.pos[1] + 8, self.all[i].getRect()[2], self.all[i].getRect()[3]], self.all[j].getRect()) && self.all[i] != self.all[j] && self.willDrop(self.all[j]) /*&& self.player.holding != self.all[j]*/)
										clear = false;

							if (!clear)
							{
								self.player.img = 1;
								self.player.side = "right";
							}

							self.all[i].held = true;
							self.player.holding = self.all[i];
							self.player.bHolding = true;		
							self.player.holding.pos[1] --;
							
							if (self.player.side == "left")
								self.all[i].pos = [self.player.pos[0] - self.player.holding.getRect()[2] - 12, self.player.pos[1] + 8];							
							else
								self.all[i].pos = [self.player.pos[0] + self.player.getRect()[2] + 12, self.player.pos[1] + 8];							
						}						
					}
							
				self.sw = false;
			}
			else if (!self.sw)
			{
				self.sw = true;
				self.player.release();
			}

			for (i = 0; i < self.levers.length; i ++)
				if (collide(self.player.getRect(), self.levers[i].getRect()))
				{
					if (self.levers[i].s == "a")
					{
						self.levers[i].d();
					}
					else
					{
						self.levers[i].a();
					}
				}
		}
		
		if (!input.e && self.rel)
			self.rel = false;
		
		if (input.one && !self.dg)
		{
			self.dg = true;
			
			for (var i = 0; i < self.phyobs.length; i ++)
				for (var j = 0; j < self.phyobs[i].forces.length; j ++)
					if (self.phyobs[i].names[j] == "grav")
						self.phyobs[i].forces[j][1] = self.phyobs[i].forces[j][1]*self.player.sgs;
			
			setTimeout(function()
			{
				self.dg = false;
				
				for (var i = 0; i < self.phyobs.length; i ++)
					for (var j = 0; j < self.phyobs[i].forces.length; j ++)
						if (self.phyobs[i].names[j] == "grav")
							self.phyobs[i].forces[j][1] = self.grav*self.phyobs[i].m;
							
			}, self.player.gs);
		}
	}	
	
	self.resetFlags = function()
	{
		for (var i = 0; i < self.all.length; i ++)
			self.all[i].flags = {};
	}
	
	self.checkFlags = function()
	{
		for (var i = 0; i < self.all.length; i ++)
		{
			var ob = self.all[i];
			
			if (ob.phy)
			{
				if (!ob.flags.colrg && !ob.phy.hasForce("grav"))
					ob.phy.addForce(0, ob.phy.m*self.grav, "grav");
			}
			
			if (!ob.flags.col) //This is uncompatible with the perks.
				ob.jumped = true;
		}
	}
	
	self.update = function()
	{		
		if (loaded && !self.paused)
		{
			self.FPS = Math.round((self.FPS + 1000/(new Date().getTime() - self.CT))/2);
			self.CT = new Date().getTime(); //Current time

			self.wallsU = [];
			self.wallsO = [];
			
			for (var i = 0; i < self.walls.length; i ++)
				if (self.walls[i].style == "rgba(33,200,250,0.4)" || self.walls[i].style == "rgba(150,15,150,0.3)")	
					self.wallsO.push(self.walls[i]);
				else
					self.wallsU.push(self.walls[i]);
				
			
			self.all = self.doors;
			self.all = self.all.concat(self.sensors); //
			self.all = self.all.concat(self.points); //
			self.all = self.all.concat(self.lasers); //
			self.all = self.all.concat(self.shots);
			self.all = self.all.concat(self.portals);
			self.all = self.all.concat(self.levers); //
			self.all = self.all.concat(self.wallsU); //
			self.all.push(self.player); //
			self.all = self.all.concat(self.objects); //
			self.all = self.all.concat(self.wallsO); //

			self.resetFlags();
			
			self.player.handend = self.player.getHandend(self.armLength);
			self.parseInput();
			self.logic();
			self.posit();
			//self.draw();
			
			if (self.player.phy.hasForce("right"))
			{
				self.player.phy.removeForce("right");
			}
			
			if (self.player.phy.hasForce("left"))
			{
				self.player.phy.removeForce("left");
			}
						
			self.checkFlags();
		}
	}
	//</func functions>

	
	//<game "classes">
	self.Door = function(pos, level, tag)
	{
		var d = this;

		d.pos = pos;
		d.level = level;
		d.tag = tag;
		
		d.state = "d";
		d.img = 8;
		
		d.getRect = function()
		{
			return [d.pos[0], d.pos[1], 51, 80];
 		}
		
		d.a = function()
		{
			d.state = "a";
			d.img = 7;
		}

		d.d = function()
		{
			d.state = "d";
			d.img = 8;
		}
		
		d.changeState = function()
		{
			if (d.state == "d")
				d.a();
			else
				d.d();
		}
		
		d.draw = function()
		{
			self.context.drawImage(images[d.img], d.pos[0], d.pos[1]);
		}
		
		d.activate = function()
		{
			if (!self.player.alive)
				return;
				
			for (var i = 0; i < self.sensors.length; i ++)
				clearTimeout(self.sensors[i].sd);

			if (d.tag != "zone" && self.levels[d.level[0]][d.level[1]] != self.level && self.levels[d.level[0]][d.level[1]].n != "end")
			{
				self.player.drawArm();
				
				self.pause(false);
				setTimeout(function()
				{							
					for (var i = 0; i < self.doors; i ++)
						if (self.doors[i] == d)
							self.pd = i;

					self.unpause(false); 
					self.loadLevel(self.levels[d.level[0]][d.level[1]]);
					
					send("prog", {"n": d.level + "", "time": (new Date().getTime() - game.start)/1000})
				}, self.pauseL);				
			}
			else if (d.tag != "zone" && self.levels[d.level[0]][d.level[1]].n == "end")
			{
				window.removeEventListener("blur", self.blur, false);
				window.removeEventListener("focus", self.focus, false);
				
				if (self.level.rot)
					clearInterval(self.level.rot);
					
				self.player.score += self.level.score;
				self.level.score = 0;
				self.player.gp = self.player.gp.concat(self.level.gp);
				
				setCookie("score", self.player.score + "", 365);
				setCookie("gpoints", self.player.gp.join(":"), 365);

				clearInterval(self.run);
				
				//document.getElementById("bgm").src = "http://www.youtube.com/embed/8HTaZw0MqBc?autoplay=1";
				
				self.draw();
				
				$("#cd").fadeOut(2000, function()
				{
					$("#cd").replaceWith("<div align='center'><p class='score'>Your score: " + self.player.score +"</p><p class='end'>Thanks for playing! Like and share, if you will.</p><br /><p class='end'>Please, tell me what did you like the least about the game (also any general feedback would be cool):</p><textarea id ='feed' rows='10' cols='50'></textarea><br /><br /><table border='0'><tr><td><a class='topMenu' href='javascript:void(0);' onclick='sendFeed();'>Send feedback</a></td></tr><tr><tr/><tr><td><a id='p' class='topMenu' href='LC/LCindex.html' target='_blank' >Try out the level creator</a></td></tr><tr><tr/><tr><td><a id='p' class='topMenu' href='javascript:void(0);' onclick='clearC();'>Reset game</a></td></tr></div>");
				});

				shine(100, 50, 10000, 10);
				
				$("#o").fadeOut(1000, function(){});
			}
			else if (d.tag == "zone")
			{
				self.pause(false);
				
				setTimeout(function()
				{
					for (var i = 0; i < self.doors; i ++)
						if (self.doors[i] == d)
							self.pd = i;

					self.unpause(false); 
					self.loadLevel(self.levels[d.level][0]);
				}, self.pauseL);
			}
		}
	}
    
	self.Wall = function(rect, style, o, onC)
	{
		var w = this;

		w.rect = rect;
		w.style = style;
		w.onC = onC;
		w.o = o;
		
		w.draw = function()
		{
			self.context.fillStyle = w.style;
			self.context.fillRect(w.rect[0], w.rect[1], w.rect[2], w.rect[3]);
			
			if (w.style != "rgba(33,200,250,0.4)" && w.style != "rgba(150,150,200,0.3)" && w.style != "rgba(150,15,150,0.3)")   
			{
				self.context.fillStyle = "rgba(250, 250, 250, 0.1)";
				self.context.fillRect(w.rect[0] + self.wallM, w.rect[1] + self.wallM, w.rect[2] - self.wallM*2, w.rect[3] - self.wallM*2);
			}
		}
		
		w.getRect = function()
		{
			return w.rect;
		}
	}
	
	self.Laser = function(pos)
	{
		var l = this;
		
		l.pos = pos;
		
		l.img = 9;
				
		l.draw = function()
		{
			self.context.drawImage(images[l.img], l.pos[0], l.pos[1]);
		}
		
		l.getRect = function()
		{
			return [l.pos[0], l.pos[1], images[9].width, images[9].height];
		}
	}

	self.Sensor = function(pos, i)
	{
		var s = this;
		
		s.pos = pos;
		s.i = i;
		
		s.img = 10;
		s.c = false;
		s.s = "d";
		s.nc = false;
		s.playedo = false;
		s.playedn = true;
		s.singd = false; //Shutting down setTimeout
		
		s.onC = function()
		{
			if (!s.playedo)
			{
				playSound(5, 0.1);
				s.playedo = true;
			}
			
			s.playedn = false;
			s.s = "a";
			s.img = 11;
			
			self.checkS();
			
			clearTimeout(s.sd);
			s.sd = false;
		}

		s.nonC = function()
		{
			s.singd = true;
			s.sd = setTimeout(s.SD, self.SCT);
		}
		
		s.SD = function()
		{
			clearTimeout(self.OD);
			s.singd = false;

			if (!s.playedn)
			{
				playSound(6, 0.1);
				s.playedn = true;
			}
			
			s.playedo = false;
			s.s = "d";
			s.img = 10;

			for (var i = 0; i < self.doors.length; i ++)
				if (self.doors[i].tag == "forth")	
				{
					self.doors[i].d();
				}
		}
		
		s.getRect = function()
		{
			return [s.pos[0], s.pos[1], images[10].width, images[10].height];
		}
		
		s.draw = function()
		{
			self.context.drawImage(images[s.img], s.pos[0], s.pos[1]);
		}
	}
	
	self.Point = function (pos, id)
	{
		var s = this;
		
		s.pos = pos;
		s.id = id;
		s.degree = Math.round(Math.random()*360);
		
		s.img = 16;
		
		s.getRect = function()
		{
			return [s.pos[0], s.pos[1], images[s.img].width, images[s.img].height];
		}
		
		s.draw = function()
		{
			if (s.degree != 0)
			{
				self.context.save();
				
				self.context.translate(s.pos[0] + s.getRect()[2]/2, s.pos[1] + s.getRect()[3]/2);
				self.context.rotate(s.degree*Math.PI/180);
				self.context.drawImage(images[s.img], -s.getRect()[2]/2, -s.getRect()[3]/2);			
				
				self.context.restore();
			}
			else
				self.context.drawImage(images[s.img], s.pos[0], s.pos[1]);			
		}
	}
	
	self.Objekt = function (img, pos, onC, m)
	{
		var o = this;
		
		o.img = img;
		o.pos = pos;
		o.onC = onC;
		
		o.held = false;
		o.phy = new self.Phy(m, o);
		o.phy.fr = self.OFR;
		o.phy.e = 0.4;
		o.degree = 0;		
		o.alive = true;
		
		o.getRect = function()
		{
			return [o.pos[0], o.pos[1], images[o.img].width, images[o.img].height];
		}
		
		o.getMiddle = function()
		{
			return [o.pos[0] + o.getRect()[2]/2, o.pos[1] + o.getRect()[3]/2];
		}
		
		o.draw = function()
		{
			if (o.degree != 0)
			{
				self.context.save();
				
				self.context.translate(o.pos[0] + o.getRect()[2]/2, o.pos[1] + o.getRect()[3]/2);
				self.context.rotate(o.degree*Math.PI/180);
				self.context.drawImage(images[o.img], -o.getRect()[2]/2, -o.getRect()[3]/2);			
				
				self.context.restore();
			}
			else
				self.context.drawImage(images[o.img], o.pos[0], o.pos[1]);			
		}
		
		o.die = function()
		{
			for (var i = 0; i < self.objects.length; i ++)
				if (self.objects[i] == o)
					self.objects = sliceHere(self.objects, i);		
		}		
	}

	self.Lever = function(pos, n, s)
	{
		var l = this;
		
		l.pos = pos;
		l.n = n;
		l.s = s

		if (self.places[l.n])
		{
			l.img = 20;
			l.s = "a";
		}
		else
		{
			l.img = 19;
			l.s = "d";
		}
		
		l.a = function()
		{
			if ((l.n != "power" && self.places["power"]) || l.n == "power")
			{
				l.img = 20;
				l.s = "a";
				self.places[l.n] = true;
				
				if (l.n == "power")
				{
					self.places[l.n] = false;
					playSound(14);	

					sounds[playing[14] - 1][14].addEventListener("ended", function()
					{
						self.places[l.n] = true;
						playSound(16);			
					});
				}
				
				if (l.n == "engines")
				{
					setTimeout(function()
					{
						playSound(17);
						
						for (var i = 0; i < self.all.length; i++)
							if (self.all[i].phy)
								self.all[i].phy.addForce(0, -self.all[i].phy.m*self.grav, "mom");
					}, 100);
					
					setTimeout(function()
					{
						for (var i = 0; i < self.all.length; i++)
							if (self.all[i].phy)
								self.all[i].phy.removeForce("mom");
						
					}, 100 + 4750)
				}
				
				if (l.s)
					playSound(15);
					
				self.saveProg();
			}
			else
			{
				self.messages = [];
				new self.Mes(23, "first", "false", "You will have to activate the power first.");
				playSound(15);
			}
		}

		l.d = function()
		{
			l.img = 19;
			l.s = "d";
			self.places[l.n] = false;

			if (l.s)
				playSound(15);

			self.saveProg();
		}
		
		l.getRect = function()
		{
			return [l.pos[0], l.pos[1], images[l.img].width, images[l.img].height];
		}
		
		l.draw = function()
		{
			self.context.drawImage(images[l.img], l.pos[0], l.pos[1]);
		}
	}
		
	self.Portal = function(color, rect, o)
	{
		var p = this;
		
		p.color = color;
		p.rect = rect;
		p.o = o;
		
		var clear = true;

		for (iii = 0; iii <  self.walls.length; iii ++)
			if (collide (self.walls[iii].getRect(), p.rect) && self.walls[iii].style != "rgba(150,15,150,0.3)" && self.walls[iii].style != self.dlc)
			{
				if (p.o == "top" || p.o == "down")
				{
					if (p.rect[0] > self.walls[iii].getRect()[0])
						p.rect[0] = self.walls[iii].getRect()[0] + self.walls[iii].getRect()[2];
					if (p.rect[0] < self.walls[iii].getRect()[0])
						p.rect[0] = self.walls[iii].getRect()[0] - p.rect[2];		
				}
				if (p.o == "left" || p.o == "right")
				{
					if (p.rect[1] > self.walls[iii].getRect()[1])
						p.rect[1] = self.walls[iii].getRect()[1] + self.walls[iii].getRect()[3];
					if (p.rect[1] < self.walls[iii].getRect()[1])
						p.rect[1] = self.walls[iii].getRect()[1] - p.rect[3];						
				}				
			}
		
		for (iii = 0; iii <  self.walls.length; iii ++)
			if (collide (self.walls[iii].getRect(), p.rect) && self.walls[iii].style != "rgba(150,15,150,0.3)" && self.walls[iii].style != self.dlc)
				clear = false;
				
		for (iii = 0; iii <  self.portals.length; iii ++)
			if (collide (self.portals[iii].rect, p.rect) && self.portals[iii].color != p.color)
				self.portals = sliceHere(self.portals, iii);

		if (clear)
		{
			for (ii = 0; ii < self.portals.length; ii ++)
				if (self.portals[ii].color == p.color)
					self.portals = sliceHere(self.portals, ii);
					
			self.portals.push(p);
			
			p.draw = function()
			{
				if (color == "green")
					self.context.fillStyle = "rgba(30,200,40,0.5)";
				else
					self.context.fillStyle = "rgba(30,40,200,0.5)";
				
				self.context.fillRect(p.rect[0], p.rect[1], p.rect[2], p.rect[3]);
			}
		}
		else
			delete p;
			
		p.getRect = function()
		{
			return p.rect;
		}
	}
	
	self.Shot = function(vx, vy, color, pos)
	{
		var s = this;
		
		s.vx = vx;
		s.vy = vy;
		s.pos = pos;
		s.color = color;
		
		if (color == "blue")
			s.img = [4];
		else
			s.img = [5];
		
		s.draw = function()
		{
			self.context.drawImage(images[s.img], s.pos[0], s.pos[1]);
		}
		
		s.getRect = function()
		{
			return [Math.round(s.pos[0]), Math.round(s.pos[1]), images[s.img].width, images[s.img].height];
		}
		
		s.manage = function()
		{
			for (var i = 0; i < self.walls.length; i ++)
				if (collide([s.getRect()[0] + s.vx, s.getRect()[1] + s.vy, s.getRect()[2], s.getRect()[3]], self.walls[i].getRect()) && self.walls[i].style == self.wallc)
				{
					for (j = 0; j < self.shots.length; j ++)
						if (self.shots[j] == s)
						{
							var or = Or(s.getRect(), self.walls[i].getRect());
							
							if (or == "h" && self.walls[i].getRect()[2] > self.portalSize && self.walls[i].getRect()[0] < s.pos[0] - self.portalSize/2 - s.getRect()[2]/2 && self.walls[i].getRect()[0] + self.walls[i].getRect()[2] > (s.pos[0] - self.portalSize/2 - s.getRect()[2]/2) + self.portalSize)
							{
								if (s.vy > 0)
								{
									new self.Portal(s.color, [s.pos[0] - self.portalSize/2 - s.getRect()[2]/2, self.walls[i].getRect()[1] - self.PW, self.portalSize, self.PW], "down");
								}
								else
								{
									new self.Portal(s.color, [s.pos[0] - self.portalSize/2 - s.getRect()[2]/2, self.walls[i].getRect()[1] + self.walls[i].getRect()[3], self.portalSize, self.PW], "top");								
								}
							}
							else if (or == "h" && self.walls[i].getRect()[2] > self.portalSize)
							{
								if (s.vy > 0)
								{
									if (self.walls[i].getRect()[0] > s.pos[0] - self.portalSize/2 - s.getRect()[2]/2)
										new self.Portal(s.color, [self.walls[i].getRect()[0], self.walls[i].getRect()[1] - self.PW, self.portalSize, self.PW], "down");
									else if (self.walls[i].getRect()[0] + self.walls[i].getRect()[2] < (s.pos[0] - self.portalSize/2 - s.getRect()[2]/2) + self.portalSize)
										new self.Portal(s.color, [self.walls[i].getRect()[0] + self.walls[i].getRect()[2] - self.portalSize, self.walls[i].getRect()[1] - self.PW, self.portalSize, self.PW], "down");
								}
								else
								{
									if (self.walls[i].getRect()[0] > s.pos[0] - self.portalSize/2 - s.getRect()[2]/2)
										new self.Portal(s.color, [self.walls[i].getRect()[0], self.walls[i].getRect()[1] + self.walls[i].getRect()[3], self.portalSize, self.PW], "top");
									else if (self.walls[i].getRect()[0] + self.walls[i].getRect()[2] < (s.pos[0] - self.portalSize/2 - s.getRect()[2]/2) + self.portalSize)
										new self.Portal(s.color, [self.walls[i].getRect()[0] + self.walls[i].getRect()[2] - self.portalSize, self.walls[i].getRect()[1] + self.walls[i].getRect()[3], self.portalSize, self.PW], "top");
								}
							}
							else if (or == "o" && self.walls[i].getRect()[3] > self.portalSize && self.walls[i].getRect()[1] < s.pos[1] + s.getRect()[3]/2 - self.portalSize/2 && self.walls[i].getRect()[1] + self.walls[i].getRect()[3] > s.pos[1] + s.getRect()[3]/2 - self.portalSize/2 + self.portalSize)
							{
								if (s.vx > 0)
									new self.Portal(s.color, [self.walls[i].getRect()[0] - self.PW, s.pos[1] + s.getRect()[3]/2 - self.portalSize/2, self.PW, self.portalSize], "right");
								else
									new self.Portal(s.color, [self.walls[i].getRect()[0] + self.walls[i].getRect()[2], s.pos[1] + s.getRect()[3]/2 - self.portalSize/2, self.PW, self.portalSize], "left");
							}
							else if (or == "o" && self.walls[i].getRect()[3] > self.portalSize)
							{
								if (s.vx > 0)
								{
									if (self.walls[i].getRect()[1] > s.pos[1] + s.getRect()[3]/2 - self.portalSize/2)
										new self.Portal(s.color, [self.walls[i].getRect()[0] - self.PW, self.walls[i].getRect()[1], self.PW, self.portalSize], "right");
									else if (self.walls[i].getRect()[1] + self.walls[i].getRect()[3] < s.pos[1] + s.getRect()[3]/2 - self.portalSize/2 + self.portalSize)
										new self.Portal(s.color, [self.walls[i].getRect()[0] - self.PW, self.walls[i].getRect()[1] + self.walls[i].getRect()[3] - self.portalSize, self.PW, self.portalSize], "right");
								}
								else
								{
									if (self.walls[i].getRect()[1] > s.pos[1] + s.getRect()[3]/2 - self.portalSize/2)
										new self.Portal(s.color, [self.walls[i].getRect()[0] + self.walls[i].getRect()[2], self.walls[i].getRect()[1], self.PW, self.portalSize], "left");
									else if (self.walls[i].getRect()[1] + self.walls[i].getRect()[3] < s.pos[1] + s.getRect()[3]/2 - self.portalSize/2 + self.portalSize)
										new self.Portal(s.color, [self.walls[i].getRect()[0] + self.walls[i].getRect()[2], self.walls[i].getRect()[1] + self.walls[i].getRect()[3] - self.portalSize, self.PW, self.portalSize], "left");
								}
							}
							
							self.shots = sliceHere (self.shots, j);
							break;
						}	
				}
				else if (collide([s.getRect()[0] + s.vx, s.getRect()[1] + s.vy, s.getRect()[2], s.getRect()[3]], self.walls[i].getRect()) && (self.walls[i].style == self.metc || self.walls[i].style == self.dlc))
					for (j = 0; j < self.shots.length; j ++)
					{
						if (self.shots[j] == s)
						{
							self.shots = sliceHere (self.shots, j);
							break;
						}
					}
				else if (collide([s.getRect()[0] + s.vx, s.getRect()[1] + s.vy, s.getRect()[2], s.getRect()[3]], self.walls[i].getRect()) && self.walls[i].style == self.mirc)
				{
					var or = Or(s.getRect(), self.walls[i].getRect());

					s.pos[0] += s.vx;
					s.pos[1] += s.vy;
					
					var didm = true;
					
					if (or == "h")
					{
						s.vy = -s.vy;
					}
					else if (or == "o")
					{
						s.vx = -s.vx;
					}
				}
				
			if (didm != true)
			{
				s.pos[0] += s.vx;
				s.pos[1] += s.vy;
			}
		}
		
		self.shots.push(s);
	}
	
	self.Player = function()
	{
		var p = this;
		
		p.pos = [canvas.width/2, 600];
		p.img = 1;
		p.phy = new self.Phy(50, p);
		p.phy.fr = self.PFR;
		p.jumped = true;
		p.holdingPos = "normal";
		p.pr = false;
		p.pl = false;
		p.side = "right"
		p.removed = false;
		p.addRight = true;
		p.addLeft = true;
		p.right = "no";
		p.left = "no";
		p.lastPos = [0, 0];
		p.jn = 1;
		p.j = 0;
		p.gun = false;
		
		p.holding = false; //will become an object later
		p.bHolding = false;
		p.alive = true;
		
		p.gs = 2000;
		p.sgs = 1;
		
		if (getCookie("score"))
			p.score = getCookie("score");
		else
			p.score = 0;
		
		p.draw = function()
		{
			self.context.drawImage(images[p.img], p.pos[0], p.pos[1]);
		}
		
		p.getRect = function()
		{
			if (loaded)
				return [p.pos[0], p.pos[1], images[p.img].width, images[p.img].height];
			else
				return [p.pos[0], p.pos[1], 0, 0];
		}
		
		p.release = function()
		{
			if(p.holding.held)
			{
				p.holding.phy.vx = p.phy.vx;
				p.holding.phy.vy = p.phy.vy;
				p.holding.degree = 0;
				p.holding.held = false;				
				p.bHolding = false;
				p.holdingPos = "normal";
			}
		}
		
		p.die = function()
		{
			send("prog", {"n":"died", "time": (new Date().getTime() - game.start)/1000});
			clearInterval(self.level.preping);
			self.level.score = 0;
			self.level.gp = [];
			self.pause(false);
			
			setTimeout(function()
			{				
				self.unpause(false);
				self.loadLevel(self.levels[self.level.id[0]][self.level.id[1]]);
			}, self.pauseL);
		}
		
		p.getHandend = function(aL)
		{
			if (p.holding.held)
			{
				if (p.side == "right")
					return [p.holding.getMiddle()[0] - 11.2, p.holding.getMiddle()[1]];
				if (p.side == "left")
					return [p.holding.getMiddle()[0] + 11.2, p.holding.getMiddle()[1]];
			}
			else
			{	
				var start = [p.pos[0] + p.getRect()[2]/2, p.getRect()[1] + 28];
				var end = self.mouse;
				
				var a = [end[0] - start[0]];
				var b = [end[1] - start[1]];
				var c = Math.sqrt(a*a + b*b);
				
				var rat = aL/c;

				b = b*rat;
				a = a*rat;
				
				end = [start[0] + a, start[1] + b];
				
				if (p.side == "right" && p.pos[0] + p.getRect()[2]/2 > end[0])
				{
					p.img = 2;
					p.side = "left";
				}
				else if (p.side == "left" && p.pos[0] + p.getRect()[2]/2 < end[0])
				{
					p.img = 1;
					p.side = "right";					
				}

				return end;
			}
		}
		
		p.drawArm = function()
		{
			p.handend = p.getHandend(self.armLength);
			self.context.strokeStyle = "#B3AA98";

			self.context.lineCap = "round";
			
			self.context.beginPath();
			self.context.lineWidth = 5.6;
			self.context.moveTo(self.player.getRect()[0] + self.player.getRect()[2]/2, self.player.getRect()[1] + 28);		
			var arm = self.player.getHandend(self.armLength/2);
			self.context.lineTo(arm[0], arm[1]);
			self.context.stroke();

			self.context.lineCap = "butt";
			
			self.context.beginPath();
			self.context.lineWidth = 5.6;
			self.context.moveTo(self.player.getRect()[0] + self.player.getRect()[2]/2, self.player.getRect()[1] + 28);
			self.context.lineTo(self.player.handend[0], self.player.handend[1]);
			self.context.stroke();
			
			self.player.handend = self.player.getHandend(self.armLength);

			self.context.beginPath();
			self.context.lineWidth = 8.4;
			self.context.strokeStyle = "#222";
			var gun = self.player.getHandend(self.armLength/3);
			self.context.moveTo(gun[0], gun[1]);
			self.context.lineTo(self.player.handend[0], self.player.handend[1]);
			self.context.stroke();

			self.context.beginPath();
			self.context.lineWidth = 10;
			self.context.strokeStyle = "#AAA";
			var gun = self.player.getHandend(self.armLength/1.5);
			self.context.moveTo(gun[0], gun[1]);
			self.context.lineTo(self.player.handend[0], self.player.handend[1]);
			self.context.stroke();
		}
		
		p.handend = p.getHandend(self.armLength);
	}
	//</game "classes">
	

	//<prep>
	for (i = 0; i < levels.length; i ++)
	{
		self.levels.push([]);

		for (j = 0; j < levels[i].length; j ++)
			self.makeLevel(levels[i][j], i, j);
	}
	
	new self.Level("end");
	
	self.player = new self.Player();	

	document.addEventListener("mousemove", self.onMove);
	canvas.addEventListener("mouseup", self.onClick);
	document.addEventListener("contextmenu", self.oncontextmenu);
	document.addEventListener("keydown", press, false);
	document.addEventListener("keyup", release, false);
	
	//document.getElementById("bgm").src = self.bgm + "?autoplay=1&loop=1";		
		
	if (getCookie("gpoints"))
		self.player.gp = getCookie("gpoints").split(":"); 
	else
		self.player.gp = [];
			
	if (getCookie("score"))
		self.player.score = parseInt(getCookie("score"));
	else
		self.player.score = 0;

	if (getCookie("level") != undefined)
		self.loadLevel(self.levels[getCookie("level").split(":")[0]][getCookie("level").split(":")[1]]);
	else
		self.loadLevel(self.levels[0][0]);

	for (i = 0; i < self.buttons.length; i++)
		for (j = 0; j < self.buttons[i].level; j ++)
			self.buttons[i].oC();

	self.buttons = 
	[
		new self.Button(function()
		{
			self.player.sgs -= 0.2;
			self.player.gs += 1500;
		}, "Decrease gravity.", [1, 2, 3, 4, 5], perks[0]),
		
		new self.Button(function()
		{
			self.player.jn ++;
		}, "Multi jump.", [1, 2], perks[1]),
		
		new self.Button(function()
		{
			self.JPSpeed += 1.5;
		}, "Jump speed.", [1, 2, 3, 4, 5], perks[2]),

		new self.Button(function()
		{
			self.objects.push(new self.Objekt(0, [self.player.pos[0] + self.player.getRect()[2]/2 - images[0].width/2, self.player.pos[1] + self.player.getRect()[3]/2 - images[0].height/2], undefined, 50));
		}, "Spawn a box.", [10], "one"),

		new self.Button(function()
		{
			self.player.phy.fr *= 0.9;
		}, "Lower player's friction.", [1, 2, 3, 4, 5], perks[4])
	];
	
	self.Objekt.prototype.flags = {};
	self.player.flags = {};	
	//</prep>	
}

//MFC switch level idea: some gravity swing, but with the pink walls (no gravity)!
