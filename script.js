// Interview questions database
const interviewQuestions = [
    {
        question: "Tell me about yourself and your professional background.",
        category: "General"
    },
    {
        question: "What are your greatest strengths and how do they apply to this role?",
        category: "Strengths"
    },
    {
        question: "Describe a challenging project you worked on and how you handled it.",
        category: "Experience"
    },
    {
        question: "How do you handle working under pressure?",
        category: "Behavioral"
    },
    {
        question: "Where do you see yourself in five years?",
        category: "Career"
    }
];

// DOM Elements
const textInput = document.getElementById('textInput');
const submitAnswer = document.getElementById('submitAnswer');
const startInterviewBtn = document.getElementById('startInterview');
const nextQuestionBtn = document.getElementById('nextQuestion');
const finishInterviewBtn = document.getElementById('finishInterview');
const currentQuestion = document.getElementById('currentQuestion');
const questionNumber = document.getElementById('questionNumber');
const questionCategory = document.getElementById('questionCategory');
const interviewProgress = document.getElementById('interviewProgress');
const finalAnalysis = document.getElementById('finalAnalysis');
const confidenceScore = document.getElementById('confidenceScore');
const technicalScore = document.getElementById('technicalScore');
const communicationScore = document.getElementById('communicationScore');
const feedbackText = document.getElementById('feedbackText');
const recommendationsText = document.getElementById('recommendationsText');

// State variables
let currentQuestionIndex = -1;
let interviewStarted = false;
let answers = [];
let scores = {
    confidence: 0,
    technical: 0,
    communication: 0
};

// Initialize the application
function init() {
    setupEventListeners();
    // Initially hide submit and next buttons
    submitAnswer.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    finishInterviewBtn.style.display = 'none';
}

// Set up event listeners
function setupEventListeners() {
    submitAnswer.addEventListener('click', handleAnswerSubmit);
    startInterviewBtn.addEventListener('click', startInterview);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    finishInterviewBtn.addEventListener('click', finishInterview);
}

// Handle answer submission
async function handleAnswerSubmit() {
    const answer = textInput.value.trim();
    if (answer) {
        submitAnswer.disabled = true;
        submitAnswer.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        try {
            const analysis = await analyzeResponse(answer);
            answers.push({
                question: interviewQuestions[currentQuestionIndex].question,
                answer: answer,
                analysis: analysis
            });
            
            nextQuestionBtn.disabled = false;
            submitAnswer.innerHTML = '<i class="fas fa-check"></i> Answer Submitted';
        } catch (error) {
            console.error('Error analyzing response:', error);
            submitAnswer.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
            setTimeout(() => {
                submitAnswer.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Answer';
                submitAnswer.disabled = false;
            }, 2000);
        }
    }
}

// Start the interview
function startInterview() {
    interviewStarted = true;
    currentQuestionIndex = -1;
    answers = [];
    resetScores();
    nextQuestion();
    startInterviewBtn.disabled = true;
    submitAnswer.style.display = 'block';
    submitAnswer.disabled = false;
    finalAnalysis.classList.add('hidden');
}

// Move to the next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < interviewQuestions.length) {
        const question = interviewQuestions[currentQuestionIndex];
        currentQuestion.textContent = question.question;
        questionNumber.textContent = `Q${currentQuestionIndex + 1}`;
        questionCategory.textContent = question.category;
        textInput.value = '';
        submitAnswer.disabled = false;
        submitAnswer.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Answer';
        nextQuestionBtn.disabled = true;
        nextQuestionBtn.style.display = 'block';
        
        // Update progress bar
        const progress = ((currentQuestionIndex + 1) / interviewQuestions.length) * 100;
        interviewProgress.style.width = `${progress}%`;
        
        if (currentQuestionIndex === interviewQuestions.length - 1) {
            nextQuestionBtn.style.display = 'none';
            finishInterviewBtn.style.display = 'block';
        }
    }
}

// Finish interview and show final analysis
async function finishInterview() {
    try {
        finishInterviewBtn.disabled = true;
        finishInterviewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        const finalAnalysis = await analyzeFinalResults();
        displayFinalAnalysis(finalAnalysis);
        finishInterviewBtn.innerHTML = '<i class="fas fa-check-circle"></i> Analysis Complete';
    } catch (error) {
        console.error('Error generating final analysis:', error);
        finishInterviewBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
        setTimeout(() => {
            finishInterviewBtn.innerHTML = '<i class="fas fa-check-circle"></i> Finish Interview';
            finishInterviewBtn.disabled = false;
        }, 2000);
    }
}

// Analyze individual response
async function analyzeResponse(response) {
    const prompt = `Analyze this interview response for a ${interviewQuestions[currentQuestionIndex].category} question:
Question: ${interviewQuestions[currentQuestionIndex].question}
Answer: ${response}

Please provide:
1. A confidence score (0-100)
2. A technical knowledge score (0-100)
3. A communication skills score (0-100)
4. Detailed feedback on the response

Format the response as JSON:
{
    "confidence": number,
    "technical": number,
    "communication": number,
    "feedback": "string"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert interviewer and career coach. Analyze interview responses and provide detailed feedback."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

// Analyze final results
async function analyzeFinalResults() {
    const prompt = `Analyze these interview responses and provide a comprehensive evaluation:

${answers.map((a, i) => `
Question ${i + 1}: ${a.question}
Answer: ${a.answer}
`).join('\n')}

Please provide:
1. Overall assessment
2. Key strengths
3. Areas for improvement
4. Specific recommendations for improvement

Format the response as JSON:
{
    "overall": "string",
    "strengths": ["string"],
    "improvements": ["string"],
    "recommendations": ["string"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert interviewer and career coach. Provide comprehensive feedback on interview performance."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7
        })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

// Display final analysis
function displayFinalAnalysis(analysis) {
    finalAnalysis.classList.remove('hidden');
    
    // Calculate average scores
    const avgScores = answers.reduce((acc, curr) => {
        acc.confidence += curr.analysis.confidence;
        acc.technical += curr.analysis.technical;
        acc.communication += curr.analysis.communication;
        return acc;
    }, { confidence: 0, technical: 0, communication: 0 });

    const numAnswers = answers.length;
    scores.confidence = Math.round(avgScores.confidence / numAnswers);
    scores.technical = Math.round(avgScores.technical / numAnswers);
    scores.communication = Math.round(avgScores.communication / numAnswers);

    // Update UI
    updateScores();
    
    // Display feedback
    feedbackText.innerHTML = `
        <h4>Overall Assessment</h4>
        <p>${analysis.overall}</p>
        
        <h4>Key Strengths</h4>
        <ul>
            ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
        </ul>
        
        <h4>Areas for Improvement</h4>
        <ul>
            ${analysis.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
        </ul>
    `;

    recommendationsText.innerHTML = `
        <ul>
            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;
}

// Update score display
function updateScores() {
    confidenceScore.textContent = `${scores.confidence}%`;
    technicalScore.textContent = `${scores.technical}%`;
    communicationScore.textContent = `${scores.communication}%`;
}

// Reset scores
function resetScores() {
    scores = {
        confidence: 0,
        technical: 0,
        communication: 0
    };
    updateScores();
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', init); 