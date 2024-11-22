// Get game elements
var jet = document.getElementById("jet");
var board = document.getElementById("board");
var scoreElement = document.getElementById("points");
var finalScoreElement = document.getElementById("final-score");
var gameOverOverlay = document.getElementById("game-over-overlay");
var rocks = document.getElementsByClassName("rocks");
var score = 0;
var gameOver = false;


// Global scaling factors based on screen size
var screenWidth = window.outerWidth;
var screenHeight = window.innerHeight;
var boardWidth = screenWidth * 0.7; // 90% of screen width
var boardHeight = screenHeight * 0.7; // 80% of screen height
var jetWidth = boardWidth * 0.03; // Jet is 10% of board width
var jetHieght = boardHeight * 0.08;


var rocksWidth = jetWidth * 1.6;





var generaterocks, moverocks;
// Variables to hold the intervals
var moveInterval;
var shootInterval;



// Object to track which keys are pressed
var keysPressed = {};
var lastShotTime = 0; // Track the last bullet shot time




// Adjust game dimensions dynamically
function adjustDimensions() {
  board.style.width = boardWidth + "px";
  board.style.height = boardHeight + "px";
  jet.style.width = jetWidth + "px";
  jet.style.height = jetHieght + "px";
  jet.style.left = (boardWidth / 2 - jetWidth / 2) + "px"; // Center jet




  // Convert HTMLCollection to an array and iterate using forEach
  Array.from(rocks).forEach(function(rock) {
  rock.style.width = rocksWidth + "px";
  rock.style.height = rocksWidth + "px"


});


}






// Call this function whenever the screen size changes
window.addEventListener("resize", () => {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  boardWidth = screenWidth * 0.7;
  boardHeight = screenHeight * 0.7;
  jetWidth = boardWidth * 0.03;
  jetHieght = boardHeight * 0.08;


  rocksWidth = jetWidth * 1.6;



  adjustDimensions();
});






// Update initGame to add a delay and clear rocks
function initGame() {

    adjustDimensions(); // Ensure dimensions are set on initialization


    score = 0;
    scoreElement.innerHTML = score;
    gameOver = false;
    gameOverOverlay.style.display = "none";
    jet.style.left = "50%"; // Center the jet
  
    // Clear any rocks from a previous session
    document.querySelectorAll(".rocks").forEach((rock) => rock.remove());
  
    // Add event listeners for keydown and keyup
    window.addEventListener("keydown", (e) => keysPressed[e.key] = true);
    window.addEventListener("keyup", (e) => keysPressed[e.key] = false);
  
    // Delay before starting rock generation and movement
    setTimeout(() => {
      generaterocks = setInterval(createRock, 1500); // Generate rocks every second
      moverocks = setInterval(moveRocks, 40); // Move rocks every 50ms
      gameLoop(); // Start the game loop for continuous movement/shooting
    }, 2000); // Adjust delay (in milliseconds) as needed
}
  






// Game loop to handle continuous key presses
function gameLoop() {
  if (gameOver) return;

  // Get the current position of the jet
  var left = parseFloat(window.getComputedStyle(jet).getPropertyValue("left"));
  var jetWidth = parseFloat(window.getComputedStyle(jet).getPropertyValue("width"));
  //var boardWidth = parseFloat(window.getComputedStyle(board).getPropertyValue("width"));

  // Prevent jet from moving out of bounds
  if (keysPressed["ArrowLeft"] && left > 0) {
    jet.style.left = (left - jetWidth * 0.1) + "px"; // Move left by 10% of jet width
  }
  if (keysPressed["ArrowRight"] && left <= boardWidth - jetWidth) {
    jet.style.left = (left + jetWidth * 0.1) + "px"; // Move right by 10% of jet width
  }

  // Handle shooting (spacebar or up arrow) with 200ms interval
  var currentTime = Date.now();
  if ((keysPressed["ArrowUp"] || keysPressed[" "]) && currentTime - lastShotTime > 200) {
    createBullet(left);
    lastShotTime = currentTime; // Update the last shot time
  }

  // Continuously call gameLoop using requestAnimationFrame
  requestAnimationFrame(gameLoop);
}







// Continuous movement functions for left and right
function startMoveLeft() {

  if (!moveInterval) { // Prevent multiple intervals from stacking
    moveInterval = setInterval(moveLeft, 25); // Move left every 50ms
  }
}


function startMoveRight() {
  if (!moveInterval) { // Prevent multiple intervals from stacking
    moveInterval = setInterval(moveRight, 25); // Move right every 50ms
  }
}




function stopMove() {
  clearInterval(moveInterval);  // Stop movement when button is released
  moveInterval = null;  // Reset the interval
}



// Continuous shooting function
function startShooting() {
  if (!shootInterval) { // Prevent multiple intervals from stacking
    shootInterval = setInterval(shootBullet, 150); // Shoot every 200ms
  }
}






