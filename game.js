// Controls overall game state, like the players and turn progression.
function Game() {
	this.hasBegun = false;
	this.players = [];
	this.nextPlayerTurn = 0;
	
}

Game.prototype.setUp = function () {
	
};

Game.prototype.begin = function () {
	
};

// Controls game board state.
function Board( turnCallback ) {
	
}

Board.prototype.nextTurn = function () {
	
};

function HumanPlayer( id ) {
	this.id = id;
}

HumanPlayer.prototype.takeTurn = function ( board ) {
	
};

HumanPlayer.prototype.clicked = function ( column ) {
	
};

function AIPlayer( id ) {
	this.id = id;
}

AIPlayer.prototype.takeTurn = function ( board ) {
	
};

AIPlayer.prototype.clicked = function ( column ) {
	
};
