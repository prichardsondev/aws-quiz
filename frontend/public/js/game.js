const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const questionCounterText = document.getElementById('questionCounter');
const scoreText = document.getElementById('score');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const home = document.getElementById('index');
const catagory = document.getElementById('catagory');

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];
let savedResults = {};
let questionIndex;

let questions = [];
let url = `http://localhost:3000/learn/${localStorage.getItem("currentCatagory")}`
fetch(url)
    .then(res =>  res.json())
    .then((loadedQuestions) => {
        localStorage.removeItem('savedResults')
        questions = loadedQuestions.map(loadedQuestion => {
            const formattedQuestion = {
                question:loadedQuestion.question,
            }

            const answerChoices = [...loadedQuestion.distractors];
            formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
            answerChoices.splice(formattedQuestion.answer -1, 0,loadedQuestion.answer);

            answerChoices.forEach((choice,index) => {
                formattedQuestion["choice" + (index+1)] = choice;
            })

            maxQuestions = loadedQuestions.length;

            return formattedQuestion;

        });

        startGame();
    })
    .catch((err) => {
        console.error(err);
    });

//CONSTANTS
const CORRECT_BONUS = 1;
let maxQuestions = 0;

startGame = () => {
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden')
    loader.classList.add('hidden')
    catagory.innerHTML = upperCaseFirstLetter(localStorage.getItem("currentCatagory"));
};

upperCaseFirstLetter = (val) => {  
    return val.charAt(0).toUpperCase() + val.slice(1);
}

getNewQuestion = () => {
    if (availableQuesions.length === 0 || questionCounter >= maxQuestions) {
        //go to the end page
        localStorage.setItem('mostRecentScore',score);
        return window.location.assign('/end.html');
    }
    questionCounter++;
    questionCounterText.innerHTML = `${questionCounter}/${maxQuestions}`;

    questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;

    savedResults[questionIndex] = currentQuestion

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });

    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
        
        const classToApply = selectedAnswer==currentQuestion.answer?"correct":"incorrect";

        selectedAnswer!=currentQuestion.answer?showToast(currentQuestion.answer):null;

        savedResults[questionIndex]['selectedAnswer'] = selectedAnswer
        localStorage.setItem("savedResults", JSON.stringify(savedResults))

        scoreText.innerText = classToApply==='correct'?(score+=CORRECT_BONUS):score;

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, selectedAnswer!=currentQuestion.answer?4000:1000);

        
    });
});

function showToast(correctAnswer) {
    console.log('toast');
    console.log(correctAnswer, typeof(correctAnswer));
    const x = document.getElementById("toast");
    x.className = "show";
    let letterAnswer;
    if(correctAnswer===1){
        letterAnswer = "A";
    } 
    else if(correctAnswer===2){
        letterAnswer = "B";
    }
    else if (correctAnswer===3){
        letterAnswer = "C";
    }
    else if(correctAnswer===4){
        letterAnswer = "D";
    }
    else(letterAnswer="err...check showToast() ./public/game.js")

    x.innerText = `Correct answer is ${letterAnswer}`;
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
