// Global Variables
var DIRECTION = {
	IDLE: 0,
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4,
};

var rounds = [5, 5, 3, 3, 2];
var colors = ["#1abc9c", "#2ecc71", "#3498db", "#e74c3c", "#9b59b6"];

// The ball object (The cube that bounces back and forth)
var Ball = {
	new: function (incrementedSpeed) {
		return {
			width: 18,
			height: 18,
			x: this.canvas.width / 2 - 9,
			y: this.canvas.height / 2 - 9,
			moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 9,
		};
	},
};

// The paddle object (The two lines that move up and down)
var Paddle = {
	new: function (side) {
		return {
			width: 18,
			height: 70,
			x: side === "left" ? 150 : this.canvas.width - 150,
			y: this.canvas.height / 2 - 35,
			score: 0,
			move: DIRECTION.IDLE,
			speed: 10,
		};
	},
};

var Game = {
	initialize: function () {
		this.canvas = document.querySelector("canvas");
		this.context = this.canvas.getContext("2d");

		this.canvas.width = 1800;
		this.canvas.height = 1100;

		this.canvas.style.width = "60vw";
		this.canvas.style.height = "80vh";

		this.player = Paddle.new.call(this, "left");
		this.paddle = Paddle.new.call(this, "right");
		this.ball = Ball.new.call(this);

		this.paddle.speed = 8;
		this.running = this.over = false;
		this.turn = this.paddle;
		this.timer = this.round = 0;
		this.color = "#2c3e50";

		Pong.menu();
		Pong.listen();
		x;
	},

	endGameMenu: function (text) {
		// Change the canvas font size and color
		Pong.context.font = "50px Courier New";
		Pong.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		Pong.context.fillRect(Pong.canvas.width / 2 - 350, Pong.canvas.height / 2 - 48, 700, 100);

		// Change the canvas color;
		Pong.context.fillStyle = "#ffffff";

		// Draw the end game menu text ('Game Over' and 'Winner')
		Pong.context.fillText(text, Pong.canvas.width / 2, Pong.canvas.height / 2 + 15);

		setTimeout(function () {
			Pong = Object.assign({}, Game);
			Pong.initialize();
		}, 3000);
	},

	menu: function () {
		// Draw all the Pong objects in their current state
		Pong.draw();

		// Change the canvas font size and color
		this.context.font = "50px Courier New";
		this.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		this.context.fillRect(this.canvas.width / 2 - 350, this.canvas.height / 2 - 48, 700, 100);

		// Change the canvas color;
		this.context.fillStyle = "#ffffff";

		// Draw the 'press any key to begin' text
		this.context.fillText(
			"Press any key to begin",
			this.canvas.width / 2,
			this.canvas.height / 2 + 15
		);
	},

	// Update all objects (move the player, paddle, ball, increment the score, etc.)
	update: function () {
		if (!this.over) {
			// If the ball collides with the bound limits - correct the x and y coords.
			if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
			if (this.ball.x >= this.canvas.width - this.ball.width)
				Pong._resetTurn.call(this, this.player, this.paddle);
			if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
			if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

			// Move player if they player.move value was updated by a keyboard event
			if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
			else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;

			// On new serve (start of each turn) move the ball to the correct side
			// and randomize the direction to add some challenge.
			if (Pong._turnDelayIsOver.call(this) && this.turn) {
				this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
				this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
				this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
				this.turn = null;
			}

			// If the player collides with the bound limits, update the x and y coords.
			if (this.player.y <= 0) this.player.y = 0;
			else if (this.player.y >= this.canvas.height - this.player.height)
				this.player.y = this.canvas.height - this.player.height;

			// Move ball in intended direction based on moveY and moveX values
			if (this.ball.moveY === DIRECTION.UP) this.ball.y -= this.ball.speed / 1.5;
			else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += this.ball.speed / 1.5;
			if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
			else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;

			// Handle paddle (AI) UP and DOWN movement
			if (this.paddle.y > this.ball.y - this.paddle.height / 2) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed / 1.5;
				else this.paddle.y -= this.paddle.speed / 4;
			}
			if (this.paddle.y < this.ball.y - this.paddle.height / 2) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed / 1.5;
				else this.paddle.y += this.paddle.speed / 4;
			}

			// Handle paddle (AI) wall collision
			if (this.paddle.y >= this.canvas.height - this.paddle.height)
				this.paddle.y = this.canvas.height - this.paddle.height;
			else if (this.paddle.y <= 0) this.paddle.y = 0;

			// Handle Player-Ball collisions
			if (
				this.ball.x - this.ball.width <= this.player.x &&
				this.ball.x >= this.player.x - this.player.width
			) {
				if (
					this.ball.y <= this.player.y + this.player.height &&
					this.ball.y + this.ball.height >= this.player.y
				) {
					this.ball.x = this.player.x + this.ball.width;
					this.ball.moveX = DIRECTION.RIGHT;

					beep1.play();
				}
			}

			// Handle paddle-ball collision
			if (
				this.ball.x - this.ball.width <= this.paddle.x &&
				this.ball.x >= this.paddle.x - this.paddle.width
			) {
				if (
					this.ball.y <= this.paddle.y + this.paddle.height &&
					this.ball.y + this.ball.height >= this.paddle.y
				) {
					this.ball.x = this.paddle.x - this.ball.width;
					this.ball.moveX = DIRECTION.LEFT;

					beep1.play();
				}
			}
		}

		// Handle the end of round transition
		// Check to see if the player won the round.
		if (this.player.score === rounds[this.round]) {
			// Check to see if there are any more rounds/levels left and display the victory screen if
			// there are not.
			if (!rounds[this.round + 1]) {
				this.over = true;
				setTimeout(function () {
					Pong.endGameMenu("Winner!");
				}, 1000);
			} else {
				// If there is another round, reset all the values and increment the round number.
				this.color = this._generateRoundColor();
				this.player.score = this.paddle.score = 0;
				this.player.speed += 0.5;
				this.paddle.speed += 1;
				this.ball.speed += 1;
				this.round += 1;

				beep3.play();
			}
		}
		// Check to see if the paddle/AI has won the round.
		else if (this.paddle.score === rounds[this.round]) {
			this.over = true;
			setTimeout(function () {
				Pong.endGameMenu("Game Over!");
			}, 1000);
		}
	},

	// Draw the objects to the canvas element
	draw: function () {
		// Clear the Canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Set the fill style to black
		this.context.fillStyle = this.color;

		// Draw the background
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Set the fill style to white (For the paddles and the ball)
		this.context.fillStyle = "#ffffff";

		// Draw the Player
		this.context.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

		// Draw the Paddle
		this.context.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

		function displayCoordinates(context, x, y, text) {
			context.fillStyle = "white"; // Set the text color
			context.font = "32px Courier New"; // Set the font style
			context.fillText(text, x, y); // Adjust the position as needed
		}

		// Display the current coordinates as text
		const currentCoordinatesText = `X: ${this.ball.x.toFixed(2)}, Y: ${this.ball.y.toFixed(2)}`;
		const movevector = `moveX: ${this.ball.moveX}, moveY : ${this.ball.moveY}, speed : ${this.ball.speed}`;
		const moveDirection = ` ${
			this.ball.moveX === DIRECTION.LEFT
				? "moving left"
				: this.ball.moveX === DIRECTION.RIGHT
				? "moving right"
				: "???"
		}`;
		// Assuming you have the player and ball coordinates
		const playerX = this.player.x;
		const playerY = this.player.y;
		const ballX = this.ball.x;
		const ballY = this.ball.y;
		function calculateDistance(playerX, playerY, ballX, ballY) {
			return Math.sqrt((ballX - playerX) ** 2 + (ballY - playerY) ** 2);
		}
		function calculateBoundingCircle(ballX, ballY, playerX, playerY) {
			const centerX = (ballX + playerX) / 2;
			const centerY = (ballY + playerY) / 2;
			const radius = calculateDistance(ballX, ballY, playerX, playerY) / 2;

			return { centerX, centerY, radius };
		}
		const boundingCircle = calculateBoundingCircle(ballX, ballY, playerX, playerY);

		const distance = calculateDistance(playerX, playerY, ballX, ballY).toFixed(2);

		// Initialize variables for the components of the vector
		let xComponent;
		let yComponent;
		if (this.ball.moveX === DIRECTION.LEFT) {
			xComponent = -this.ball.moveX; // Negative value for leftward movement
		} else if (this.ball.moveX === DIRECTION.RIGHT) {
			xComponent = this.ball.moveX; // Positive value for rightward movement
		} else {
			// Handle other cases (e.g., no horizontal movement)
			xComponent = 0; // Set xComponent to 0 for no horizontal movement
		}
		if (this.ball.moveY === DIRECTION.UP) {
			yComponent = -this.ball.moveY;
			// as in  html canvas the top y value is 0, if it is moving up then y is decreasing. weird.
		} else if (this.ball.moveY === DIRECTION.DOWN) {
			yComponent = this.ball.moveY;
		}

		// to get the direction of vector, see https://en.wikipedia.org/wiki/Euclidean_vector#Basic_properties
		function VectorDirection(y, x) {
			return Math.atan2(y, x); // Returns the angle in radians
		}

		if (Pong._turnDelayIsOver.call(this)) {
			// Draw the ball
			this.context.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);

			const verticalDistanceraw = this.ball.y - this.player.y;
			const verticalDistance = ` v distance: ${this.ball.y - this.player.y}`;
			displayCoordinates(this.context, this.ball.x, this.ball.y + 150, verticalDistance);
			if (verticalDistanceraw !== 0) {
				// Define the starting and ending points for the line.
				const playerX = this.player.x;
				const ballY = this.ball.y;

				const rectWidth = this.player.width * 2; // Adjust the width of the rectangle as needed
				const rectHeight = this.player.height * 2; // Adjust the height of the rectangle as needed

				this.context.fillStyle = "rgba(133, 255, 199, 0.5)";
				this.context.setLineDash([]);
				this.context.lineWidth = 1;

				// Draw the rectangle centered at (playerX, ballY).
				const rectX = playerX - rectWidth / 2;
				const rectY = ballY - rectHeight / 2;

				// Draw the rectangle.
				this.context.fillRect(rectX, rectY, rectWidth, rectHeight);
			}
			// Draw a line from this.ball to this.player
			//  this.context.beginPath();
			//  this.context.moveTo(this.ball.x, this.ball.y); // Starting point
			//  this.context.lineTo(this.player.x, this.player.y); // Ending point
			//  this.context.strokeStyle = "red"; // Line color
			//  this.context.lineWidth = 2; // Line width
			//  this.context.stroke(); // Draw the line
			//  Now, you can draw the minimum bounding circle
			//  this.context.beginPath();
			//  this.context.arc(
			//	boundingCircle.centerX,
			//	boundingCircle.centerY,
			//	boundingCircle.radius,
			//	0,
			//	2 * Math.PI
			//	);
			//	this.context.strokeStyle = "#C2C1C2"; // Circle color
			//	this.context.lineWidth = 2; // Line width
			//	this.context.stroke(); // Draw the circle

			displayCoordinates(this.context, this.ball.x, this.ball.y + 50, currentCoordinatesText);

			displayCoordinates(this.context, 150, 200, movevector);

			displayCoordinates(this.context, 150, 250, moveDirection);
			displayCoordinates(this.context, this.ball.x, this.ball.y + 100, distance);
			this.context.strokeStyle = "black"; // Set the border color
			this.context.lineWidth = 4; // Set the line width
			// strokeRect works like this: strokeRect(x, y, width, height)
			this.context.strokeRect(
				this.ball.x - 15,
				this.ball.y - 15,
				this.ball.width + 30,
				this.ball.height + 30
			);
		}

		// Draw the net (Line in the middle)
		this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
		this.context.lineTo(this.canvas.width / 2, 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = "#ffffff";
		this.context.stroke();

		// Set the default canvas font and align it to the center
		this.context.font = "100px Courier New";
		this.context.textAlign = "center";

		// Draw the players score (left)
		this.context.fillText(this.player.score.toString(), this.canvas.width / 2 - 300, 200);

		// Draw the paddles score (right)
		this.context.fillText(this.paddle.score.toString(), this.canvas.width / 2 + 300, 200);

		// Change the font size for the center score text
		this.context.font = "30px Courier New";

		// Draw the winning score (center)
		this.context.fillText("Round " + (Pong.round + 1), this.canvas.width / 2, 35);

		// Change the font size for the center score value
		this.context.font = "40px Courier";

		// Draw the current round number
		this.context.fillText(
			rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
			this.canvas.width / 2,
			100
		);
	},

	loop: function () {
		Pong.update();
		Pong.draw();

		// If the game is not over, draw the next frame.
		if (!Pong.over) requestAnimationFrame(Pong.loop);
	},

	listen: function () {
		document.addEventListener("keydown", (event) => {
			if (!Pong.running) {
				Pong.running = true;
				window.requestAnimationFrame(Pong.loop);
			}

			switch (event.key) {
				case "ArrowUp":
				case "w":
				case "W":
					Pong.player.move = DIRECTION.UP;
					break;
				case "ArrowDown":
				case "s":
				case "S":
					Pong.player.move = DIRECTION.DOWN;
					break;
			}
		});

		// Stop the player from moving when there are no keys being pressed.
		document.addEventListener("keyup", function (key) {
			Pong.player.move = DIRECTION.IDLE;
		});
	},

	// Reset the ball location, the player turns and set a delay before the next round begins.
	_resetTurn: function (victor, loser) {
		this.ball = Ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = new Date().getTime();

		victor.score++;
		beep2.play();
	},

	// Wait for a delay to have passed after each turn.
	_turnDelayIsOver: function () {
		return new Date().getTime() - this.timer >= 1000;
	},

	// Select a random color as the background of each level/round.
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	},
};

var Pong = Object.assign({}, Game);
Pong.initialize();
