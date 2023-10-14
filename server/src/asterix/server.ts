import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { File } from '../domain/File';

const app = express();
const port = 3001;

app.use(cors());

app.get('/readFile/:filePath', (req, res) => {
  try {
    const filePath = 'src/example_data/' + req.params.filePath;

    const decodedData = [];

    const fileStructure = new File(filePath);
    fileStructure.readFile();
    for (let i = 0; i < 100; i++) {
      fileStructure.cat048[i].decodeMessages();
      const message = fileStructure.cat048[i];
      decodedData.push({ message });
    }
    res.json(decodedData);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});