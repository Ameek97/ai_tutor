import { useState } from 'react';

function ChatTextbox({ onSendMessage }) {
  const [input, setInput] = useState('');

  {/* if some message is sent, add it to the messages state */}
  const handleSend = () => {
    onSendMessage({
      role: 'user',
      message: input,
    });
    setInput('');
  };

  return (
    <div className="chat-textbox">

      {/* this is the textbox */}

      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Type a message"
      />
      <button type="button" onClick={handleSend}>
        Send
      </button>
    </div>
  );
}

export default ChatTextbox;
