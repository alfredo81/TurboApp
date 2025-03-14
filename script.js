const loadScreen = document.getElementById('load-screen');
const gameScreen = document.getElementById('game-screen');
const fileInput = document.getElementById('file-input');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const goBtn = document.getElementById('go-btn');
const wordDisplay = document.getElementById('word-display');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const replayBtn = document.getElementById('replay-btn');
const scoreDisplay = document.getElementById('score');
const feedbackDisplay = document.getElementById('feedback');
const comparisonDisplay = document.getElementById('comparison');
const timerDisplay = document.getElementById('timer');
const ballGame = document.getElementById('ball-game');
const ballContainer = document.getElementById('ball-container');
const ballCountDisplay = document.getElementById('ball-count');
const ballTargetDisplay = document.getElementById('ball-target');

let wordList = [];
let currentIndex = 0;
let score = 0;
let difficultyTime = 0;
let replayUsed = false;
let timeLeft = 20 * 60; // 20 minuti in secondi
let timerInterval = null;
let ballsCaught = 0;
let targetColor = '';
let targetCount = 0;
let ballAnimationFrame = null;

startBtn.addEventListener('click', startGame);
goBtn.addEventListener('click', showNextItem);
submitBtn.addEventListener('click', checkAnswer);
replayBtn.addEventListener('click', replayItem);

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !submitBtn.disabled) {
        checkAnswer();
    }
});

