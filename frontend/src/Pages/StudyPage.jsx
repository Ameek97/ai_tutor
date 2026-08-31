import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatTextbox from '../Components/ChatTextbox.jsx';

function StudyPage() {
  const [messages, setMessages] = useState([]);

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Study</h1>
          <p className="auth-subtitle">Chat input test</p>
        </div>
        <Link to="/dashboard" className="secondary-button nav-link-button">
          Back to Dashboard
        </Link>
      </header>

      <div className="chat-messages">

        {/*  */}
        {messages.map((obj, index) => (
          <div key={index}>
            Role: {obj.role} | Message: {obj.message}
          </div>
        ))}
      </div>

     {/* the tesbox component */}
    <ChatTextbox onSendMessage={addMessage} />


    </section>
  );
}

export default StudyPage;
