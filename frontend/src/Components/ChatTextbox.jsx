import { useState } from 'react';

function ChatTextbox({ onSend }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }
    onSend(input);
    setInput('');
  };

  return (
    <div className="chat-textbox">
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
