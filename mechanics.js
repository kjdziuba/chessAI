const SEARCH_DEPTH = 3;

var board = null
var game = new Chess()


function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}

function makeRandomMove () {
  var possibleMoves = game.moves()

  // game over
  if (possibleMoves.length === 0) return

  var randomIdx = Math.floor(Math.random() * possibleMoves.length)
  game.move(possibleMoves[randomIdx])
  board.position(game.fen())
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  // make move
  window.setTimeout(chooseMove, 50)
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)


function chooseMove(){
  var possibleMoves = game.moves()
  console.log(game.board()[4][1])

  //game over
  if (possibleMoves.length === 0) return
  var bestScore = -Infinity;
  var currentMove =  null
  var bestMove = null

  var testedGame = null
  for(var i = 0; i < possibleMoves.length; i++){
    testedGame = deepCopyFunction(game)
    testedGame.move(possibleMoves[i])
    var eval = minimax(testedGame, SEARCH_DEPTH-1, -Infinity, Infinity, false)
    if(eval > bestScore){
      bestScore = eval
      bestMove = possibleMoves[i]
    }
    testedGame.undo()
  }
  console.log(bestMove)
  game.move(bestMove)
  board.position(game.fen())
  return bestMove


}

function minimax(game, depth, alpha, beta, isMaximising){
  if(depth == 0){
    return -evaluateBoard(game.board())
  }
  var possibleMoves = game.moves()

  if(isMaximising){
    var maxEval = -Infinity
    var testedGame = null
    for(var i = 0; i < possibleMoves.length; i++){
      testedGame = deepCopyFunction(game)
      testedGame.move(possibleMoves[i])
      var eval = minimax(testedGame, depth-1, alpha, beta, false)
      testedGame.undo()
      if(eval > maxEval){
        maxEval = eval;
      }
      alpha = Math.max(alpha, eval);
      //cut the branch if known that it cant get better
      if(beta <= alpha) break
    }
    return maxEval
  }else{
    var minEval = Infinity
    var testedGame = null
    for(var i = 0; i < possibleMoves.length; i++){
      testedGame = deepCopyFunction(game)
      testedGame.move(possibleMoves[i])
      var eval = minimax(testedGame, depth-1, alpha, beta, true)
      testedGame.undo()
      if( eval < minEval){
        minEval = eval;
      }
      beta = Math.max(beta, eval);
      //cut the branch if known that it cant get better
      if(beta <= alpha) break
    }
    return minEval
  }


}

var evaluateBoard = function (board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
          totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
      }
  }
  console.log(totalEvaluation)
  return totalEvaluation;
};

var reverseArray = function(array) {
  return array.slice().reverse();
};

var pawnEvalWhite =
  [
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
      [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
      [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
      [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
      [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
      [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
      [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
  ];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval =
  [
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
      [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
      [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
      [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
      [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
      [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
      [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
  ];

var bishopEvalWhite = [
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
  [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
  [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite);




var getPieceValue = function (piece, x, y) {
  if (piece === null) {
      return 0;
  }
  var getAbsoluteValue = function (piece, isWhite, x ,y) {
      if (piece.type === 'p') {
          return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
      } else if (piece.type === 'r') {
          return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
      } else if (piece.type === 'n') {
          return 30 + knightEval[y][x];
      } else if (piece.type === 'b') {
          return 30 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
      } else if (piece.type === 'q') {
          return 90 + evalQueen[y][x];
      } else if (piece.type === 'k') {
          return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
      }
      throw "Unknown piece type: " + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

const deepCopyFunction = (inObject) => {
  let outObject, value, key

  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }

  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}

  for (key in inObject) {
    value = inObject[key]

    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = deepCopyFunction(value)
  }

  return outObject
}
