var Square =
{
	START: 1,
	PLAY: 2,
	GAME_OVER: 3,
	RESTART: 4,
	state: 1,
    init: function(width, height) {
		if(this.state == this.START)
		{
			var canvas = $('<canvas width="' + width + '" height="' + height + '"></canvas>');
			canvas.appendTo('.center');
			this.ctx = canvas.get(0).getContext("2d");
			this.ctx.font = "30px Arial";
			this.ctx.textAlign = "center";
		}
		
		this.score = 0;
		
		this.spawnRate = 3000; // In milliseconds
		this.difficultyRate = 3000;
		
		this.lastSpawn = new Date();		
		this.lastShot = new Date();
		this.lastDifficultyRaise = new Date();
		
		this.bullets = new Array();
		
		this.groundHeight = 600; // y coordinate for ground
		
		this.player = new this.PlayerCircle(240, this.groundHeight - 21, 20, 50);
		this.fireRate = 500; // In milliseconds
		
		this.enemyPower = 50;
		
		this.squares = new Array();
		this.squares.push(new this.EnemySquare(this.random(0, 380), 0, this.enemyPower, this.enemyPower, this.enemyPower));
		
		this.powerline = new this.PowerLine(this.random(1, 479), this.groundHeight, 1);
		
		this.state = this.PLAY;
		
		window.keydown = {};
		function keyName(event)
		{
			return hotkeys.specialKeys[event.which] ||
			String.fromCharCode(event.which).toLowerCase();
		}
		$(document).bind("keydown", function(event) {
			keydown[keyName(event)] = true;
			if(
			event.keyCode == 32 || // Space
			event.keyCode == 37 || // Left
			event.keyCode == 38 || // Up
			event.keyCode == 39 || // Right
			event.keyCode == 40) // Down
			{
				event.preventDefault();
			}
		});
		$(document).bind("keyup", function(event) {
			keydown[keyName(event)] = false;
		});
    },
    update: function() {
		if(this.state == this.PLAY)
		{
			for(var i = 0; i < this.squares.length; i++)
			{
				this.squares[i].y++;
			}
			for(var i = 0; i < this.bullets.length; i++)
			{
				this.bullets[i].y -= 4;
			}
			
			this.score++;
			
			var now = new Date();
			if(now.getTime() - this.lastSpawn.getTime() > this.spawnRate)
			{
				this.lastSpawn = new Date();
				this.squares.push(new this.EnemySquare(this.random(0, 380), -this.enemyPower, this.enemyPower, this.enemyPower, this.enemyPower));
			}
			
			if(keydown.left)
			{
				this.player.x -= 4;
			}
			else if(keydown.right)
			{
				this.player.x += 4;
			}
			
			now = new Date();
			if(keydown.space && now.getTime() - this.lastShot.getTime() > this.fireRate)
			{
				this.lastShot = new Date();
				this.bullets.push(new this.PlayerBullet(this.player.x, this.player.y, this.player.power / 10));
			}
			
			now = new Date();
			if(now.getTime() - this.lastDifficultyRaise.getTime() > this.difficultyRate)
			{
				this.spawnRate -= this.spawnRate / 50;
				this.enemyPower += 10;
				this.lastDifficultyRaise = new Date();
			}
			
			if(this.powerline.x <= this.player.x + this.player.radius && this.powerline.x >= this.player.x - this.player.radius)
			{
				this.player.power += this.powerline.power;
				do {
					this.powerline.x = this.random(1, 479);
				}while(this.powerline.x <= this.player.x + this.player.radius && this.powerline.x >= this.player.x - this.player.radius);
			}
			
			for(var i = 0; i < this.bullets.length; i++)
			{
				for(var j = 0; j < this.squares.length; j++)
				{
					if(
					this.bullets[i].x + this.bullets[i].radius <= this.squares[j].x + this.squares[j].width &&
					this.bullets[i].x + this.bullets[i].radius >= this.squares[j].x &&
					this.bullets[i].y + this.bullets[i].radius <= this.squares[j].y + this.squares[j].height ||
					this.bullets[i].x - this.bullets[i].radius <= this.squares[j].x + this.squares[j].width &&
					this.bullets[i].x - this.bullets[i].radius >= this.squares[j].x &&
					this.bullets[i].y - this.bullets[i].radius <= this.squares[j].y + this.squares[j].height
					)
					{
						this.bullets.splice(i, 1);
						this.squares[j].power -= this.player.power;
						break;
					}
				}
			}
			
			for(var i = 0; i < this.squares.length; i++)
			{
				if(this.squares[i].power <= 0)
				{
					this.squares.splice(i, 1);
				}
			}
			
			for(var i = 0; i < this.squares.length; i++)
			{
				if(this.squares[i].y + this.squares[i].height >= this.groundHeight)
				{
					this.state = this.GAME_OVER;
					return;
				}
			}
			
			if(this.bullets.length > 0)
			{
				if(this.bullets[this.bullets.length - 1].y + this.bullets[this.bullets.length - 1].radius < 0)
				{
					this.bullets.splice(this.bullets.length - 1);
				}
			}
		}
		if(this.state == this.GAME_OVER && keydown['return'])
		{
			this.init();
		}
	},
    draw: function() {
		this.ctx.clearRect(0, 0, 480, 640);
		
		if(this.state == this.PLAY)
		{
			this.ctx.strokeStyle = "#000000";
			for(var i = 0; i < this.squares.length; i++)
			{
				this.ctx.strokeRect(this.squares[i].x, this.squares[i].y, this.squares[i].width, this.squares[i].height);
			}
			this.ctx.strokeStyle = "#1f14ff";
			for(var i = 0; i < this.bullets.length; i++)
			{
				this.ctx.beginPath();
				this.ctx.arc(this.bullets[i].x, this.bullets[i].y, this.bullets[i].radius, 0, 2 * Math.PI, false);
				this.ctx.stroke();
			}
			
			this.ctx.strokeStyle = "#B24848";
			this.ctx.beginPath();
			this.ctx.moveTo(0, this.groundHeight);
			this.ctx.lineTo(480, this.groundHeight);
			this.ctx.stroke();
			
			this.ctx.strokeStyle = '#000000';
			this.ctx.strokeText(this.score, 240, this.groundHeight + 30);
			
			this.ctx.strokeStyle = "#7D3333";
			this.ctx.beginPath();
			this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, 2 * Math.PI, false);
			this.ctx.stroke();
			
			this.ctx.strokeStyle = "#1f14ff";
			this.ctx.beginPath();
			this.ctx.moveTo(this.powerline.x, this.powerline.y);
			this.ctx.lineTo(this.powerline.x, this.powerline.y - 50);
			this.ctx.stroke();
		}
		
		if(this.state == this.GAME_OVER)
		{
			this.ctx.strokeText('Score: ' + this.score, 240, 300);
			this.ctx.strokeText('Press \'Enter\' to play again.', 240, 400);
		}
    },
    EnemySquare: function(x, y, width, height, power) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.power = power;
	},
	PlayerCircle: function(x, y, radius, power) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.power = power;
	},
	PlayerBullet: function(x, y, radius) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	},
	PowerLine: function(x, y, power) {
		this.x = x;
		this.y = y;
		this.power = power;
	},
	random: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
