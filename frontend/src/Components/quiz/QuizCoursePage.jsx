import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { data } from './QuizPage.jsx';

function QuizCoursePage() {
  const { courseId } = useParams();
  const [index, setIndex] = useState(0); // track of the current question index

  const [answers, setAnswers] = useState(Array(data.length).fill(null)); // ans marked by user for each question

  const question = data[index];
  const isFirstQuestion = (index === 0); // boolean value, for blurring out prev button
  const isLastQuestion = (index === data.length - 1); // boolean value, for blurring out next button

  // user marked an option 
  const handleSelectOption = (optionNumber) => {
    setAnswers((prev) => {
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
    console.log(answers);
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        
        <div>
          <h1>Quiz</h1>
          <p className="auth-subtitle">Question {index + 1} of {data.length}</p>
        </div>

        <Link to="/quiz" className="secondary-button nav-link-button">
          Back to Course Select
        </Link>
      </header>

      <div className="quiz-question">
        <h2>
          Question {index + 1}
        </h2>
        <p className="quiz-question-text">{question.question}</p>

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

          // option 1x
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
              answers[index] === 4
                ? 'quiz-option quiz-option-selected'
                : 'quiz-option'
            }
            onClick={() => handleSelectOption(4)}
          >
            {question.options[3]}
          </button>
        </div>
      </div>

      <div className="quiz-nav">
        <button
          type="button"
          className="secondary-button"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
        >
          Previous
        </button>
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
    </section>
  );
}

export default QuizCoursePage;
