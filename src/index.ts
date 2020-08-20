import { blue, bold } from 'chalk';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const message = `\n=== Server listening on port ${PORT} ===\n`;

app.listen(PORT).on('listening', () => {
    console.log(blue(bold(message)));
});
