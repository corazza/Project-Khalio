var KEY = {W: 87, A: 65, S:83, D: 68, E: 69, ONE: 49, CTRL:17, Z:90, P: 107, M: 109, SH: 16};

var input = {
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

function press(evt) 
{
	if (!ni)
	{
		//evt = window.event;
		var code = evt.which || evt.keyCode;

		switch(code) 
		{
			case KEY.W: input.up = true; break;
			case KEY.A: input.left = true; break;
			case KEY.S: input.down = true; break;
			case KEY.D: input.right = true; break;
			case KEY.E: input.e = true; break;
			case KEY.Z: input.z = true; break;
			case KEY.ONE: input.one = true; break;
			case KEY.CTRL: input.ctrl = true; break;
			case KEY.P: input.plus = true; break;
			case KEY.M: input.minus = true; break;
			case KEY.SH: input.shift = true; break;
		}
	}
}

function release(evt)
{
	if (!ni)
	{
		//evt = window.event;
		var code = evt.which || evt.keyCode;
		
		switch(code) 
		{
			case KEY.W: input.up = false; break;
			case KEY.A: input.left = false; break;
			case KEY.S: input.down = false; break;
			case KEY.D: input.right = false; break;        
			case KEY.E: input.e = false; break;
			case KEY.Z: input.z = false; break;
			case KEY.ONE: input.one = false; break;
			case KEY.CTRL: input.ctrl = false; break;
			case KEY.P: input.plus = false; break;
			case KEY.M: input.minus = false; break;
			case KEY.SH: input.shift = false; break;
		}
	}
}

