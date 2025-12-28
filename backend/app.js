import cors from 'cors';
import express from 'express';
import { PORT } from './config/const.js';
import initDatabase from './config/initdb.js';
import accountRoutes from './routes/accountRoutes.js';

const app = express();

/* =======================
   Middleware
======================= */
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

/* =======================
   Routes
======================= */
app.use('/api', accountRoutes);

/* =======================
   Init DB
======================= */
(async () => {
	try {
		await initDatabase();
		console.log('Database initialized');
	} catch (err) {
		console.error('Database init failed:', err);
	}
})();

/* =======================
   Start server
======================= */
app.listen(PORT, () => {
	console.log(`Backend running at http://localhost:${PORT}`);
});
