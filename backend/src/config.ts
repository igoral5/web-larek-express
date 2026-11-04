import 'dotenv/config';

const { PORT = 3000, DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek' } = process.env;

export { PORT, DB_ADDRESS };
