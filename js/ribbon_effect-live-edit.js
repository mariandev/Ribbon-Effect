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

var c={
	container: 'body',//element id
	points: {
		number: 50,
		color: 'random', //'random'/'shades'/'changeable'/hex/rgb/rbga/name
		move: true,
		teleport: false,
		speed: 3
	},
	links: {
		mouse: false,
		points: true,
		ribbon: true
	},
	canvas: {
		background: 'black',//random/hex/rgb/rbga/name
		cursor: true
	}
},change_c,g_session=0;

window.onload = function(){

	var oForm = document.forms[0];
	
	change_c = function(){
		/*c = {
			container: 'body',//element id
			points: {
				number: 50,
				color: oForm.elements["color"].value, //'random'/'shades'/'changeable'/hex/rgb/rbga/name
				move: Boolean(oForm.elements["move"].value),
				teleport: Boolean(oForm.elements["teleport"].value),
				speed: parseInt(oForm.elements["speed"].value)
			},
			links: {
				mouse: Boolean(oForm.elements["mouse"].value),
				points: Boolean(oForm.elements["points"].value),
				ribbon: Boolean(oForm.elements["ribbon"].value)
			},
			canvas: {
				background: 'black',//random/hex/rgb/rbga/name
				cursor: true
			}
		};*/

		if(oForm.elements["color"].value === 'gradient')
			c.points.color = [oForm.elements["color1"].value,oForm.elements["color2"].value];
		else
			c.points.color = oForm.elements["color"].value;
		c.points.number = oForm.elements["number"].value;
		c.points.move = Boolean(oForm.elements["move"].value);
		c.points.teleport = Boolean(oForm.elements["teleport"].value);
		c.points.speed = parseInt(oForm.elements["speed"].value);
		c.links.mouse = Boolean(oForm.elements["mouse"].value);
		c.links.points = Boolean(oForm.elements["points"].value);
		c.links.ribbon = Boolean(oForm.elements["ribbon"].value);
		console.log('Update');
		var canvas = document.getElementById('ribbon_effect');
		canvas.parentNode.removeChild(canvas);
		ribbon_effect(++g_session);
	}

	ribbon_effect(++g_session);
};

