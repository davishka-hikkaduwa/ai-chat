import { useState, useRef, useEffect } from 'react';

export default function App() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, loading]);

	const sendMessage = async () => {
		if (!input.trim() || loading) return;

		const userMsg = { role: 'user', content: input };
		const updatedMessages = [...messages, userMsg];

		setMessages(updatedMessages);
		setInput('');
		setLoading(true);

		try {
			const res = await fetch('http://localhost:3001/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: updatedMessages }),
			});

			const data = await res.json();
			const aiMsg = { role: 'assistant', content: data.text };
			setMessages((prev) => [...prev, aiMsg]);
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Something went wrong. Try again.',
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="flex flex-col h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b px-6 py-4 shadow-sm">
				<h1 className="text-xl font-semibold text-gray-800">AI Chat</h1>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
				{messages.length === 0 && (
					<p className="text-center text-gray-400 mt-20">
						Send a message to start the conversation.
					</p>
				)}

				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${
							msg.role === 'user'
								? 'justify-end'
								: 'justify-start'
						}`}
					>
						<div
							className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
								msg.role === 'user'
									? 'bg-blue-600 text-white rounded-br-sm'
									: 'bg-white text-gray-800 border rounded-bl-sm shadow-sm'
							}`}
						>
							{msg.content}
						</div>
					</div>
				))}

				{loading && (
					<div className="flex justify-start">
						<div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
							<span className="flex gap-1">
								<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
								<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
								<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
							</span>
						</div>
					</div>
				)}

				<div ref={bottomRef} />
			</div>

			{/* Input */}
			<div className="bg-white border-t px-4 py-4">
				<div className="flex gap-2 max-w-3xl mx-auto">
					<textarea
						className="flex-1 resize-none border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						rows={1}
						placeholder="Type a message... (Enter to send)"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<button
						onClick={sendMessage}
						disabled={loading || !input.trim()}
						className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}
