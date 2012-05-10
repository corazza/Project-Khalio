var k = function (canvas, w, h, n, c, bg, mes)
{	
	var self = this;

	//load(0);	
	
	self.color = c;
	self.context = canvas.getContext("2d");
	self.w = w;
	self.h = h;
	self.n = n;
	self.c = c;
	self.bg = bg;
	self.mes = mes;
	
	self.ratio = 0.7;

	self.CO = findPos(canvas);
	self.mouse = [0, 0];
	self.offset = [0, 0];	
	self.wallT = 12;	
	self.placeit = 0;
	self.pw = false;
	self.pl = false;
	self.down = false;
	self.placedEx = false;
	self.placedEn = false;
	self.undid = false;
	self.zone = 0;
	self.plus = false;
	self.minus = false;
	
	self.scrollS = 4;
	self.cM = 10*self.ratio;
	
	self.walls = [];
	self.objects = [];
	
	self.did = [];
	
	self.place =
	[
		"wall",
		"mwall",
		"stwall",
		"wtwall",
		"point",
		"box",
		"entranced",
		"exitd",
		"zone",
		"spec",
		"sensor",
		"lasers",
		"lever",
		"ze",
		"mirror",
		"nograv"
	];
	
	self.names =
	[
		"Wall",
		"Wall",
		"Wall",
		"Wall",
		"Point",
		"Box",
		"Entrance door",
		"Exit door",
		"Zone door",
		"To end door",
		"Sensor",
		"Laser",
		"Lever",
		"Zone exit door",
		"Wall",
		"Wall"
	];

	self.pimages = 
	[
		"#888",
		"#2E1D1A",
		"rgba(150,150,120,0.7)",
		"rgba(33,200,250,0.4)",
		16,
		0,
		8,
		8,
		8,
		8,
		10,
		9,
		19,
		8,
		"rgba(150,150,200,0.3)",
		"rgba(150,15,150,0.3)"
	],
	
	self.load = function(level)
	{
		for (var i = 0; i < level.length; i ++)
			if (level[i] == "'" || level[i] == " " || level[i] == "\n")
			{
				level = sliceHere(level, i)
				i --;
			}
			
		level = JSON.parse(level);
		
		self.n = level.n;
		self.color = level.color;
		self.w = level.w;
		self.h = level.h;
		self.bg = level.bg;
		self.mes = level.mes;

		self.objects = [];
		self.walls = [];

		new self.Wall([0, 0, level.w, self.wallT], self.color);
		new self.Wall([0, 0, self.wallT, level.h], self.color);	
		new self.Wall([0, level.h - self.wallT, level.w, self.wallT], self.color);	
		new self.Wall([level.w - self.wallT, 0, self.wallT, level.h], self.color);	

		self.walls[0].tag = "del";
		self.walls[1].tag = "del";
		self.walls[2].tag = "del";
		self.walls[3].tag = "del";
		
		for (i = 0; i < level.walls.length; i ++)
			new self.Wall(level.walls[i].rect, level.walls[i].color);
		
		for (i = 0; i < level.objects.length; i ++)
			new self.Objekt(level.objects[i].pos, level.objects[i].img, level.objects[i].n);
	}
	
	self.Wall = function(rect, color)
	{
		var w = this;
		
		w.rect = rect;
		w.color = color;
		
		w.draw = function()
		{
			self.context.fillStyle = w.color;
			self.context.fillRect(w.rect[0] - self.offset[0], w.rect[1] - self.offset[1], w.rect[2], w.rect[3]);
		}
				
		self.walls.push(w);
		self.did.push(w);
	}
	
	self.Objekt = function(pos, img, n, zone)
	{
		var o = this;
		
		o.pos = pos;
		o.img = img;
		o.n = n;
		o.zone = zone;
		
		o.draw = function()
		{
			self.context.drawImage(images[o.img], o.pos[0] - self.offset[0], o.pos[1] - self.offset[1]);
		}
		
		o.getRect = function()
		{
			return [o.pos[0], o.pos[1], images[o.img].width, images[o.img].height];
		}
		
		self.objects.push(o);
		self.did.push(o);
	}

	self.onMove = function(e)
	{
		if (!input.right)
			self.mouse[0] = e.pageX - self.CO[0];
		
		if (!input.left)
			self.mouse[1] = e.pageY - self.CO[1];
	}

	self.oncontextmenu = function(e) 
	{
		e.preventDefault();
	};	

	self.onDown = function(e)
	{
		self.down = true;
		self.sp = self.mouse.slice();
		
		if (self.names[self.placeit] == "Wall" && e.which == 1)
			self.pw = true;

		if (self.names[self.placeit] == "Laser" && e.which == 1)
			self.pl = true;
	}

	self.onUp = function(e)
	{
		self.down = false;
		self.ep = self.mouse.slice();

		if (e.which == 1)
		{
			if (!self.pw && !self.pl)
			{
				var will = true;
				
				if ((self.place[self.placeit] == "entranced" && self.placedEn) || (self.place[self.placeit] == "exitd" && self.placedEx))
					will = false;

				pos = [self.mouse[0] + self.offset[0] - images[self.pimages[self.placeit]].width/2, self.mouse[1] + self.offset[1] - images[self.pimages[self.placeit]].height/2];
				wh = [images[self.pimages[self.placeit]].width, images[self.pimages[self.placeit]].height];
				
				for (var i = 0; i < self.walls.length; i ++)
				{
					if (collide(pos.concat(wh), [self.walls[i].rect[0] - self.cM, self.walls[i].rect[1] - self.cM, self.walls[i].rect[2] + self.cM*2, self.walls[i].rect[3] + self.cM*2]))
					{
						if (pos[0] < self.walls[i].rect[0] + self.walls[i].rect[2] + self.cM && pos[0] > self.walls[i].rect[0] + self.walls[i].rect[2] - self.cM)
						{
							pos[0] = self.walls[i].rect[0] + self.walls[i].rect[2];
						}
							
						if (pos[0] + wh[0] > self.walls[i].rect[0] - self.cM && pos[0] + wh[0] < self.walls[i].rect[0] + self.cM)
						{
							pos[0] = self.walls[i].rect[0] - wh[0];					
						}

						if (pos[1] < self.walls[i].rect[1] + self.walls[i].rect[3] + self.cM && pos[1] > self.walls[i].rect[1] + self.walls[i].rect[3] - self.cM)
						{
							pos[1] = self.walls[i].rect[1] + self.walls[i].rect[3];
						}
							
						if (pos[1] + wh[1] > self.walls[i].rect[1] - self.cM && pos[1] + wh[1] < self.walls[i].rect[1] + self.cM)
						{
							pos[1] = self.walls[i].rect[1] - wh[1];					
						}
					}
				}
				
				if (will)
				{
					new self.Objekt(pos, self.pimages[self.placeit], self.place[self.placeit], self.zone);
				}
				
				if (self.place[self.placeit] == "entranced")
				{
					self.placedEn = true;
				}

				if (self.place[self.placeit] == "exitd")
				{
					self.placedEx = true;
				}
			}
			else if (self.pw && !self.pl)
			{
				self.pw = false;
				self.nsp = [];
				self.nep = [];
				
				if (self.sp[0] > self.mouse[0])
				{
					self.nsp[0] = self.mouse[0] + self.offset[0];
					self.nep[0] = self.sp[0] + self.offset[0];
				}
				else	
				{
					self.nsp[0] = self.sp[0] + self.offset[0];
					self.nep[0] = self.mouse[0] + self.offset[0];
				}
								
				if (self.sp[1] > self.mouse[1])
				{
					self.nsp[1] = self.mouse[1] + self.offset[1];
					self.nep[1] = self.sp[1] + self.offset[1];
				}
				else	
				{
					self.nsp[1] = self.sp[1] + self.offset[1];
					self.nep[1] = self.mouse[1] + self.offset[1];
				}

				var did = false;
				var did2 = false;
			
				/*for (var i = 0; i < self.walls.length; i ++)
				{
					if (collide([self.nsp[0] - self.cM, self.nsp[1] - self.cM, self.nsp[0] + self.nep[0] + self.cM*2, self.nsp[1] + self.nep[1] + self.cM*2], self.walls[i].rect))
					{
						if (self.nep[0] > self.walls[i].rect[0] - self.cM && self.nep[0] < self.walls[i].rect[0] + self.cM)
							self.nep[0] = self.walls[i].rect[0];

						if (Math.abs(self.nep[1] - self.walls[i].rect[1]) < self.cM)
						{						
							self.nep[1] = self.walls[i].rect[1];
							
							if (Math.abs(self.nep[0] - (self.walls[i].rect[0] + self.walls[i].rect[2])) < self.cM)
							{
								did = true;
								self.nep[0] = self.walls[i].rect[0] + self.walls[i].rect[2];
							}
							
							if (Math.abs(self.nsp[0] - self.walls[i].rect[0]) < self.cM)
							{
								did2 = true;
								
								if (did)
								{
									var old = self.walls[i].rect[1];
									self.walls[i].rect[1] = self.nsp[1];
									self.walls[i].rect[3] += old - self.walls[i].rect[1];
								}							
							}
						}
						else if (Math.abs(self.nsp[1] - (self.walls[i].rect[1] + self.walls[i].rect[3])) < self.cM)
						{
							self.nsp[1] = self.walls[i].rect[1] + self.walls[i].rect[3];
							if (Math.abs(self.nep[0] - (self.walls[i].rect[0] + self.walls[i].rect[2])) < self.cM)
							{
								did = true;
								self.nep[0] = self.walls[i].rect[0] + self.walls[i].rect[2];
							}

							if (Math.abs(self.nsp[0] - self.walls[i].rect[0]) < self.cM)
							{
								did2 = true;
								
								if (did)
									self.walls[i].rect[3] += self.nep[1] - (self.walls[i].rect[1] + self.walls[i].rect[3]);
							}
						}
						
						if (Math.abs(self.nep[0] - self.walls[i].rect[0]) < self.cM)
						{
							self.nep[0] = self.walls[i].rect[0];
							
							if (Math.abs(self.nsp[1] - self.walls[i].rect[1]) < self.cM)
							{
								did = true;
								self.nsp[1] = self.walls[i].rect[1];
							}
							
							if (Math.abs(self.nep[1] - (self.walls[i].rect[1] + self.walls[i].rect[3])) < self.cM)
							{
								did2 = true;							
								self.nep[1] = self.walls[i].rect[1] + self.walls[i].rect[3];
								
								if (did)
								{
									self.walls[i].rect[2] = self.walls[i].rect[0] + self.walls[i].rect[2] - self.nsp[0];
									self.walls[i].rect[0] = self.nsp[0];
								}
							}
						}
						else if (Math.abs(self.nsp[0] - self.walls[i].rect[0] - self.walls[i].rect[2]) < self.cM)
						{
							self.nsp[0] = self.walls[i].rect[0] + self.walls[i].rect[2];
							
							if (Math.abs(self.nsp[1] - self.walls[i].rect[1]) < self.cM)
							{
								did = true;
								self.nsp[1] = self.walls[i].rect[1];
							}					

							if (Math.abs(self.nep[1] - (self.walls[i].rect[1] + self.walls[i].rect[3])) < self.cM)
							{
								did2 = true;							
								self.nep[1] = self.walls[i].rect[1] + self.walls[i].rect[3];
								
								if (did)
									self.walls[i].rect[2] = self.nep[0] - self.walls[i].rect[0];
							}
						}		
					}		
				}*/
				
				if (!(did && did2))
					new self.Wall([self.nsp[0], self.nsp[1], self.nep[0] - self.nsp[0], self.nep[1] - self.nsp[1]], self.pimages[self.placeit]);
			}
			else if (self.pl && !self.pw)
			{
				self.pl = false;
				self.nsp = [];
				self.nep = [];
				
				if (self.sp[0] > self.mouse[0])
				{
					self.nsp[0] = self.mouse[0] + self.offset[0];
					self.nep[0] = self.sp[0] + self.offset[0];
				}
				else	
				{
					self.nsp[0] = self.sp[0] + self.offset[0];
					self.nep[0] = self.mouse[0] + self.offset[0];
				}
								
				if (self.sp[1] > self.mouse[1])
				{
					self.nsp[1] = self.mouse[1] + self.offset[1];
					self.nep[1] = self.sp[1] + self.offset[1];
				}
				else	
				{
					self.nsp[1] = self.sp[1] + self.offset[1];
					self.nep[1] = self.mouse[1] + self.offset[1];
				}
				

				self.y = self.nsp[1] - 19.5;
				self.xs = self.nsp[0] - 5.5;
				self.xe = self.nep[0] + 5.5;

				for (var i = 0; i < self.walls.length; i ++)
				{
					if (self.y + 38 > self.walls[i].rect[1] - self.cM && self.y + 39 < self.walls[i].rect[1] + self.cM)
						self.y = self.walls[i].rect[1] - 39;
						
					if (self.xs < self.walls[i].rect[0] + self.walls[i].rect[2] + self.cM && self.xs > self.walls[i].rect[0] + self.walls[i].rect[2] - self.cM)
					{
						self.xe += (self.walls[i].rect[0] + self.walls[i].rect[2]) - self.xs;
						self.xs = self.walls[i].rect[0] + self.walls[i].rect[2];
					}
					
					if (self.xe > self.walls[i].rect[0] - self.cM && self.xe < self.walls[i].rect[0] + self.cM)
					{
						self.xs += self.walls[i].rect[0] - self.xe;
						self.xe = self.walls[i].rect[0];
					}
				}
				
				var las = getLasers([self.xs, self.y], [self.xe, self.y]);

				for (var i = 0; i < las.length; i ++)
					new self.Objekt(las[i], self.pimages[self.placeit], self.place[self.placeit]);
			}
		}
		else
		{
			var did = false;
			var i;
			
			for (i = 0; i < self.objects.length; i ++)
				if (collide([self.mouse[0] + self.offset[0], self.mouse[1] + self.offset[1], 1, 1], self.objects[i].getRect()))
				{
					if (self.objects[i].n == "entranced")
						self.placedEn = false;

					if (self.objects[i].n == "exitd")
						self.placedEx = false;

					self.objects = sliceHere(self.objects, i);
					did = true;
					break;
				}
				
			if (!did)
				for (i = 0; i < self.walls.length; i ++)
					if (collide([self.mouse[0] + self.offset[0], self.mouse[1] + self.offset[1], 1, 1], self.walls[i].rect))
					{
						self.walls = sliceHere(self.walls, i);
						break;
					}
		}
	}
	
	self.onMouseWheel = function(e)
	{
		if (!self.down)
		{
			var evt=window.event || e;
			var delta=evt.detail? evt.detail*(-120) : evt.wheelDelta;
			
			if (delta > 0)
			{
				if (self.placeit > 0)
					self.placeit --;
				else 
					self.placeit = self.place.length - 1;
			}
			else
			{
				if (self.placeit < self.place.length - 1)
					self.placeit ++;
				else 
					self.placeit = 0;
			}
		}
	}
	
	self.draw = function()
	{				
		for (var i = 0; i < canvas.width/images[self.bg].width; i ++)
			for (var j = 0; j < canvas.height/images[self.bg].height; j ++)
				self.context.drawImage(images[self.bg], i*images[self.bg].width, j*images[self.bg].height);

		var toDraw = self.walls.concat(self.objects);
		
		for (var i = 0; i < toDraw.length; i ++)
			toDraw[i].draw();
			
		if (self.pw)
		{
			self.context.fillStyle = self.pimages[self.placeit];
			console.log(self.pimages[self.placeit]);
			self.context.fillRect(self.sp[0], self.sp[1], self.mouse[0] - self.sp[0], self.mouse[1] - self.sp[1]);
		}
	
		if (isNaN(self.pimages[self.placeit]) && !self.pw)
		{
			self.context.fillStyle = self.pimages[self.placeit];
			self.context.fillRect(self.mouse[0] - self.wallT, self.mouse[1] - self.wallT, self.wallT, self.wallT);
			
			self.context.font="24pt Helvetica";			
			self.context.fillStyle = "#111";
			self.context.fillText(self.names[self.placeit], self.mouse[0] - self.wallT/2, self.mouse[1] - self.wallT/2 - 24);
		}
		else if (!self.pw)
		{
			self.context.font="24pt Helvetica";			
			self.context.fillStyle = "#111";
			
			if (self.names[self.placeit] != "Zone door")
				self.context.fillText(self.names[self.placeit], self.mouse[0] - images[self.pimages[self.placeit]].width/2, self.mouse[1] - images[self.pimages[self.placeit]].height/2 - 24);
			else
				self.context.fillText(self.names[self.placeit] + " " + self.zone, self.mouse[0] - images[self.pimages[self.placeit]].width/2, self.mouse[1] - images[self.pimages[self.placeit]].height/2 - 24);
			
			self.context.drawImage(images[self.pimages[self.placeit]], self.mouse[0] - images[self.pimages[self.placeit]].width/2, self.mouse[1] - images[self.pimages[self.placeit]].height/2);
		}
	}
	
	self.undo = function()
	{
		var ob = self.did.pop();
		var i;
		
		if (ob instanceof self.Wall)
			for (i = 0; i < self.walls.length; i ++)
				if (self.walls[i] == ob)
					self.walls = sliceHere(self.walls, i);
		
		if (ob instanceof self.Objekt)
			for (i = 0; i < self.objects.length; i ++)
				if (self.objects[i] == ob)
				{
					self.objects = sliceHere(self.objects, i);
					
					if (ob.n == "exitd")
						self.placedEx = false;
						
					if (ob.n == "entranced")
						self.placedEn = false;						
				}
	}
	
	self.parseInput = function()
	{
		if (input.ctrl && input.z && !self.undid)
		{
			self.undid = true;
			self.undo();
		}
		else if (!input.ctrl || !input.z)
		{
			self.undid = false;
		}
		
		if (input.plus && !self.plus)
		{
			self.plus = true;
			
			if (self.zone < levels.length - 1)
				self.zone ++;
		}
		else if (!input.plus)
			self.plus = false;

		if (input.minus && !self.minus)
		{
			self.minus = true;
			
			if (self.zone > 0)
				self.zone --;
		}
		else if (!input.minus)
			self.minus = false;
	}
	
	self.update = function()
	{	
		if (loaded)
		{		
			self.parseInput();
			self.draw();
		}
	}

	self.finish = function()
	{
		var i;
		
		/*
		for (i = 0; i < self.walls.length; i++)
			self.walls[i].rect = [self.walls[i].rect[0]*self.ratio, self.walls[i].rect[1]*self.ratio, self.walls[i].rect[2]*self.ratio, self.walls[i].rect[3]*self.ratio];

		for (i = 0; i < self.objects.length; i++)
			self.objects[i].pos = [self.ratio*(self.objects[i].pos[0] + (images[self.objects[i].img].width - images[self.objects[i].img].width*self.ratio)/2), self.ratio*(self.objects[i].pos[1] + (images[self.objects[i].img].height - images[self.objects[i].img].height*self.ratio))];
		*/
		
		var nwalls = self.walls.slice();
		
		for(i = 0; i < nwalls.length; i ++)
		{
			if (nwalls[i].tag == "del")
			{
				nwalls = sliceHere(nwalls, i);
				i --;
			}
			else
			{
				if (nwalls[i].rect[2] > nwalls[i].rect[3])
					nwalls[i].o = "h";
				else
					nwalls[i].o = "o";
			}
		}
		
		self.level = {"s": self.s, "n": self.n, "bg":self.bg, "color": self.color, "w": self.w, "h": self.h, "walls": nwalls, "objects": self.objects.slice()};
		
		if (self.mes)
		{
			for (i = 0; i < self.mes.length; i ++)
				if (self.mes[i] == "'" || self.mes[i] == '"')
				{
					self.mes = sliceHere(self.mes, i);
					i --;
				}
				
			self.level.mes = {"text": self.mes, "img": 23, "n": "AIMS" + self.n};
		}
		
		self.level = JSON.stringify(self.level);
		var display = window.open("", "display", "status=yes,height=400,width=400,scrollbar=0,location=0");		
		display.document.write("'" + self.level + "'");
	}
	
	
	canvas.addEventListener("mousemove", self.onMove);
	canvas.addEventListener("mousedown", self.onDown);
	canvas.addEventListener("mouseup", self.onUp);
	canvas.addEventListener("contextmenu", self.oncontextmenu);		
	document.addEventListener("keydown", press,false);
	document.addEventListener("keyup", release,false);
	
	var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
	canvas.addEventListener(mousewheelevt, self.onMouseWheel);		
	
	new self.Wall([0, 0, w, self.wallT], c);
	new self.Wall([0, 0, self.wallT, h], c);	
	new self.Wall([0, h - self.wallT, w, self.wallT], c);	
	new self.Wall([w - self.wallT, 0, self.wallT, h], c);	
	
	self.walls[0].tag = "del";
	self.walls[1].tag = "del";
	self.walls[2].tag = "del";
	self.walls[3].tag = "del";
}