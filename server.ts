import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/api/lancamentos', (req, res) => {
  res.json({ message: 'Lançamentos' });
}
)

app.use(express.static(path.join(__dirname, '')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})
