import { useState } from 'react';
import api from '../../api/axios';

interface Message { role: 'user' | 'ai'; text: string; }

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! I can answer questions about your company policies. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    try {
      const res = await api.post('/api/ai/ask', { question });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div>
      <h1 style={styles.heading}>AI Policy Assistant</h1>
      <p style={styles.sub}>Ask anything about your company policies</p>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '65vh' }}>
        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.message, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                ...styles.bubble,
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              }}>
                {m.role === 'ai' && <span style={styles.aiLabel}>🤖 AI</span>}
                <p style={{ lineHeight: 1.6 }}>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start' }}>
              <div style={{ ...styles.bubble, background: 'var(--bg-secondary)' }}>
                <span style={styles.aiLabel}>🤖 AI</span>
                <p style={{ color: 'var(--text-muted)' }}>Thinking...</p>
              </div>
            </div>
          )}
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
            style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '24px', fontWeight: 700, marginBottom: '4px' },
  sub: { color: 'var(--text-secondary)', marginBottom: '24px' },
  messages: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0', marginBottom: '16px' },
  message: { display: 'flex', maxWidth: '80%' },
  bubble: { padding: '14px 18px', borderRadius: '16px', maxWidth: '100%' },
  aiLabel: { fontSize: '11px', fontWeight: 600, color: 'var(--accent)', display: 'block', marginBottom: '6px' },
  inputRow: { display: 'flex', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' },
};