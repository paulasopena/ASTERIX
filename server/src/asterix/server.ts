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
    for (let i = 0; i < 4; i++) {
      fileStructure.cat048[i].decodeMessages();

      // Ahora puedes acceder a las propiedades de cat48 para este archivo
      const dataSourceIdentifier = fileStructure.cat048[i].dataSourceIdentifier;
      const targetReportDescriptor = fileStructure.cat048[i].targetReportDescriptor;
      decodedData.push({ dataSourceIdentifier, targetReportDescriptor });
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