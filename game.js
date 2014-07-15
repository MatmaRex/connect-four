/*global $, console */

// Controls overall game state, like the players and turn progression.
function Game( $element ) {
	this.hasBegun = false;
	this.$element = $element;
}

Game.prototype.setUp = function () {
	var that = this;
	
	var $name1 = $( '<input type=text>' ).attr( 'placeholder', 'Player name' );
	var $type1 = $( '<select>' ).append(
		$( '<option>' ).text( 'Human' ),
		$( '<option>' ).text( 'Computer' )
	);
	
	var $name2 = $name1.clone();
	var $type2 = $type1.clone();
	
	var $errorMessage = $( '<p>' ).addClass( 'error' );
	
	var $form = $( '<form>' ).append(
		$( '<p>' ).append( 'Player 1: ', $name1, ' ', $type1 ),
		$( '<p>' ).append( 'Player 2: ', $name2, ' ', $type2 ),
		$( '<input type=submit>' ),
		$errorMessage
	);
	
	this.$element.append( $form );
	
	$form.on( 'submit', function ( e ) {
		e.preventDefault();
		
		var name1 = $name1.val();
		var name2 = $name2.val();
		
		if ( !name1 || !name2 || name1 === name2 ) {
			$errorMessage.text( 'You must provide unique name for both players, dummy!' );
			return;
		}
		
		var type1 = $type1.val() == 'Human' ? HumanPlayer : AIPlayer;
		var type2 = $type1.val() == 'Human' ? HumanPlayer : AIPlayer;
		
		that.$element.empty();
		
		that.begin(
			new type1( 0, name1 ),
			new type2( 1, name2 )
		);
	} );
};

Game.prototype.begin = function ( player1, player2 ) {
	this.hasBegun = true;
	this.players = [ player1, player2 ];
	this.nextPlayerTurn = 0;
	this.board = new Board( function ( move ) {
		console.log( move );
	} );
	
	this.columnCells = [];
	
	this.buildBoard();
};

Game.prototype.buildBoard = function () {
	var that = this;
	var $table, $row, $cell, i, j, $summary;

	$table = $( '<table>' ).addClass( 'game-board' );
	
	// Header - control cells
	$row = $( '<tr>' ).addClass( 'game-control' );
	for ( j = 0; j < this.board.columns; j++ ) {
		/*jshint loopfunc:true */
		( function ( col ) {
			$row.append(
				$( '<th>' ).on( 'click', function () {
					that.players[ that.nextPlayerTurn ].clicked( col );
				} )
			);
		} )( j );
	}
	$table.append( $row );
	
	// Game cells
	for ( i = 0; i < this.board.rows; i++ ) {
		$row = $( '<tr>' );
		for ( j = 0; j < this.board.columns; j++ ) {
			$cell = $( '<td>' );
			if ( i === 0 ) {
				this.columnCells[ j ] = [];
			}
			this.columnCells[ j ].push( $cell );
			
			$row.append( $cell );
		}
		
		$table.append( $row );
	}
	
	$summary = $( '<p>' );
	
	this.$element.append( $table, $summary );
};

// Controls game board state.
function Board( turnCallback ) {
	this.columns = 7;
	this.rows = 6;
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
