const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FALLBACK_REPLY =
  "I'm sorry, I can't reach the concierge service right now. For immediate assistance, please contact our front desk at concierge@aetheriaheights.com or call +1 (555) 123-4567.";

// Sends a chat message to the backend, which talks to Gemini (keeps the API key server-side)
export const sendChatMessage = async (message) => {
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error(`Chat request failed with status ${res.status}`);
    const data = await res.json();
    return data.reply || FALLBACK_REPLY;
  } catch (error) {
    console.error('Chat service error:', error);
    return FALLBACK_REPLY;
  }
};
