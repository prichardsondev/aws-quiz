const username = document.getElementById('username');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
const savedResultsElement = document.getElementById('savedResults');

finalScore.innerText = mostRecentScore;

const savedResults = JSON.parse(localStorage.getItem('savedResults'));
// savedResultsElement.append(JSON.stringify(savedResults));

username.addEventListener('keyup', () => {
    console.log(!username.value);
    saveScoreBtn.disabled = !username.value;
});

saveHighScore = (e) => {
    e.preventDefault();

    const score = {
        score: mostRecentScore,
        name: username.value
    };

    highScores.push(score);

    highScores.sort((a, b) => b.score - a.score);

    highScores.splice(5);

    localStorage.setItem('highScores',JSON.stringify(highScores));

    window.location.assign('/');
};

const resultsBox = document.getElementById("savedResults");
const container = document.getElementById("container");

showResults = () => {
    resultsBox.style.display = "block";
    container.style.display = "none";
    renderResults();
}

hideResults = () => {
    resultsBox.style.display = "none";
    container.style.display = "block";
    document.getElementById("items").innerHTML = "";
}

const renderResults = () => {
    for (let key in savedResults) {
        console.log(key, savedResults[key]);
        const block = document.getElementById("results")
        const list = document.createElement('ul')
        const row = savedResults[key]
        const item = `
            <ol>
                <p style="font-size: 14px; color: ${row.answer === +row.selectedAnswer ? 'green' : 'red'}">${savedResults[key].question}</p>
                <li>${savedResults[key].choice1}</li>
                <li>${savedResults[key].choice2}</li>
                <li>${savedResults[key].choice3}</li>
                <li>${savedResults[key].choice4}</li>
            </ol>
            <strong>Correct answer:</strong> ${savedResults[key].selectedAnswer}<br>
            <strong>Your answer:</strong> ${savedResults[key].answer}<br>
            <br>`
        list.innerHTML = item

        document.getElementById("results").appendChild(list)
    }
}

renderResults()