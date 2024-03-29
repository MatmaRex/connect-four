/*global $ */

// Controls the HTML user interface.
function GameUI( $element ) {
	this.$element = $element;
}

// Creates a form that lets the user begin the game.
GameUI.prototype.setUp = function () {
	var that = this;
	
	this.$element.empty();
	
	var $name1 = $( '<input type=text>' ).attr( 'placeholder', 'Player name' );
	var $type1 = $( '<select>' ).append(
		$( '<option>' ).text( 'Human' ),
		$( '<option>' ).text( 'Computer' )
	);
	
	var $name2 = $name1.clone();
	var $type2 = $type1.clone();
	
	var $form = $( '<form>' ).append(
		$( '<p>' ).append( 'Player 1: ', $name1, ' ', $type1 ),
		$( '<p>' ).append( 'Player 2: ', $name2, ' ', $type2 ),
		$( '<input type=submit>' ).val( 'Play!' )
	);
	
	// Resetting a game? Reuse current settings as defaults.
	if ( this.board ) {
		$name1.val( this.board.players[0].name );
		$name2.val( this.board.players[1].name );
		$type1[0].selectedIndex = this.board.players[0] instanceof AIPlayer ? 1 : 0;
		$type2[0].selectedIndex = this.board.players[1] instanceof AIPlayer ? 1 : 0;
	}
	
	this.$element.append( $form );
	
	$form.on( 'submit', function ( e ) {
		e.preventDefault();
		
		var name1 = $name1.val();
		var type1 = $type1.val() === 'Human' ? HumanPlayer : AIPlayer;
		var name2 = $name2.val();
		var type2 = $type2.val() === 'Human' ? HumanPlayer : AIPlayer;
		
		// If a name isn't provided, use "Human", "Human 1", "Human 2", "Computer", …
		if ( !name1 ) {
			name1 = $type1.val();
		}
		if ( !name2 ) {
			name2 = $type2.val();
		}
		if ( name1 === name2 ) {
			name1 += ' 1';
			name2 += ' 2';
		}
		
		that.$element.empty();
		
		that.begin(
			new type1( 0, name1 ),
			new type2( 1, name2 )
		);
	} );
};

// Begins the game. Sets up game board and internal objects, starts first turn.
GameUI.prototype.begin = function ( player1, player2 ) {
	var that = this;
	this.board = new Board( player1, player2, {
		moveCompleted: function ( column, player, board ) {
			that.emptyColumnCells[column].pop()
				.text( player.id )
				.addClass( 'game-board-player-' + player.id );
			that.$gameTicker.text( 'Now playing: ' + board.getNextPlayer().name + '.' );
		},
		moveInvalid: function ( column, player, board ) {
			that.$gameTicker.text( player.name + ' attempted invalid move: column ' + column + '.' );
		},
		gameOver: function ( player, board ) {
			if ( player ) {
				that.$gameTicker.text( 'Game over! And the winner is: ' + player.name + '!' );
			} else {
				that.$gameTicker.text( 'The game ended in a draw.' );
			}
			
			that.$gameTicker.after(
				$( '<button>' ).text( 'Play again?' ).on( 'click', function () {
					that.setUp();
				} )
			);
		}
	} );
	
	this.emptyColumnCells = [];
	this.buildBoard();
	
	this.$gameTicker.text( 'Now playing: ' + this.board.getNextPlayer().name + '.' );
	this.board.nextTurn();
};

// Build game board DOM.
GameUI.prototype.buildBoard = function () {
	var that = this;
	var $table, $row, $cell, i, j;

	$table = $( '<table>' ).addClass( 'game-board' );
	
	// Header - control cells
	$row = $( '<tr>' ).addClass( 'game-control' );
	for ( j = 0; j < this.board.columns; j++ ) {
		/*jshint loopfunc:true */
		( function ( col ) {
			$row.append(
				$( '<th>' )
					.attr( 'tabindex', 0 )
					.attr( 'title', 'Place a disc in column ' + col )
					.text( col )
					.on( 'click keypress', function () {
						that.board.getNextPlayer().clicked( col );
					} )
			);
		} )( j );
	}
	$table.append( $row );
	
	// Game cells
	for ( i = 0; i < this.board.rows; i++ ) {
		$row = $( '<tr>' );
		for ( j = 0; j < this.board.columns; j++ ) {
			$cell = $( '<td>' ).text( '-' );
			if ( i === 0 ) {
				this.emptyColumnCells[ j ] = [];
			}
			this.emptyColumnCells[ j ].push( $cell );
			
			$row.append( $cell );
		}
		
		$table.append( $row );
	}
	
	this.$gameTicker = $( '<p>' );
	
	this.$element.append( $table, this.$gameTicker );
};

// Controls game board state, including turn progression.
// 
// Fires callbacks when things happen. It could use some event-based system, but it's not really
// worth it.
function Board( player1, player2, callbacks ) {
	this.columns = 7;
	this.rows = 6;
	
	this.data = [];
	for ( var i = 0; i < this.columns; i++ ) {
		this.data[i] = [];
	}
	
	this.callbacks = $.extend( {
		moveCompleted: $.noop,
		moveInvalid: $.noop
	}, callbacks );
	
	this.players = [ player1, player2 ];
	this.nextPlayerTurn = 0;
}

// Returns a player object for the player whose move will be recorded next.
Board.prototype.getNextPlayer = function () {
	return this.players[ this.nextPlayerTurn ];
};

