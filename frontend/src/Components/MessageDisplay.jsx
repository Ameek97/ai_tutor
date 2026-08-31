function MessageDisplay({ messages }) {

  return (
    <div className="chat-messages">
  
      {/* print the messages */}
      {messages.map((obj, index) => (
        <div
          key={index}
          className={
            obj.role === 'user'? 'chat-message chat-message-user': 'chat-message chat-message-assistant'
          }
        >
          {obj.message}
        </div>
      ))}
    </div>
  );
}

export default MessageDisplay;
