import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import initDb from './database/initDb.js';
import UserRoutes from './routes/UserRoutes/UserRoutes.js';
import AdminRoutes from './routes/AdminRoutes/AdminRoutes.js';
import googleAuthRoutes from './routes/GoogleAuthRoutes/googleAuthRoutes.js';
import passport from './config/passport.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

const startServer = async () => {
  try {
    await initDb();
    console.log('Database initialized');
    
    app.use('/api/users', UserRoutes);
    app.use('/api/admin', AdminRoutes);
    app.use('/api', googleAuthRoutes); 

    app.get('/', (req, res) => {
      res.send('WasteTrack API is running...');
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server listening on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();