const words = ["CAT", "DOG", "BIRD", "FISH"]; // List of words to find in the grid
const gridSize = 10; // Size of the grid (10x10)
const grid = document.getElementById('grid'); // Reference to the grid element in HTML
const wordList = document.getElementById('word-list'); // Reference to the list element where words to find are displayed
const timerElement = document.getElementById('timer'); // Reference to the timer element to display remaining time
const endMessage = document.getElementById('end-message'); // Reference to the end message element to display at the end of the game

// Variables to track game state
let selectedCells = []; // Array to keep track of currently selected cells
let selectedIndices = []; // Array to store indices of selected cells
let foundWords = 0; // Counter for the number of words found
let countdownTimer; // Variable for the countdown timer interval
let timeLeft = 300; // Initial time for the timer, set to 5 minutes (300 seconds)
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || []; // Leaderboard data retrieved from localStorage or an empty array if none exists

// Function to initialize the game grid and start the timer
function initializeGrid() {
    // Display the list of words to find in the word list area
    words.forEach(word => {
        const listItem = document.createElement('li'); // Create a list item for each word
        listItem.innerText = word; // Set the list item text to the word
        listItem.id = word; // Assign an ID to the list item for easy reference when marking words as found
        wordList.appendChild(listItem); // Add the list item to the word list in the DOM
    });

    createGrid(); // Call function to generate and populate the grid with random letters
    startTimer(); // Start the countdown timer
}

// Function to reset the grid by removing all existing cells and recreating them
function resetGrid() {
    grid.innerHTML = ''; // Clear the current grid content

    // Populate the grid with random letters in each cell
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div'); // Create a new div for each grid cell
        cell.classList.add('cell'); // Add the 'cell' class for styling purposes
        cell.innerText = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Assign a random uppercase letter (A-Z) to the cell
        cell.addEventListener('click', () => selectCell(cell, i)); // Add a click event to handle cell selection
        grid.appendChild(cell); // Append the cell to the grid
    }
}


// Function to create and populate the grid with words
function createGrid() {
    let placedWords = false;
    
    // Keep attempting to place all words until successful
    while (!placedWords) {
        resetGrid(); // Reset the grid to start with a fresh layout of letters
        placedWords = placeWordsInGrid(); // Try to place all words in the grid
    }
}

// Function to place each word in the grid
function placeWordsInGrid() {
    for (let word of words) {
        let placed = false; // Track if the current word has been placed
        let attempts = 0; // Limit the number of placement attempts for each word

        // Try to place the word in a random direction and position
        while (!placed && attempts < 100) {
            let direction = Math.floor(Math.random() * 4); // Random direction: 0 = horizontal, 1 = vertical, 2 = diagonal, 3 = reverse diagonal
            let row = Math.floor(Math.random() * gridSize); // Random starting row
            let col = Math.floor(Math.random() * (gridSize - word.length)); // Random starting column (adjusted for word length)

            // Adjust column if placing vertically to keep within grid bounds
            if (direction === 1) col = Math.floor(Math.random() * gridSize); 

            // Check if the word can be placed at the selected position and direction
            if (canPlaceWord(word, row, col, direction)) {
                placeWord(word, row, col, direction); // Place the word in the grid
                placed = true; // Mark word as successfully placed
            }
            attempts++; // Increment attempt counter
        }

        // If the word couldn't be placed after 100 attempts, reset the grid
        if (!placed) return false;
    }
    return true; // All words have been placed successfully
}

// Helper function to check if a word can be placed at a given position and direction
function canPlaceWord(word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        let r = row;
        let c = col;

        // Determine the position of each letter based on the direction
        if (direction === 0) { // Horizontal
            c += i; // Move horizontally across columns
        } else if (direction === 1) { // Vertical
            r += i; // Move vertically down rows
        } else if (direction === 2) { // Diagonal
            r += i; // Move diagonally down-right across rows
            c += i; // Move diagonally across columns
        } else if (direction === 3) { // Reverse Diagonal
            r += i; // Move diagonally down-left across rows
            c -= i; // Move diagonally back across columns
        }
        
        // Check if the position is out of grid bounds or already occupied by another word
        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize || 
            grid.children[r * gridSize + c].classList.contains('placed')) {
            return false; // Word cannot be placed at this position
        }
    }
    return true; // Word can be placed at this position
}