// Starts next turn.
// 
// When the turn is finished, game over conditions are checked and the game stops or another turn
// is started.
Board.prototype.nextTurn = function () {
	var that = this;
	this.getNextPlayer().takeTurn( this ).done( function ( column ) {
		var currentPlayer = that.getNextPlayer();
		if ( that.performMove( column ) ) {
			that.nextPlayerTurn = ( that.nextPlayerTurn + 1 ) % 2;
			that.callbacks.moveCompleted( column, currentPlayer, that );
		} else {
			that.callbacks.moveInvalid( column, currentPlayer, that );
		}
		
		if ( that.isGameOver() ) {
			that.callbacks.gameOver( that.getWinner(), that );
		} else {
			that.nextTurn();
		}
	} );
};

// The game is over if one of the players connected four or there is no more space to place dots.
Board.prototype.isGameOver = function () {
	var that = this;
	return !!this.getWinner() || this.data.every( function ( val ) {
		return val.length === that.rows;
	} );
};

// Returns the player object for the winner, or null if game isn't over or ended in a draw.
Board.prototype.getWinner = function () {
	return this.findHorizontalFour() || this.findVerticalFour() || this.findDiagonalFour();
};

// Returns a player who has a horizontal four on board, or null.
Board.prototype.findHorizontalFour = function () {
	for ( var row = 0; row < this.rows; row++ ) {
		for ( var startColumn = 0; startColumn < this.columns - 3; startColumn++ ) {
			var color = this.data[startColumn][row];
			if ( color === undefined ) {
				continue;
			}
			
			if (
				this.data[startColumn][row] === color &&
				this.data[startColumn+1][row] === color &&
				this.data[startColumn+2][row] === color &&
				this.data[startColumn+3][row] === color
			) {
				return color;
			}
		}
	}
	return null;
};

// Returns a player who has a vertical four on board, or null.
Board.prototype.findVerticalFour = function () {
	for ( var startRow = 0; startRow < this.rows - 3; startRow++ ) {
		for ( var column = 0; column < this.columns; column++ ) {
			var color = this.data[column][startRow];
			if ( color === undefined ) {
				continue;
			}
			
			if (
				this.data[column][startRow] === color &&
				this.data[column][startRow+1] === color &&
				this.data[column][startRow+2] === color &&
				this.data[column][startRow+3] === color
			) {
				return color;
			}
		}
	}
	return null;
};

// Returns a player who has a diagonal four on board, or null.
Board.prototype.findDiagonalFour = function () {
	var that = this;
	function checkDiagonalsInOneDirection( dir ) {
		var i;
		var firstCellColumn = dir === -1 ? 0 : -that.rows;
		for ( ; firstCellColumn < that.columns + that.rows; firstCellColumn++ ) {
			var cells = [];
			for ( i = 0; i < that.rows; i++ ) {
				var col = firstCellColumn + ( i * dir );
				var row = i;
				if ( col >= 0 && col < that.columns && row >= 0 && row < that.rows ) {
					cells.push( that.data[col][row] );
				}
			}
			if ( cells.length >= 4 ) {
				for ( i = 0; i < cells.length - 3; i++ ) {
					var color = cells[i];
					if ( color === undefined ) {
						continue;
					}
					
					if (
						cells[i] === color &&
						cells[i+1] === color &&
						cells[i+2] === color &&
						cells[i+3] === color
					) {
						return color;
					}
				}
			}
		}
		return null;
	}
	
	return checkDiagonalsInOneDirection( 1 ) || checkDiagonalsInOneDirection( -1 );
};

// Checks if this move is correct and if so, places a disc for current played into the given column.
// Returns whether the move was valid.
Board.prototype.performMove = function ( column ) {
	if ( column < 0 || column > this.columns ) {
		return false;
	}
	
	// Is this column already full?
	if ( this.data[column].length === this.rows ) {
		return false;
	}
	
	this.data[column].push( this.getNextPlayer() );
	return true;
};

// Encapsulates a human player.
function HumanPlayer( id, name ) {
	this.id = id;
	this.name = name;
	this.currentDeferred = null;
}

// Allows the user to input their move using the game board.
HumanPlayer.prototype.takeTurn = function ( board ) {
	this.currentDeferred = $.Deferred();
	return this.currentDeferred;
};

// Game board UI callback. Registers user's move in the clicked column.
HumanPlayer.prototype.clicked = function ( column ) {
	if ( this.currentDeferred ) {
		this.currentDeferred.resolve( column );
	}
};

// Encapsulates a computer player.
function AIPlayer( id, name ) {
	this.id = id;
	this.name = name;
}

// Inputs computer player's move. This is done after a delay of 200 ms to feel more natural to
// humans playing or watching the game.
AIPlayer.prototype.takeTurn = function ( board ) {
	// Not a very smart opponent… it just chooses a random valid column and places a disc there.
	var deferred = $.Deferred();
	
	var validColumns = board.data.map( function ( val, index ) {
		return val.length === board.rows ? null : index;
	} ).filter( function ( val ) {
		return val !== null;
	} );
	
	setTimeout( function () {
		var column = validColumns[ Math.floor( Math.random() * validColumns.length ) ];
		deferred.resolve( column );
	}, 200 );
	return deferred;
};

// Game board UI callback. Does nothing, obviously.
AIPlayer.prototype.clicked = function ( column ) {
	return;
};
