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

    const fileStructure = new File(filePath);
    fileStructure.readFile();
    fileStructure.cat048[10].decodeMessages();
    res.send(fileStructure.cat048);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});