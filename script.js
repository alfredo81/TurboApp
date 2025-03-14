let words = [];
let currentWordIndex = 0;
let score = 0;
let displayTime = 1500;

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("submitButton").addEventListener("click", checkAnswer);
document.getElementById("backButton").addEventListener("click", returnToMenu);
document.getElementById("fileInput").addEventListener("change", loadWordsFromFile);

function startGame() {
    const difficulty = document.getElementById("difficulty").value;
    displayTime = parseInt(difficulty);

    if (words.length < 20) {
        alert("Carica un file con almeno 20 parole/frasi!");
        return;
    }

    words = shuffleArray(words).slice(0, 20);
    score = 0;
    currentWordIndex = 0;
    document.getElementById("score").innerText = "0";
    
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");

    showNextWord();
}

function showNextWord() {
    if (currentWordIndex >= words.length) {
        document.getElementById("wordDisplay").innerText = `Punteggio finale: ${score}/10`;
        document.getElementById("submitButton").disabled = true;
        document.getElementById("userInput").disabled = true;
        return;
    }

    let word = words[currentWordIndex];
    document.getElementById("wordDisplay").innerText = word;
    document.getElementById("userInput").value = "";
    document.getElementById("userInput").style.display = "none";
    document.getElementById("submitButton").style.display = "none";
    document.getElementById("feedback").innerText = "";

    setTimeout(() => {
        document.getElementById("wordDisplay").innerText = "";
        document.getElementById("userInput").style.display = "block";
        document.getElementById("submitButton").style.display = "block";
        document.getElementById("userInput").focus();
    }, displayTime);
}

function checkAnswer() {
    const userAnswer = document.getElementById("userInput").value.trim();
    const correctAnswer = words[currentWordIndex].trim();

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        score += 0.5;
        document.getElementById("feedback").innerText = "Grande!";
    } else {
        document.getElementById("feedback").innerText = "Peccato, prova di nuovo";
    }

    document.getElementById("score").innerText = score;
    currentWordIndex++;

    setTimeout(showNextWord, 1000);
}

function returnToMenu() {
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("game").classList.add("hidden");
}

function loadWordsFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        words = e.target.result.split("\n").map(word => word.trim()).filter(word => word.length > 0);
    };
    reader.readAsText(file);
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}