// Function to place a word in the grid at a specified position and direction
function placeWord(word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        // Calculate the cell index based on direction
        const index = direction === 0 ? row * gridSize + col + i : // Horizontal
                      direction === 1 ? (row + i) * gridSize + col : // Vertical
                      direction === 2 ? (row + i) * gridSize + col + i : // Diagonal
                                        (row + i) * gridSize + col - i; // Reverse Diagonal
        
        const cell = grid.children[index];
        cell.innerText = word[i]; // Set the cell's text to the current letter of the word
        cell.classList.add('placed'); // Mark the cell as occupied
    }
}

// Function to select or deselect cells on click, forming a potential word
function selectCell(cell, index) {
    if (selectedCells.includes(cell)) {
        // Deselect cell if already selected
        selectedCells = selectedCells.filter(c => c !== cell);
        selectedIndices = selectedIndices.filter(i => i !== index);
        cell.classList.remove('selected');
    } else if (isStraightLine(index)) {
        // Select cell if it forms a straight line with previously selected cells
        selectedCells.push(cell);
        selectedIndices.push(index);
        cell.classList.add('selected');
    }
    checkWord(); // Check if selected cells form a valid word
}

// Function to ensure selected cells are in a straight line (row, column, or diagonal)
function isStraightLine(index) {
    if (selectedIndices.length < 1) return true; // First cell selected

    const [firstIndex] = selectedIndices;
    const rowDiff = Math.floor(index / gridSize) - Math.floor(firstIndex / gridSize);
    const colDiff = index % gridSize - firstIndex % gridSize;
    const [lastIndex] = selectedIndices.slice(-1);
    const rowLast = Math.floor(lastIndex / gridSize);
    const colLast = lastIndex % gridSize;

    // Check that all selected cells form a straight line
    return selectedIndices.every((i) => {
        const row = Math.floor(i / gridSize) - rowLast;
        const col = i % gridSize - colLast;
        return row * colDiff === col * rowDiff; // Proportional relationship for straight line
    });
}

// Function to verify if selected cells form a valid word
function checkWord() {
    const selectedWord = selectedCells.map(cell => cell.innerText).join(''); // Combine selected cell texts
    if (words.includes(selectedWord)) {
        document.getElementById(selectedWord).classList.add('found'); // Mark word as found in the list
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.add('found'); // Highlight found word permanently in the grid
        });
        selectedCells = [];
        selectedIndices = [];
        foundWords++;

        // If all words are found, end game and go to leaderboard
        if (foundWords === words.length) {
            clearInterval(countdownTimer);
            addToLeaderboard(300 - timeLeft); // Record time taken
            window.location.href = 'leaderboard.html'; // Redirect to leaderboard
        }
    }
}

// Start the countdown timer
function startTimer() {
    countdownTimer = setInterval(() => {
        timeLeft--; // Decrease time left by 1 second
        updateTimerDisplay(); // Update the display

        if (timeLeft <= 0) { // End game if time runs out
            clearInterval(countdownTimer);
            endGame();
        }
    }, 1000); // Run every second
}

// Function to display remaining time in minutes and seconds
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.innerText = `Time left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to end the game by hiding the grid and displaying the end message
function endGame() {
    grid.style.display = 'none';
    endMessage.style.display = 'block';
}

// Function to update the leaderboard with the player's time and save it
function addToLeaderboard(timeTaken) {
    leaderboard.push(timeTaken); // Add the new time to the leaderboard array
    leaderboard.sort((a, b) => a - b); // Sort leaderboard in ascending order (fastest times first)
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard)); // Save leaderboard to localStorage
}

// Initialize the game when the page loads
initializeGrid();
