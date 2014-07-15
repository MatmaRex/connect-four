/*global QUnit, Board */

QUnit.test( "Board#findHorizontalFour", function ( assert ) {
	var board;
	
	board = new Board( 'pl1', 'pl2' );
	board.data[0][0] = 'pl2';
	board.data[1][0] = 'pl2';
	board.data[2][0] = 'pl2';
	board.data[3][0] = 'pl2';
	assert.strictEqual( board.findHorizontalFour(), 'pl2' );
	
	board = new Board( 'pl1', 'pl2' );
	board.data[3][0] = 'pl2';
	board.data[4][0] = 'pl2';
	board.data[5][0] = 'pl2';
	board.data[6][0] = 'pl2';
	assert.strictEqual( board.findHorizontalFour(), 'pl2' );
	
} );

QUnit.test( "Board#findVerticalFour", function ( assert ) {
	var board;
	
	board = new Board( 'pl1', 'pl2' );
	board.data[0][0] = 'pl2';
	board.data[0][1] = 'pl2';
	board.data[0][2] = 'pl2';
	board.data[0][3] = 'pl2';
	assert.strictEqual( board.findVerticalFour(), 'pl2' );
	
	board = new Board( 'pl1', 'pl2' );
	board.data[6][0] = 'pl2';
	board.data[6][1] = 'pl2';
	board.data[6][2] = 'pl2';
	board.data[6][3] = 'pl2';
	assert.strictEqual( board.findVerticalFour(), 'pl2' );
	
} );

QUnit.test( "Board#findDiagonalFour", function ( assert ) {
	var board;
	
	board = new Board( 'pl1', 'pl2' );
	board.data[0][1] = 'pl2';
	board.data[1][2] = 'pl2';
	board.data[2][3] = 'pl2';
	board.data[3][4] = 'pl2';
	assert.strictEqual( board.findDiagonalFour(), 'pl2' );
	
	board = new Board( 'pl1', 'pl2' );
	board.data[3][5] = 'pl2';
	board.data[4][4] = 'pl2';
	board.data[5][3] = 'pl2';
	board.data[6][2] = 'pl2';
	assert.strictEqual( board.findDiagonalFour(), 'pl2' );
} );
