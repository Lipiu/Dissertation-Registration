import cors from 'cors';
import express from 'express';
import { PORT } from './config/const.js';
import initDatabase from './config/initdb.js';
import accountRoutes from './routes/accountRoutes.js';
import mainRequestRoutes from './routes/mainRequestRoutes.js';
const app = express();

app.use(express.json());
app.use(
	express.urlencoded({
		extended: true,
	})
);

app.use(
	cors({
		origin: '*',
	})
);

app.use('/api', accountRoutes);
app.use('/api', mainRequestRoutes);

(async () => {
	try {
		await initDatabase();
		console.log('Database initialized');
	} catch (err) {
		console.error('Database init failed:', err);
	}
})();

const server = app.listen(PORT, () => {
	console.log(`Backend running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
	console.error('Server failed to start:', err.message);
});
