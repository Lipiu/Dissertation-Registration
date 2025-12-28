import express from 'express';
import initDatabase from './config/initdb.js';
import accountRoutes from './routes/accountRoutes.js';
import { PORT } from './config/const.js';

const app = express();

// middleware
app.use(express.json());

// init database
(async () => {
	try {
		await initDatabase();
		console.log('Database initialized');
	} catch (error) {
		console.error('Database initialization failed:', error);
	}
})();

// routes testing
app.use('/account', accountRoutes);

// start server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
