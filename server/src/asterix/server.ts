import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { sliceBuffer } from '../services/File.service';

const app = express();
const port = 3001;

app.use(cors());

app.get('/readFile', (req, res) => {
  try {
    const filePath = 'src/example_data/230502-est-080001_BCN_60MN_08_09.ast';
    const fileBuffer = fs.readFileSync(filePath);
    console.log(sliceBuffer(fileBuffer))
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});