import express from 'express';
import initDatabase from './config/initdb.js';

const PORT = 8888;

const app = express();
app.use(express.json());

(async () => {
	try {
		await initDatabase();
		console.log('Database initialized');
	} catch (err) {
		console.error('Database init failed:', err);
	}
})();

app.listen(PORT, () => {
	console.log('Server running on port 3000');
});