function stopShooting() {
  clearInterval(shootInterval);  // Stop shooting when button is released
  shootInterval = null;  // Reset the interval
}










// Mobile control functions
function moveLeft() {
  var left = parseInt(window.getComputedStyle(jet).getPropertyValue("left"));
  if (left > 0) {
    jet.style.left = left - 10 + "px";
  }
}

function moveRight() {
  var left = parseInt(window.getComputedStyle(jet).getPropertyValue("left"));
  if (left <= boardWidth - jetWidth ) {
    jet.style.left = left + 10 + "px";
  }
}

function shootBullet() {
  var left = parseInt(window.getComputedStyle(jet).getPropertyValue("left"));
  createBullet(left);
}











// Adjust bullet creation for dynamic sizes
function createBullet(left) {
  var bullet = document.createElement("div");
  bullet.classList.add("bullets");
  bullet.style.width = jetWidth * 0.2 + "px"; // Bullet width is 20% of jet width
  bullet.style.height = jetWidth * 0.4 + "px"; // Bullet height is 40% of jet width
  bullet.style.left = left + jetWidth / 2 - (jetWidth * 0.1) + "px"; // Center bullet
  bullet.style.bottom = jetHieght + "px"; // Start just above the jet
  board.appendChild(bullet);

  var movebullet = setInterval(() => {
    if (gameOver) {
      clearInterval(movebullet);
      bullet.remove();
      return;
    }

    var bulletbottom = parseFloat(bullet.style.bottom || 0);
    if (bulletbottom >= boardHeight) {
      bullet.remove();
      clearInterval(movebullet);
    } else {
      bullet.style.bottom = (bulletbottom + jetWidth * 0.05) + "px"; // Move bullet upward

      checkCollision(bullet, movebullet);
    }
  }, 10);
}







// Function to check bullet-rock collision
function checkCollision(bullet, movebullet) {
    var rocks = document.getElementsByClassName("rocks");
    var bulletbound = bullet.getBoundingClientRect(); // Calculate bullet bounds once
  
    for (var i = 0; i < rocks.length; i++) {
      var rock = rocks[i];
      if (rock) {
        var rockbound = rock.getBoundingClientRect(); // Get rock bounds for each rock
  
        // Check if any part of the bullet intersects with the rock
        if (
          bulletbound.right > rockbound.left &&
          bulletbound.left < rockbound.right &&
          bulletbound.bottom > rockbound.top &&
          bulletbound.top < rockbound.bottom
        ) {
          rock.remove();
          bullet.remove();
          clearInterval(movebullet);
  
          score += 1;
          scoreElement.innerHTML = score;
          break; // Exit the loop once collision is detected
        }
      }
    }
  }
  






// Adjust rock creation for dynamic sizes
function createRock() {
  if (gameOver) return;

  var rock = document.createElement("div");
  rock.classList.add("rocks");
  rock.style.width = (jetWidth * 1.6) + "px"; // Rock width matches jet
  rock.style.height = (jetWidth * 1.6 ) + "px";
  rock.style.left = Math.random() * (boardWidth - jetWidth) + "px"; // Random position
  rock.style.top = "0px";
  board.appendChild(rock);
}









// Adjust rock movement for dynamic sizes
function moveRocks() {
  var rocks = document.getElementsByClassName("rocks");
  for (var i = 0; i < rocks.length; i++) {
    var rock = rocks[i];
    var rocktop = parseFloat(rock.style.top || 0);

    if (rocktop >= boardHeight - (rocksWidth * 0.5 )) {
      //rock.remove();
      endGame();
      return;
    } else {
      rock.style.top = (rocktop + jetWidth * 0.05) + "px"; // Move rock downward
    }
  }
}






// Function to end the game
function endGame() {
  gameOver = true;
  finalScoreElement.textContent = score;
  gameOverOverlay.style.display = "flex";

  clearInterval(generaterocks);
  clearInterval(moverocks);
  //window.removeEventListener("keydown", handleKeydown); // Stop movement
  keysPressed = {}; // Clear any lingering key states
}

// Function to restart the game
function restartGame() {
  board.innerHTML = '<div id="jet"></div>'; // Reset board
  jet = document.getElementById("jet"); // Re-fetch jet element
  score = 0;
  scoreElement.innerHTML = score;
  gameOver = false;
  gameOverOverlay.style.display = "none"; // Hide overlay




  // Clear all intervals before reinitializing the game
  clearInterval(moveInterval);
  clearInterval(shootInterval);
  moveInterval = null;
  shootInterval = null;
  



  initGame(); // Reinitialize the game
}




document.querySelectorAll('#mobile-controls button').forEach(button => {
  button.addEventListener('contextmenu', (e) => e.preventDefault());
});




// Initialize the game on page load
initGame();
