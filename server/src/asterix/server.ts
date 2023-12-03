import express from 'express';
import fs from 'fs';
import cors from 'cors';
import { File } from '../domain/File';
import multer from 'multer';
import { Aircraft } from '../domain/Aircraft';
import csv from 'csv-parser';
import path from 'path';
import util from 'util';

const app = express();
const port = 3001;

app.use(cors());

const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);

app.get('/readFile/:filePath', async (req, res) => {
  try {
    const filePath = 'src/uploads/' + req.params.filePath;
    const decodedData = [];
    const fileStructure = new File(filePath);
    fileStructure.readFile();
    const currentDir = __dirname;
    const filePathCSV = path.join(currentDir, '../../../public', req.params.filePath.replace('.ast', '.csv'));

    try {
      // Comprueba si el archivo CSV existe
      await stat(filePathCSV);
      console.log('El archivo CSV ya existe.');
    } catch (error) {
      const e = error as NodeJS.ErrnoException;
      if (e.code === 'ENOENT') {
        // El archivo no existe, crea el directorio necesario
        console.log('El archivo CSV no existe, creándolo...');
        const dir = path.dirname(filePathCSV);
        await mkdir(dir, { recursive: true });
      } else {
        throw error; // Re-lanza cualquier otro error
      }
    }

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
          return Object.values(value).map(subValue => {
            if (typeof subValue === 'number') {
              return JSON.stringify(subValue.toString().replace('.', ','));
            }
            return JSON.stringify(subValue);
          }).join(',');
        } else {
          if (typeof value === 'number') {
            return JSON.stringify(value.toString().replace('.', ','));
          }
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

app.get('/aircrafts/:filePath', async (req, res) => {
  try {
    const currentDir = __dirname;
    const filePathCSV = path.join(currentDir, '../../../public', req.params.filePath);

    try {
      // Comprueba si el archivo CSV existe
      await stat(filePathCSV);
      console.log('El archivo CSV ya existe.');
    } catch (error) {
      const e = error as NodeJS.ErrnoException;
      if (e.code === 'ENOENT') {
        // El archivo no existe, crea el directorio necesario
        console.log('El archivo CSV no existe, creándolo...');
        const dir = path.dirname(filePathCSV);
        await mkdir(dir, { recursive: true });
      } else {
        throw error; // Re-lanza cualquier otro error
      }
    }

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
            [{ lat: Number(lat), lng: Number(lng), height: Number(flightLevel)*100*0.3048, timeOfDay: String(timeOfDay) }]
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