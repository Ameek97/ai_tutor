import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import ChatTextbox from '../Components/ChatTextbox.jsx';
import MessageDisplay from '../Components/MessageDisplay.jsx';

function StudyPage() {
  const { courseId } = useParams();
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');


  {/*  */} 
  const handleSendMessage = async (message) => {
    
    
    const newMessage = {
      role: 'user',
      message: message,
    };

    {/* get the updated messages to send to backend */}
    const updatedMessages = [
      ...messages,
      newMessage,
    ];


    setMessages(updatedMessages);
    setError('');


    try {
      const response = await axios.post(
        '/api/study/chat',
        {
          course_id: courseId,
          messages: updatedMessages,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );


      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          message: response.data,
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to get a response');
    }
  };

  return (
    <section className="dashboard-card">
      <header className="dashboard-header">
        <div>
          <h1>Study</h1>
          <p className="auth-subtitle">Chat input test</p>
        </div>
        <Link to="/study" className="secondary-button nav-link-button">
          Back to Courses
        </Link>
      </header>

      {error ? <p className="auth-error">{error}</p> : null}

      <MessageDisplay messages={messages} />
      <ChatTextbox onSend={handleSendMessage} />
    </section>
  );
}

export default StudyPage;
