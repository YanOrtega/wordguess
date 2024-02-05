document.addEventListener("DOMContentLoaded", function () {
    const words = {
        easy: [
            { word: "hangman", question: "A game where players guess a word by suggesting letters." },
            { word: "iceberg", question: "The reason why the Titanic sank." },
            { word: "giraffe", question: "The tallest mammal in the world." },
            { word: "paris", question: "The capital of France." },
            { word: "february", question: "When is Valentines Day celebrated?" },
            { word: "russia", question: "The largest country in the world." },
            { word: "luzon", question: "Largest island in the Philippines by land area." },
            { word: "cebu", question: "The oldest city in the Philippines." },
            { word: "seven", question: "How many continents are there in the world?" },
            { word: "wednesday", question: "Comes after Tuesday." },
        ],
        moderate: [
            { word: "python", question: "A high-level programming language known for its readability." },
            { word: "debugging", question: "The term for finding and fixing errors in a computer programming ." },
            { word: "sorting", question: "The process of rearranging elements in a list in a particular order." },
            { word: "microsoft", question: "Which company developed the Windows operating system?" },
            { word: "blockchain", question: "Technology used to record cryptocurrency transactions." },
            { word: "data", question: "Raw facts and figures." },
            { word: "backspace", question: "Deletes character from the left" },
            { word: "processor", question: "A component often referred to as a 'brain' of the motherboard." },
            { word: "spacebar", question: "Largest key in the keyboard." },
            { word: "database", question: "SQL is used for?" },
        ],
        difficult: [
            { word: "algorithm", question: "A step-by-step procedure or formula for solving a problem." },
            { word: "framework", question: "A pre-built set of tools and conventions for developing software applications." },
            { word: "encryption", question: "The process of converting information into a code to prevent unauthorized access." },
            { word: "booting", question: "The process of starting or restarting a computer." },
            { word: "software", question: "A Set of instructions that a computer has to carry out" },
            { word: "information", question: "Organized data that brings out meaning and context" },
            { word: "creeper", question: "The first computer virus is known as ___ program." },
            { word: "archie", question: "The first search engine on the internet" },
            { word: "network", question: "A group of two or more computers linked together." },
            { word: "router", question: "Device that acts as an interface between two networks." },
        ]
    };

    let currentDifficulty = "easy"; // Starting difficulty
    let currentQuestion = 0;
    let selectedWord = "";
    let guessedWord = [];
    let incorrectGuesses = 0;
    let maxIncorrectGuesses = 3;
    let score = 0;
    let cluesUsed = 0;
    let chosenLetters = [];
    let availableClues = 3;
    let usedQuestions = {
        "easy": [],
        "moderate": [],
        "difficult": []
    };

    const startContainer = document.getElementById("start-container");
    const startGameButton = document.getElementById("start-game-btn");
    const hangmanContainer = document.getElementById("hangman-container");
    const wordDisplay = document.getElementById("word-display");
    const guessesLeft = document.getElementById("guesses");
    const scoreDisplay = document.getElementById("points");
    const clueContainer = document.getElementById("clue-container");
    const clueButton = document.getElementById("clue-btn");
    const clueDisplay = document.getElementById("clue");
    const lettersContainer = document.getElementById("letters");
    const questionDisplay = document.getElementById("question");
    const cluesLeftDisplay = document.getElementById("clues-left");
    const backButton = document.getElementById("back-button");

    // Event listeners
    startGameButton.addEventListener("click", startGame);
    clueButton.addEventListener("click", getClue);
    document.getElementById("new-game").addEventListener("click", resetGame);
    backButton.addEventListener("click", function () {
        startContainer.style.display = "block";
        hangmanContainer.style.display = "none";
        resetGame();
    });

    function startGame() {
        startContainer.style.display = "none";
        hangmanContainer.style.display = "block";
        startNewRound();
        updateDifficultyIndicator();
    
        // Add the following line to hide the introductory content
        document.getElementById("game-intro").style.display = "none";
    }

    function startNewRound() {
    const difficultyWords = words[currentDifficulty];

    if (currentQuestion < difficultyWords.length) {
        // If used, find an unused question
        while (usedQuestions[currentDifficulty].length < difficultyWords.length && usedQuestions[currentDifficulty].includes(currentQuestion)) {
            currentQuestion = findUnusedQuestion(difficultyWords);
        }

        // Shuffle the array of questions if it's the first question in the difficulty
        if (usedQuestions[currentDifficulty].length === 0) {
            shuffleArray(difficultyWords);
        }

        // Check if we've used all questions in this difficulty
        if (usedQuestions[currentDifficulty].length === difficultyWords.length) {
            switch (currentDifficulty) {
                case "easy":
                    currentDifficulty = "moderate";
                    updateDifficultyIndicator();
                    break;
                case "moderate":
                    currentDifficulty = "difficult";
                    updateDifficultyIndicator();
                    break;
                case "difficult":
                    congratulatePlayer();
                    resetGame();
                    return;
            }
            usedQuestions[currentDifficulty] = []; // Reset used questions for the new difficulty
            currentQuestion = 0;
        }

        // Mark the question as used
        usedQuestions[currentDifficulty].push(currentQuestion);

        selectedWord = difficultyWords[currentQuestion].word.toUpperCase();
        guessedWord = Array(selectedWord.length).fill("_");
        incorrectGuesses = 0;
        cluesUsed = 0;
        chosenLetters = [];

        const currentQuestionText = difficultyWords[currentQuestion].question;
        questionDisplay.innerHTML = `
            <p>Question ${currentQuestion + 1} (${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}):</p>
            <p>${currentQuestionText}</p>
        `;

        updateWordDisplay();
        updateGuessesLeft();
        updateScore();
        updateLetters();
        clearClue();
        updateCluesLeft();
    } else {
        // If all questions have been used in the current difficulty, move to the next difficulty
        switch (currentDifficulty) {
            case "easy":
                currentDifficulty = "moderate";
                updateDifficultyIndicator();
                break;
            case "moderate":
                currentDifficulty = "difficult";
                updateDifficultyIndicator();
                break;
            case "difficult":
                congratulatePlayer();
                resetGame();
                return;
        }
        usedQuestions[currentDifficulty] = []; // Reset used questions for the new difficulty
        currentQuestion = 0;
        startNewRound();
    }
}
    
    // Helper function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function findUnusedQuestion(difficultyWords) {
        let unusedIndex;
        
        do {
            unusedIndex = Math.floor(Math.random() * difficultyWords.length);
        } while (usedQuestions[currentDifficulty].includes(unusedIndex));
    
        return unusedIndex;
    }

    function updateCluesLeft() {
        cluesLeftDisplay.textContent = availableClues;
    }

    function getClue() {
        if (score < 25) {
            clueDisplay.textContent = "Not enough points for a clue!";
            return;
        }
    
        if (availableClues > 0) {
            availableClues--;
            updateCluesLeft();
    
            clueDisplay.innerHTML = `
                <p>Choose a letter type for the clue:</p>
                <button id="consonant-btn">Consonant</button>
                <button id="vowel-btn">Vowel</button>
            `;
    
            document.getElementById("consonant-btn").addEventListener("click", () => provideClue("consonant"));
            document.getElementById("vowel-btn").addEventListener("click", () => provideClue("vowel"));
    
            clueButton.disabled = true;
        } else {
            clueDisplay.textContent = "No more clues left!";
        }
    }
    
    function provideClue(letterType) {
    const unusedLetters = [];

    for (let i = 0; i < guessedWord.length; i++) {
        if (guessedWord[i] === "_") {
            unusedLetters.push(selectedWord[i]);
        }
    }

    if (unusedLetters.length === 0) {
        clueDisplay.textContent = "No more blanks to fill!";
        return;
    }

    const filteredLetters = unusedLetters.filter(letter => {
        const isVowel = "AEIOU".includes(letter);
        return (letterType.toLowerCase() === "consonant" && !isVowel) ||
            (letterType.toLowerCase() === "vowel" && isVowel);
    });

    if (filteredLetters.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredLetters.length);
        const randomLetter = filteredLetters[randomIndex];

        for (let i = 0; i < guessedWord.length; i++) {
            if (guessedWord[i] === "_" && selectedWord[i] === randomLetter) {
                guessedWord[i] = randomLetter;
            }
        }

        // Disable the button for the used letter
        const button = document.getElementById(randomLetter.toLowerCase());
        if (button) {
            button.disabled = true;
            button.classList.add("chosen");
        }

        updateWordDisplay();
        clueDisplay.textContent = `Clue: Filled in a blank space - ${randomLetter}`;

        // Check if the last remaining blank space is filled
        if (!guessedWord.includes("_")) {
            showPopUp("Correct! You guessed the word: " + selectedWord);
            score += 10; // Add 10 points for each correct guess
            currentQuestion++;
            startNewRound();
        }
    } else {
        clueDisplay.textContent = `No available ${letterType} clues. Choose the other type.`;
    }

    score -= 25;
    updateScore();

    if (score >= 25) {
        clueButton.disabled = false;
    }
}

    function updateWordDisplay() {
        wordDisplay.textContent = guessedWord.join(" ");
    }

    function updateGuessesLeft() {
        guessesLeft.textContent = maxIncorrectGuesses - incorrectGuesses;
    }

    function updateScore() {
        scoreDisplay.textContent = Math.max(0, score);
    }

    function updateLetters() {
        lettersContainer.innerHTML = "";

        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const button = document.createElement("button");
            button.textContent = letter;
            button.addEventListener("click", function () {
                checkGuess(letter);
            });

            if (chosenLetters.includes(letter)) {
                button.disabled = true;
                button.classList.add("chosen");
            }

            lettersContainer.appendChild(button);
        }
    }

    function clearClue() {
        clueDisplay.textContent = "";
        clueButton.disabled = false;
    }

    function checkGuess(letter) {
        letter = letter.toUpperCase();

        if (!chosenLetters.includes(letter)) {
            chosenLetters.push(letter);

            if (selectedWord.includes(letter)) {
                for (let i = 0; i < selectedWord.length; i++) {
                    if (selectedWord[i] === letter) {
                        guessedWord[i] = letter;
                    }
                }

                if (!guessedWord.includes("_")) {
                    // Player guessed the entire word correctly
                    showPopUp("Correct! You guessed the word: " + selectedWord);
                    score += 10; // Add 10 points for each correct guess
                    currentQuestion++;
                    startNewRound();
                }
            } else {
                incorrectGuesses++;

                if (incorrectGuesses === maxIncorrectGuesses) {
                    showPopUp("Incorrect! The correct word was: " + selectedWord);
                    resetGame();
                    return;
                }
            }

            updateWordDisplay();
            updateGuessesLeft();
            updateScore(); // Update the score after each guess
            updateLetters();
        }
    }

    function updateDifficultyIndicator() {
        const difficultyIndicator = document.getElementById("difficulty-indicator");
        difficultyIndicator.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    }

    function showPopUp(message) {
        const popUp = document.getElementById("popup");
        const popUpMessage = document.getElementById("popup-message");
        const closeBtn = document.getElementById("close-btn");
    
        popUpMessage.textContent = message;
        popUp.style.display = "block";  // Change this line to toggle the display property
    
        closeBtn.addEventListener("click", () => {
            popUp.style.display = "none";  // Change this line to hide the pop-up
        });
    }

    function resetGame() {
        currentDifficulty = "easy";
        currentQuestion = 0;
        usedQuestions = {
            "easy": [],
            "moderate": [],
            "difficult": []
        };
        score = 0;
        availableClues = 3;
        updateDifficultyIndicator();
    
        // Show the introductory content when the game resets
        document.getElementById("game-intro").style.display = "block";
    
        startContainer.style.display = "block";
        hangmanContainer.style.display = "none";
    }

    function congratulatePlayer() {
        const finalScore = score;
        showPopUp(`Congratulations! You finished the game with a score of ${finalScore}.`);
        resetGame();
    }
});