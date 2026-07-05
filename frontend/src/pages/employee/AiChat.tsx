import { useState } from 'react';
import api from '../../api/axios';
import { Bot, User, Send, Loader2 } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can answer questions about your company policies. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput('');
    
    // Optimistically add user message
    const updatedMessages = [...messages, { role: 'user', content: question }];
    setMessages(updatedMessages as any);
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.post('/api/ai/ask', { 
        question, 
        history: historyPayload 
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'Hi! I can answer questions about your company policies. What would you like to know?' }
    ]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={styles.heading}>AI Policy Assistant</h1>
          <p style={{ ...styles.sub, margin: 0 }}>Ask anything about your company policies</p>
        </div>
        <button
          className="btn-secondary"
          onClick={clearChat}
          style={{ fontSize: '13px', padding: '8px 16px' }}
        >
          Clear Conversation
        </button>
      </div>

      <div className="card chat-container">
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.message, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                {m.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Bot size={14} style={{ color: 'var(--accent)' }} />
                    <span style={styles.aiLabel}>AI Assistant</span>
                  </div>
                )}
                {m.role === 'user' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', justifyContent: 'flex-end' }}>
                    <span style={styles.userLabel}>You</span>
                    <User size={14} style={{ color: '#fff' }} />
                  </div>
                )}
                <p style={{ lineHeight: 1.6, fontSize: '13px', margin: 0 }}>{m.content?.replaceAll('**', '')}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <div className="chat-bubble-ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Bot size={14} style={{ color: 'var(--accent)' }} />
                  <span style={styles.aiLabel}>AI Assistant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Loader2 size={14} className="spinner" />
                  <p style={{ fontSize: '13px', margin: 0 }}>Thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              💡 AI remembers this conversation
            </span>
          </div>
          <div style={styles.inputRow}>
            <input
              type="text"
              placeholder="Ask about any policy..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button className="btn-primary" onClick={send} disabled={loading || !input.trim()}
              style={{ padding: '12px 24px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '26px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.02em' },
  sub: { color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' },
  messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0', marginBottom: '16px' },
  message: { display: 'flex', maxWidth: '75%' },
  aiLabel: { fontSize: '11px', fontWeight: 600, color: 'var(--accent)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' },
  userLabel: { fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' },
  inputRow: { display: 'flex', gap: '12px' },
};