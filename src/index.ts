import express from 'express';
import userRouter from './routes/userRouter';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/auth', userRouter);

app.get("/", async (req, res) => {
  res.send('Hirenze Backend');
});

app.listen(PORT, () => { console.log('PORT RUNNING CORRECTLY')});