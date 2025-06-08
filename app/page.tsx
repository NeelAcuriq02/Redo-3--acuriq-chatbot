import ChatBot from '../src/components/ChatBot';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center mb-8">Claude Chat</h1>
      <ChatBot />
    </main>
  );
}
