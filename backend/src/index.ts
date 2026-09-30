import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`University Library API running on port ${PORT}`);
});