function startGame() {
    if (!fileInput.files.length) {
        alert('Carica un file .txt prima di iniziare!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        wordList = e.target.result.split('\n').filter(line => line.trim());
        wordList = shuffleArray(wordList);
        loadScreen.classList.remove('active');
        gameScreen.classList.add('active');
        resetGame();
        startTimer();
    };
    reader.readAsText(file);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resetGame() {
    currentIndex = 0;
    score = 0;
    timeLeft = 20 * 60;
    scoreDisplay.textContent = `Punteggio: ${score}`;
    timerDisplay.textContent = `Tempo rimanente: ${formatTime(timeLeft)}`;
    goBtn.classList.remove('hidden');
    wordDisplay.classList.add('hidden');
    answerInput.classList.add('hidden');
    submitBtn.classList.add('hidden');
    replayBtn.classList.add('hidden');
    feedbackDisplay.classList.add('hidden');
    comparisonDisplay.classList.add('hidden');
    ballGame.classList.add('hidden');
    answerInput.disabled = true;
    submitBtn.disabled = true;
    replayBtn.disabled = true;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tempo rimanente: ${formatTime(timeLeft)}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
}

function showNextItem() {
    if (timeLeft <= 0) {
        endGame();
        return;
    }

    if (currentIndex >= wordList.length) {
        currentIndex = 0;
        wordList = shuffleArray([...wordList]);
    }

    goBtn.classList.add('hidden');
    wordDisplay.classList.remove('hidden');
    answerInput.classList.remove('hidden');
    submitBtn.classList.remove('hidden');
    replayBtn.classList.remove('hidden');
    
    const currentItem = wordList[currentIndex].trim();
    const isPhrase = currentItem.split(' ').length > 1;
    difficultyTime = getDisplayTime(isPhrase);

    wordDisplay.textContent = currentItem;
    answerInput.value = '';
    answerInput.disabled = true;
    submitBtn.disabled = true;
    replayBtn.disabled = false;
    replayUsed = false;
    feedbackDisplay.classList.add('hidden');
    comparisonDisplay.classList.add('hidden');

    setTimeout(() => {
        wordDisplay.textContent = '';
        answerInput.disabled = false;
        answerInput.focus();
        submitBtn.disabled = false;
        replayBtn.disabled = false;
    }, difficultyTime);
}

function getDisplayTime(isPhrase) {
    const difficulty = difficultySelect.value;
    if (difficulty === 'easy') return isPhrase ? 2800 : 2400;
    if (difficulty === 'medium') return isPhrase ? 2200 : 1500;
    return isPhrase ? 1400 : 900; // Difficile
}

function normalizeText(text) {
    return text
        .replace(/e'/g, 'e')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function checkAnswer() {
    const userAnswer = answerInput.value.trim();
    const correctAnswer = wordList[currentIndex].trim();
    const userAnswerNormalized = normalizeText(userAnswer);
    const correctAnswerNormalized = normalizeText(correctAnswer);

    if (userAnswerNormalized === correctAnswerNormalized) {
        score += 1;
        feedbackDisplay.textContent = 'Ben fatto!!';
        feedbackDisplay.style.color = 'green';
        comparisonDisplay.classList.add('hidden');
    } else {
        feedbackDisplay.textContent = 'Peccato, riprova';
        feedbackDisplay.style.color = 'red';
        showComparison(userAnswer, correctAnswer);
    }

    feedbackDisplay.classList.remove('hidden');
    scoreDisplay.textContent = `Punteggio: ${score}`;
    answerInput.value = '';
    submitBtn.disabled = true;
    replayBtn.disabled = true;

    if (score > 0 && score % 5 === 0) {
        startBallGame();
    } else {
        currentIndex++;
        setTimeout(() => {
            if (timeLeft > 0) {
                goBtn.classList.remove('hidden');
                wordDisplay.classList.add('hidden');
                answerInput.classList.add('hidden');
                submitBtn.classList.add('hidden');
                replayBtn.classList.add('hidden');
            }
        }, 2000);
    }
}

function showComparison(userAnswer, correctAnswer) {
    comparisonDisplay.textContent = `Sbagliata: "${userAnswer}" - Corretta: "${correctAnswer}"`;
    comparisonDisplay.classList.remove('hidden');
}

function replayItem() {
    if (!replayUsed) {
        wordDisplay.textContent = wordList[currentIndex].trim();
        setTimeout(() => {
            wordDisplay.textContent = '';
            answerInput.disabled = false;
            submitBtn.disabled = false;
            replayBtn.disabled = true;
        }, difficultyTime);
        replayUsed = true;
    }
}

function startBallGame() {
    stopTimer();
    ballsCaught = 0;
    const colors = ['red', 'blue', 'green', 'yellow'];
    targetColor = colors[Math.floor(Math.random() * colors.length)];
    targetCount = Math.floor(Math.random() * 6) + 5; // Da 5 a 10
    ballTargetDisplay.textContent = `Prendi ${targetCount} palline di colore ${targetColor === 'red' ? 'rosso' : targetColor === 'blue' ? 'blu' : targetColor === 'green' ? 'verde' : 'giallo'}`;
    ballCountDisplay.textContent = `Palline prese: ${ballsCaught}/${targetCount}`;
    ballGame.classList.remove('hidden');
    wordDisplay.classList.add('hidden');
    answerInput.classList.add('hidden');
    submitBtn.classList.add('hidden');
    replayBtn.classList.add('hidden');
    feedbackDisplay.classList.add('hidden');
    comparisonDisplay.classList.add('hidden');
    animateBalls();
}

function animateBalls() {
    ballContainer.innerHTML = '';
    const ballElements = [];
    const colors = ['red', 'blue', 'green', 'yellow'];

    // Crea 3 palline iniziali, almeno 1 del colore target
    for (let i = 0; i < 3; i++) {
        const color = i === 0 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
        const ball = document.createElement('div');
        ball.classList.add('ball');
        ball.style.backgroundColor = color;
        ball.dataset.color = color;
        ball.style.left = `${Math.random() * (ballContainer.offsetWidth - 30)}px`;
        ball.style.top = '-30px';
        ball.addEventListener('click', () => catchBall(ball));
        ballContainer.appendChild(ball);
        ballElements.push({ element: ball, top: -30 });
    }

    function updateBalls(timestamp) {
        ballElements.forEach((ball, index) => {
            ball.top += 2; // Velocità di caduta
            ball.element.style.top = `${ball.top}px`;

            if (ball.top >= ballContainer.offsetHeight - 30) { // Raggiunge il fondo
                ball.element.remove();
                ballElements.splice(index, 1);
                const newBall = document.createElement('div');
                newBall.classList.add('ball');
                // Nuova pallina con colore casuale, garantendo il target
                const color = Math.random() < 0.5 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
                newBall.style.backgroundColor = color;
                newBall.dataset.color = color;
                newBall.style.left = `${Math.random() * (ballContainer.offsetWidth - 30)}px`;
                newBall.style.top = '-30px';
                newBall.addEventListener('click', () => catchBall(newBall));
                ballContainer.appendChild(newBall);
                ballElements.push({ element: newBall, top: -30 });
            }
        });

        ballAnimationFrame = requestAnimationFrame(updateBalls);
    }

    ballAnimationFrame = requestAnimationFrame(updateBalls);
}

function catchBall(ball) {
    if (ball.dataset.color === targetColor) {
        ball.remove();
        ballsCaught++;
        ballCountDisplay.textContent = `Palline prese: ${ballsCaught}/${targetCount}`;
        if (ballsCaught >= targetCount) {
            endBallGame();
        }
        // Sostituisci con una nuova pallina casuale
        const colors = ['red', 'blue', 'green', 'yellow'];
        const newBall = document.createElement('div');
        newBall.classList.add('ball');
        const newColor = Math.random() < 0.5 ? targetColor : colors[Math.floor(Math.random() * colors.length)];
        newBall.style.backgroundColor = newColor;
        newBall.dataset.color = newColor;
        newBall.style.left = `${Math.random() * (ballContainer.offsetWidth - 30)}px`;
        newBall.style.top = '-30px';
        newBall.addEventListener('click', () => catchBall(newBall));
        ballContainer.appendChild(newBall);
        ballElements.push({ element: newBall, top: -30 });
    }
}

function endBallGame() {
    cancelAnimationFrame(ballAnimationFrame);
    ballGame.classList.add('hidden');
    currentIndex++;
    startTimer();
    setTimeout(showNextItem, 500);
}

function endGame() {
    clearInterval(timerInterval);
    cancelAnimationFrame(ballAnimationFrame);
    let message = `Tempo scaduto! Punteggio finale: ${score}`;
    if (score > 40) {
        message += ' - Sei un supereroe!';
    } else if (score > 30) {
        message += ' - Sei un campione!';
    } else if (score > 20) {
        message += ' - Ben fatto!! Prova superata';
    }
    wordDisplay.textContent = message;
    wordDisplay.classList.remove('hidden');
    answerInput.classList.add('hidden');
    submitBtn.classList.add('hidden');
    replayBtn.classList.add('hidden');
    feedbackDisplay.classList.add('hidden');
    comparisonDisplay.classList.add('hidden');
    ballGame.classList.add('hidden');
}