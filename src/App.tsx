import React, { useEffect, useRef, useState } from 'react';
import './App.css';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.onmessage = (event) => {
      let data = event.data;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed && parsed.error) {
          setMessages((msgs) => [...msgs, { sender: 'agent', text: `Error: ${parsed.error}` }]);
          return;
        }
      } catch (e) {
        // Not JSON, continue
      }
      setMessages((msgs) => [...msgs, { sender: 'agent', text: data }]);
      console.log('Received from backend:', data);
    };
    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input);
      setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <h1>GitHub Copilot Chat</h1>
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const text = typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text);
          return (
            <div key={idx} className={`chat-message ${msg.sender} ${text.includes('successfully') ? 'success' : ''}`}>
              <b>{msg.sender === 'user' ? 'You' : 'Copilot'}:</b> {text}
            </div>
          );
        })}
      </div>
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your request..."
        />
        <button type="submit" onClick={sendMessage}>Send</button>
      </form>
    </div>
  );
}

export default App;
