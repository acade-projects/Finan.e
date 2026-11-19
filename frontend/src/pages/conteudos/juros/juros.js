
import { buscarPerguntas } from "../../../js/supabase.js";

let questions = [];

// Embaralha um array utilizando Fisher-Yates
function embaralhar(array) {
    const resultado = [...array];

    for (let i = resultado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
    }

    return resultado;
}

// Seleciona 2 fáceis, 2 intermediárias e 1 difícil
function sortearPerguntas(perguntas) {
    const faceis = perguntas.filter(q => q.difficulty === "facil");
    const intermediarias = perguntas.filter(q => q.difficulty === "intermediario");
    const dificeis = perguntas.filter(q => q.difficulty === "dificil");

    if (
        faceis.length < 2 ||
        intermediarias.length < 2 ||
        dificeis.length < 1
    ) {
        throw new Error("Quantidade insuficiente de perguntas por dificuldade.");
    }

    const selecionadas = [
        ...embaralhar(faceis).slice(0, 2),
        ...embaralhar(intermediarias).slice(0, 2),
        ...embaralhar(dificeis).slice(0, 1)
    ];

    return embaralhar(selecionadas);
}

// Elementos da página

const quizForm = document.querySelector("#quiz-form");
const questionTitle = document.querySelector("#question-title");
const answerOptions = document.querySelector("#answer-options");
const questionCounter = document.querySelector("#question-counter");
const progressText = document.querySelector("#question-progress-text");
const progressFill = document.querySelector("#progress-fill");
const progressTrack = document.querySelector("#progress-track");
const feedback = document.querySelector("#quiz-feedback");
const nextButton = document.querySelector("#next-button");
const quizResult = document.querySelector("#quiz-result");
const resultMessage = document.querySelector("#result-message");
const resultScore = document.querySelector("#result-score");
const restartButton = document.querySelector("#restart-button");

// Estado do questionário

let currentQuestion = 0;
let score = 0;
let answered = false;

// Exibe uma questão

function showQuestion() {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    questionCounter.textContent = `Questão ${currentQuestion + 1} de ${questions.length}`;
    progressText.textContent = `${Math.round(progress)}%`;
    progressFill.style.width = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", Math.round(progress));

    questionTitle.textContent = question.question;
    answerOptions.innerHTML = "";

    feedback.textContent = "";
    feedback.className = "quiz-feedback";

    answered = false;
    nextButton.disabled = true;

    question.answers.forEach((answer, index) => {
        const label = document.createElement("label");
        label.className = "answer-option";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "answer";
        input.value = index;
        input.addEventListener("change", checkAnswer);

        const span = document.createElement("span");
        span.textContent = answer;

        label.append(input, span);
        answerOptions.appendChild(label);
    });

    nextButton.textContent = currentQuestion === questions.length - 1
        ? "Ver resultado"
        : "Próxima questão";
}

// Verifica a resposta selecionada

function checkAnswer(event) {
    if (answered) return;

    answered = true;

    const selectedAnswer = Number(event.target.value);
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correct;

    if (isCorrect) {
        score++;
        feedback.textContent = `Resposta correta! ${question.explanation}`;
        feedback.classList.add("correct");
    } else {
        feedback.textContent = `Resposta incorreta. ${question.explanation}`;
        feedback.classList.add("incorrect");
    }

    nextButton.disabled = false;

    document.querySelectorAll(".answer-option input").forEach(input => {
        input.disabled = true;
    });
}

// Avança para a próxima questão

function nextQuestion() {
    if (!answered) return;

    currentQuestion++;

    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// Apresenta o resultado final

function showResult() {
    quizForm.hidden = true;
    quizResult.hidden = false;

    const percentage = (score / questions.length) * 100;

    resultScore.textContent = `${score} de ${questions.length} acertos`;

    if (percentage === 100) {
        resultMessage.textContent = "Excelente! Você demonstrou que compreende muito bem os conceitos básicos de juros.";
    } else if (percentage >= 60) {
        resultMessage.textContent = "Muito bem! Você já possui uma boa compreensão sobre juros. Continue aprendendo!";
    } else {
        resultMessage.textContent = "Não desanime! Aproveite o conteúdo da aula para aprender mais e tente novamente.";
    }

    progressFill.style.width = "100%";
    progressText.textContent = "100%";
    progressTrack.setAttribute("aria-valuenow", 100);
    questionCounter.textContent = "Questionário concluído";
}

// Reinicia o questionário com novas perguntas

async function restartQuiz() {
    quizForm.hidden = false;
    quizResult.hidden = true;

    await iniciar();
}

// Menu mobile — abre/fecha o menu hambúrguer das páginas de conteúdo

(function () {
    "use strict";

    const menuButton = document.getElementById("mobile-menu-button");
    const mobileNav = document.getElementById("mobile-navigation");

    if (!menuButton || !mobileNav) return;

    // Atualiza o estado do botão
    function setMenu(open) {
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    menuButton.addEventListener("click", () => {
        setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });

    // Fecha ao clicar em qualquer link do menu
    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setMenu(false));
    });

    // Fecha com Esc
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") setMenu(false);
    });

    // Fecha ao voltar para a tela grande
    window.matchMedia("(min-width: 901px)").addEventListener("change", event => {
        if (event.matches) setMenu(false);
    });
})();

// Eventos

nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartQuiz);

// Inicialização: carrega e sorteia as perguntas do Supabase

async function iniciar() {
    try {
        const perguntas = await buscarPerguntas("juros");

        if (perguntas.length === 0) {
            throw new Error("Nenhuma pergunta encontrada.");
        }

        questions = sortearPerguntas(perguntas);

        currentQuestion = 0;
        score = 0;
        answered = false;

        showQuestion();

    } catch (erro) {
        console.error(erro);

        questionTitle.textContent =
            "Não foi possível carregar as perguntas. Tente novamente mais tarde.";

        nextButton.disabled = true;
    }
}

iniciar();
