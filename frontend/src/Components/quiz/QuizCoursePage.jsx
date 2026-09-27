import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function QuizCoursePage() {
  let quizData = [];

  try {
    
    const parsed = JSON.parse(localStorage.getItem('quizData') || '[]');

    quizData = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    quizData = [];
  }

  const { courseId } = useParams(); {/* the params assosiated with the route of this element/function which is QuizCoursePage */}
  const [index, setIndex] = useState(0); // track of the current question index

  const [answers, setAnswers] = useState(Array(quizData.length).fill(null)); // ans marked by user for each question
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const optionRefs = useRef(
    Array.from({ length: quizData.length }, () => [null, null, null, null])
  );

  const isFirstQuestion = (index === 0); // boolean value, for blurring out prev button
  const isLastQuestion = (index === quizData.length - 1); // boolean value, for blurring out next button

  const setOptionRef = (questionIndex, optionIndex) => (element) => {
    if (!optionRefs.current[questionIndex]) {
      optionRefs.current[questionIndex] = [null, null, null, null];
    }
    optionRefs.current[questionIndex][optionIndex] = element;
  };

  // user marked an option 
  const handleSelectOption = (optionNumber) => {

    setAnswers( (prev) => {
      const updated = [...prev];
      updated[index] = optionNumber;  // set the marked option for this current index(question)
      return updated;
    });
  };

  // move to prev qn
  const handlePrevious = () => {
    if (isFirstQuestion) {
      return;}

    setIndex((prev) => prev - 1);
  };

  // move to next qn 
  const handleNext = () => {
    if (isLastQuestion) {
      return;
    }
    setIndex((prev) => prev + 1);
  };



  const handleSubmit = () => {
    let count = 0;

    quizData.forEach( (quizQuestion, questionIndex) => {
      if (answers[questionIndex] === quizQuestion.correctAnswer) {
        count++;
      }
    });

    setCorrectCount(count);
    setSubmitted(true);
  };



  useEffect(() => {
    if (!submitted) {
      return;
    }


    // Highlight correct and incorrect answers
    quizData.forEach((resultQuestion, questionIndex) => {
      const userAnswer = answers[questionIndex];
      const correctAnswer = resultQuestion.correctAnswer;
      const optionElements = optionRefs.current[questionIndex] || [];

      optionElements.forEach((element) => {
        if (!element) {
          return;
        }
        element.classList.remove('quiz-option-correct', 'quiz-option-wrong');
      });

      const correctOption = optionElements[correctAnswer - 1];
      if (correctOption) {
        correctOption.classList.add('quiz-option-correct');
      }

      if (userAnswer !== null && userAnswer !== correctAnswer) {
        const wrongOption = optionElements[userAnswer - 1];
        if (wrongOption) {
          wrongOption.classList.add('quiz-option-wrong');
        }
      }
    });
  }, [submitted, answers] );

  if (!quizData.length) {
    return (
      <section className="dashboard-card">
        <header className="dashboard-header">
          <div>
            <h1>Quiz</h1>
            <p className="auth-subtitle">No quiz questions found</p>
          </div>
          <Link to="/quiz" className="secondary-button nav-link-button">
            Back to Course Select
          </Link>
        </header>
        <p className="dashboard-note">
          Select a course and click Continue to load quiz questions.
        </p>
      </section>
    );
  }

  const question = quizData[index];




  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        
        <div>
          <h1>Quiz</h1>
          <p className="auth-subtitle">
            {submitted ? 'Quiz results' : `Question ${index + 1} of ${quizData.length}`}
          </p>
        </div>

        <Link to="/quiz" className="secondary-button nav-link-button">
          Back to Course Select
        </Link>
      </header>

      {submitted === false ? (
        <>

      // quiz question
      <div className="quiz-question">
        <h2>
          Question {index + 1}
        </h2>
        <p className="quiz-question-text">{question.question}</p>



       // quiz option 1
        <div className="quiz-options">
          <button
            type="button"
            className={
              answers[index] === 1
                ? 'quiz-option quiz-option-selected'
                : 'quiz-option'
            }
            onClick={() => handleSelectOption(1)}
          >
            {question.options[0]}
          </button>


        // quiz option 2
          <button
            type="button"
            className={
              answers[index] === 2 ? 'quiz-option quiz-option-selected' : 'quiz-option'
                      }
            onClick={() => handleSelectOption(2)}
          >
            {question.options[1]}
          </button>

          <button
            type="button"
            className={
              answers[index] === 3
                ? 'quiz-option quiz-option-selected'
                : 'quiz-option'
            }
            onClick={() => handleSelectOption(3)}
          >
            {question.options[2]}
          </button>

          <button
            type="button"
            className={
              answers[index] === 4 ? 'quiz-option quiz-option-selected' : 'quiz-option' }
            onClick={() => handleSelectOption(4)}
          >
            {question.options[3]}
          </button>

        </div>
      </div>

      <div className="quiz-nav">
        



        {/* prev button */}
        <button
          type="button"
          className="secondary-button"
          onClick={handlePrevious}
          disabled={isFirstQuestion} // is disable = true, button wont be clickable
        >
          previous
        </button>


        {/* next button */}
        <div className="quiz-nav-actions">
          <button type="button" onClick={handleNext} disabled={isLastQuestion}>
            Next
          </button>
          {isLastQuestion ? (
            <button type="button" onClick={handleSubmit}>
              Submit Quiz
            </button>
          ) : null}
        </div>


      </div>
        </>
      ) : 
      (
        <div className="quiz-results">
          <h2 className="quiz-correct-count">
            You got {correctCount} out of {quizData.length} correct.
          </h2>

          {quizData.map((resultQuestion, questionIndex) => (
            <div key={resultQuestion.id} className="quiz-question">
              <h2>Question {questionIndex + 1}</h2>
              <p className="quiz-question-text">{resultQuestion.question}</p>

              <div className="quiz-options">
                <button
                  type="button"
                  className="quiz-option"
                  ref={setOptionRef(questionIndex, 0)}
                >
                  {resultQuestion.options[0]}
                </button>
                <button
                  type="button"
                  className="quiz-option"
                  ref={setOptionRef(questionIndex, 1)}
                >
                  {resultQuestion.options[1]}
                </button>
                <button
                  type="button"
                  className="quiz-option"
                  ref={setOptionRef(questionIndex, 2)}
                >
                  {resultQuestion.options[2]}
                </button>
                <button
                  type="button"
                  className="quiz-option"
                  ref={setOptionRef(questionIndex, 3)}
                >
                  {resultQuestion.options[3]}
                </button>
              </div>

              <p className="quiz-explanation">
                Explanation - {resultQuestion.explanation}
              </p>
            </div>
          ))}

          <p className="quiz-correct-count">
            You got {correctCount} out of {quizData.length} correct.
          </p>
        </div>
      )}
    </section>
  );
}

export default QuizCoursePage;
