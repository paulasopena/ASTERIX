import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { File } from '../domain/File';
import multer from 'multer';
import { Aircraft } from '../domain/Aircraft';
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

app.get('/readFile/:filePath', (req, res) => {
  try {
    const filePath = 'src/uploads/' + req.params.filePath;

    const decodedData = [];

    const fileStructure = new File(filePath);
    fileStructure.readFile();
    const currentDir = __dirname;
    const filePathCSV = path.join(currentDir, '../../../public', req.params.filePath);

    const csvWriteStream = fs.createWriteStream(filePathCSV.replace('.ast', '.csv'));

    for (let i = 0; i < fileStructure.cat048.length; i++) {
      fileStructure.cat048[i].decodeMessages();
      const { messages, ...restOfData } = fileStructure.cat048[i];

      if (i === 0) {
        const headers = Object.keys(restOfData).map(key => {
          if (typeof restOfData[key as keyof typeof restOfData] === 'object') {
            return Object.keys(restOfData[key as keyof typeof restOfData]).map(subKey => subKey).join(',');
          } else {
            return key;
          }
        }).join(',');
    
        csvWriteStream.write(headers + '\n');
      }

      const subValues = Object.values(restOfData).map(value => {
        if (typeof value === 'object') {
          return Object.values(value).map(subValue => JSON.stringify(subValue)).join(',');
        } else {
          return JSON.stringify(value);
        }
      }).join(',');

      const row = subValues;
      csvWriteStream.write(row + '\n');

      decodedData.push({ message: { ...restOfData } });
    }

    csvWriteStream.end();

    res.json({});
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/aircrafts/:filePath', (req, res) => {
  try {
    const currentDir = __dirname;
    const filePathCSV = path.join(currentDir, '../../../public', req.params.filePath);

    const aircraftMap: { [key: string]: Aircraft } = {};

    fs.createReadStream(filePathCSV)
      .pipe(csv())
      .on('data', (data: any) => {
        const {
          aircraftIdentification,
          IAS,
          flightLevel,
          lat,
          lng,
          Height,
          timeOfDay,
        } = data;

        if (!aircraftMap[aircraftIdentification]) {
          const newAircraft = new Aircraft(
            aircraftIdentification,
            Number(IAS),
            Number(flightLevel),
            [{ lat: Number(lat), lng: Number(lng), height: Number(Height), timeOfDay: String(timeOfDay) }]
          );

          aircraftMap[aircraftIdentification] = newAircraft;
        } else {
          aircraftMap[aircraftIdentification].addRouteElement({
            lat: Number(lat),
            lng: Number(lng),
            height: Number(Height),
            timeOfDay: String(timeOfDay)
          });
        }
      })
      .on('end', () => {
        res.json(Object.values(aircraftMap));
      });

  } catch (error) {
    console.error('Error', error);
    res.status(500).send('Internal Server Error');
  }
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './src/uploads/'); 
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname); 
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('Archivo subido con éxito');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});