function ribbon_effect(session){
	function e(t){throw new Error(t);}
	if(!c.container) e('RibbonEffect: Container not defined');
	if(!c.canvas) c.canvas = {};
		if(!c.canvas.background) c.canvas.background='black';
		if(!c.canvas.width) c.canvas.width=parseInt(document.getElementById(c.container).offsetWidth);
		if(!c.canvas.height) c.canvas.height=parseInt(document.getElementById(c.container).offsetHeight);
	if(!c.points) c.points={};
		if(!c.points.number) c.points.number=Math.round(((c.canvas.width/50)+(c.canvas.height/50))/1);
		if(!c.points.color) c.points.color='random';

	console.log(c);

	var canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		points = [],
		link_max_distance = Math.round(200/(c.points.number/50));

	if(c.points.color === 'shades' || c.points.color === 'changeable')
		var h_angle = Math.floor(Math.random()*360);
	
	var mouse = {
		x: 0,
		y: 0,
		move: false,
		color: ''
	};
	if(c.points.color === 'random'){
		mouse.color = 'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')'; 
	}else if(c.points.color === 'shades' || c.points.color === 'changeable'){
		mouse.color = 'hsl('+h_angle+',50%,50%)';
	}else if(typeof c.points.color === 'object'){
		var gcanvas = document.createElement('canvas'),
			gctx = gcanvas.getContext('2d');
		gcanvas.width = 100;
		gcanvas.height = 1;
		var g = gctx.createLinearGradient(0,0,100,0);
		for(var i=0;i<c.points.color.length;i++)
			g.addColorStop((i/(c.points.color.length-1)),c.points.color[i]);
		gctx.fillStyle = g;
		gctx.fillRect(0,0,100,1);
		var gpx = gctx.getImageData(0,0,100,1).data;
		function getGradientColor(x){
			var per = Math.floor(Math.floor(x)/(c.canvas.width/100))*4;
			return [(gpx[per]===undefined?0:gpx[per]),(gpx[per+1]===undefined?0:gpx[per+1]),(gpx[per+2]===undefined?0:gpx[per+2])]
		}
	}else{
		this.color = c.points.color;
	}

	canvas.width = c.canvas.width;
	canvas.height = c.canvas.height;
	canvas.style.background = c.canvas.background;
	canvas.setAttribute("id", "ribbon_effect");

	function Point(){
		this.x = Math.random()*c.canvas.width;
		this.y = Math.random()*c.canvas.height;
		if(c.points.speed === 'random') this.s = Math.random()*5;
		else this.s = c.points.speed;
		this.a = Math.random()*360; //angle
		this.a_sin = Math.sin(this.a*Math.PI/180);
		this.a_cos = Math.cos(this.a*Math.PI/180);

		if(c.points.color === 'random'){
			var r  = Math.floor(Math.random()*255);
			var g  = Math.floor(Math.random()*255);
			var b  = Math.floor(Math.random()*255);
			var a  = Math.random();
			this.color = 'rgba('+r+','+g+','+b+','+a+')'; //color
		}else if(c.points.color === 'shades' || c.points.color === 'changeable'){
			this.hsl = {
				s:(Math.random()*50+25),
				l: (Math.random()*25+13)
			};
			this.sd = 1;
			this.ld = 1;
			this.color = 'hsl('+h_angle+','+this.hsl.s+'%,'+this.hsl.l+'%)';
		}else if(typeof c.points.color === 'object'){
			var colors = getGradientColor(this.x);
			this.color = 'rgb('+colors[0]+','+colors[1]+','+colors[2]+')';
		}else{
			this.color = c.points.color;
		}
	}

	for(var i=0;i<c.points.number;i++)
		points.push(new Point());

	window.addEventListener('mousemove',function(e){
		mouse.x = e.clientX;
		mouse.y = e.clientY;
		mouse.move = true;
	});
	/*window.addEventListener('click',function(e){
		//mouse.increase_link_distance = !mouse.increase_link_distance;
		c.points.move=!c.points.move;
	});*/
	window.addEventListener('resize',function(e){
		canvas.width = c.canvas.width = parseInt(document.getElementById(c.container).offsetWidth);
		canvas.height = c.canvas.height = parseInt(document.getElementById(c.container).offsetHeight);
	},false);

	function draw(){

		function drawLine(x1,y1,x2,y2,c1,c2){
			ctx.beginPath();
			ctx.lineWidth = 1;
			ctx.moveTo(x1,y1);
			ctx.lineTo(x2,y2);

			if(c.points.color === 'random'){
				var c3 = ctx.createLinearGradient(x1,y1,x2,y2);
					c3.addColorStop(0,c1);
					c3.addColorStop(1,c2);
			}else{
				var c3 = c1;
			}

			ctx.strokeStyle = c3;
			ctx.stroke();
		}

		ctx.globalCompositeOperation = "source-over";
		if(c.links.ribbon) ctx.globalAlpha = 0.1;
		ctx.fillStyle = c.canvas.background;
		ctx.fillRect(0, 0, c.canvas.width, c.canvas.height);
		if(c.links.ribbon) ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "lighter";

		for(var i=0;i<points.length;i++){
			var p=points[i];
			if(c.points.color === 'changeable' || c.points.color === 'shades'){
				if(c.points.color === 'shades'){
					p.hsl.s+=p.sd;
					//p.hsl.l+=p.ld;
					if(p.hsl.s >= 100 || p.hsl.s <= 0) p.sd*=-1;
					//if(p.hsl.l >= 100 || p.hsl.l <= 0) p.ld*=-1;
				}
				p.color = 'hsl('+h_angle+','+p.hsl.s+'%,'+p.hsl.l+'%)';
			}

			if(c.links.points && c.points.move){
				for(var j=0;j<points.length;j++){
					if(i != j){
						var p2 = points[j],
							xd = p2.x - p.x,
							yd = p2.y - p.y,
							d = Math.sqrt(xd*xd+yd*yd);
						if(d<link_max_distance && d>0){
							drawLine(p.x,p.y,p2.x,p2.y,p.color,p2.color);
						}
					}
				}
			}

			if(c.links.mouse){
				var p2 = mouse,
					xd = p2.x - p.x,
					yd = p2.y - p.y,
					d = Math.sqrt(xd*xd+yd*yd);
				if(d<link_max_distance && d>0 && mouse.move)
					drawLine(p.x,p.y,p2.x,p2.y,p.color,p2.color);
			}

			if(c.points.move){
				p.x+=p.s*p.a_cos;
				p.y+=p.s*p.a_sin;
				if(c.points.teleport){
					if(p.x<0)p.x=c.canvas.width;
					if(p.x>c.canvas.width)p.x=0;
					if(p.y<0)p.y=c.canvas.height;
					if(p.y>c.canvas.height)p.y=0;
				}else{
					if(p.x<0){
						if(p.a<=180){
							p.a = 180-p.a;
						}else{
							p.a = 270+(90-(p.a-180));
						}
					}else if(p.x>c.canvas.width){
						if(p.a>270){
							p.a=(360-p.a)+180;
						}else{
							p.a=(90-p.a)+90
						}
					}
					if(p.y<0){
						if(p.a<=90){
							p.a=270+(90-p.a);
						}else{
							p.a=270-(p.a-90);
						}
					}else if(p.y>c.canvas.height){
						if(p.a<270){
							p.a=180-(p.a-180);
						}else{
							p.a-=270;
						}
					}
					p.a_sin = Math.sin(p.a*Math.PI/180);
					p.a_cos = Math.cos(p.a*Math.PI/180);
				}
			}
		}
		if(c.points.color === 'changeable')
			h_angle = h_angle+1>=360?0:h_angle+1;
	}

	document.getElementById(c.container).appendChild(canvas);
	//req anim
	(function anim_loop(){
		if(g_session === session)window.requestAnimFrame(anim_loop);
		draw();
	})()
}