import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
// app.use(cors({ origin: 'http://localhost:5173' }));
// app.use(
// 	cors({
// 		origin: [
// 			'http://localhost:5173',
// 			'https://ai-chat-one-rosy.vercel.app',
// 			/\.vercel\.app$/,
// 		],
// 	})
// );
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

app.post('/api/chat', async (req, res) => {
	const { messages } = req.body;

	// Convert messages to Gemini format
	const history = messages.slice(0, -1).map((msg) => ({
		role: msg.role === 'assistant' ? 'model' : 'user',
		parts: [{ text: msg.content }],
	}));

	const lastMessage = messages[messages.length - 1].content;

	const chat = model.startChat({ history });
	const result = await chat.sendMessage(lastMessage);
	const text = result.response.text();

	res.json({ text });
});

app.listen(3001, () => console.log('Server running on port 3001'));
