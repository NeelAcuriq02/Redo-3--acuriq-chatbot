import ChatBot from '../../components/ChatBot';

export default function ChatbotWidgetPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <ChatBot />
    </div>
  );
}