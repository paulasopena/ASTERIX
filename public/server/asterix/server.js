const express = require("express");
const fs = require("fs");
const cors = require("cors");
const File = require("../domain/File");
const multer = require("multer");
const Aircraft = require("../domain/Aircraft");
const AircraftFiltered = require("../domain/AircraftFiltered");
const csv = require("csv-parser");
const path = require("path");
const util = require("util");
const ExcelJS = require('exceljs');
const moment = require('moment-timezone');
const timeZone = 'Europe/Madrid';

const app = express()
const port = 3001

app.use(cors())

const stat = util.promisify(fs.stat)
const mkdir = util.promisify(fs.mkdir)

app.get("/readFile/:filePath", async (req, res) => {
  try {
    const filePath = __dirname + "/../uploads/" + req.params.filePath
    const decodedData = []

    const fileStructure = new File(filePath)
    fileStructure.readFile()
    const currentDir = __dirname

    //CSV per frontend

    const filePathCSV = path.join(
      currentDir + "../../../",
      req.params.filePath.replace(".ast", ".csv")
    )
    

    try {
      await stat(filePathCSV)
      console.log("El archivo CSV ya existe.")
    } catch (error) {
      const e = error
      if (e.code === "ENOENT") {
        console.log("El archivo CSV no existe, creandolo...")
        const dir = path.dirname(filePathCSV)
        await mkdir(dir, { recursive: true })
      } else {
        throw error
      }
    }

    const csvWriteStream = fs.createWriteStream(
      filePathCSV.replace(".ast", ".csv")
    )

    for (let i = 0; i < fileStructure.cat048.length; i++) {
      fileStructure.cat048[i].decodeMessages()
      const { messages, ...restOfData } = fileStructure.cat048[i]

      if (i === 0) {
        const headers = Object.keys(restOfData)
          .map(key => {
            if (typeof restOfData[key] === "object") {
              return Object.keys(restOfData[key])
                .map(subKey => subKey)
                .join(",")
            } else {
              return key
            }
          })
          .join(",")

        csvWriteStream.write(headers + "\n")
      }

      const subValues = Object.values(restOfData)
        .map(value => {
          if (typeof value === "object") {
            return Object.values(value)
              .map(subValue => JSON.stringify(subValue))
              .join(",")
          } else {
            return JSON.stringify(value)
          }
        })
        .join(",")

      const row = subValues
      csvWriteStream.write(row + "\n")

      decodedData.push({ message: { ...restOfData } })
    }

    csvWriteStream.end()

    // CSV per excel

    const filePathCSVExcel = path.join(
      currentDir + "../../../",
      req.params.filePath.replace(".ast", "_excel.csv")
    )

    try {
      await stat(filePathCSVExcel)
      console.log("El archivo CSV ya existe.")
    } catch (error) {
      const e = error
      if (e.code === "ENOENT") {
        console.log("El archivo CSV no existe, creándolo...")
        const dir = path.dirname(filePathCSVExcel)
        await mkdir(dir, { recursive: true })
      } else {
        throw error
      }
    }

    const csvWriteStreamExcel = fs.createWriteStream(
      filePathCSVExcel.replace(".ast", ".csv")
    )

    for (let i = 0; i < fileStructure.cat048.length; i++) {
      fileStructure.cat048[i].decodeMessages()
      const { messages, ...restOfData } = fileStructure.cat048[i]

      if (i === 0) {
        const headers = Object.keys(restOfData)
          .map(key => {
            if (typeof restOfData[key] === "object") {
              return Object.keys(restOfData[key])
                .map(subKey => subKey)
                .join(",")
            } else {
              return key
            }
          })
          .join(",")
        csvWriteStreamExcel.write(headers + "\n")
      }

      const subValues = Object.values(restOfData)
        .map(value => {
          if (typeof value === "object") {
            return Object.values(value)
              .map(subValue => {
                if (typeof subValue === "number") {
                  return JSON.stringify(subValue.toString().replace(".", ","))
                }
                return JSON.stringify(subValue)
              })
              .join(",")
          } else {
            if (typeof value === "number") {
              return JSON.stringify(value.toString().replace(".", ","))
            }
            return JSON.stringify(value)
          }
        })
        .join(",")

      const row = subValues
      csvWriteStreamExcel.write(row + "\n")
      decodedData.push({ message: { ...restOfData } })
    }

    csvWriteStreamExcel.end()

    res.json({})
  } catch (error) {
    console.error("Error reading file:", error)
    res.status(500).send("Internal Server Error")
  }
})

app.get("/aircrafts/:filePath", async (req, res) => {
  try {
    const currentDir = __dirname
    const filePathCSV = path.join(
      currentDir + "../../../",
      req.params.filePath.replace(".ast", ".csv")
    )

    try {
      await stat(filePathCSV)
      console.log("El archivo CSV ya existe.")
    } catch (error) {
      const e = error
      if (e.code === "ENOENT") {
        console.log("El archivo CSV no existe, creándolo...")
        const dir = path.dirname(filePathCSV)
        await mkdir(dir, { recursive: true })
      } else {
        throw error
      }
    }

    const aircraftMap = {}

    fs.createReadStream(filePathCSV)
      .pipe(csv())
      .on("data", data => {
        const {
          aircraftIdentification,
          IAS,
          flightLevel,
          lat,
          lng,
          Height,
          timeOfDay, 
          TYP,
          U_stereo,
          V_stereo,
          Height_stereo
        } = data

        const validTYPValues = [
          'Single ModeS All-Call',
          'Single ModeS Roll-Call',
          'ModeS All-Call + PSR',
          'ModeS Roll-Call + PSR'
        ];
        if(validTYPValues.includes(TYP)){
          if (!aircraftMap[aircraftIdentification]) {
            const newAircraft = new Aircraft(
              aircraftIdentification,
              Number(IAS),
              Number(flightLevel),
              [{ lat: Number(lat), lng: Number(lng), height: Number(flightLevel)*100*0.3048, timeOfDay: String(timeOfDay) }],
              String(TYP)
            );
            aircraftMap[aircraftIdentification] = newAircraft;
          } else {
            aircraftMap[aircraftIdentification].addRouteElement({
              lat: Number(lat),
              lng: Number(lng),
              height: Number(flightLevel),
              timeOfDay: String(timeOfDay),
              V_stereo: Number(V_stereo),
              U_stereo: Number(U_stereo),
              Height_stereo: Number(Height_stereo)
            });
          }
        }
      })
      .on("end", () => {
        res.json(Object.values(aircraftMap))
      })
  } catch (error) {
    console.error("Error", error)
    res.status(500).send("Internal Server Error")
  }
})

let filteredAircrafts = [];
const loadAircraftIdentifiers = async () => {
  console.log('estoy leyendo el excel');
  const workbook = new ExcelJS.Workbook();
  const currentDir = __dirname
  const filePath = path.join(
    currentDir + "../../../2305_02_dep_lebl.xlsx",
  )
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);
  let firstRow = true;
  worksheet.eachRow(row => {
    if (firstRow) {
      firstRow = false; 
    } else {
      const aircraftIdentification = row.getCell('B').value;
      const timeDeparture = row.getCell('C').value;
      const typeAircraft = row.getCell('E').value;
      const stele = row.getCell('F').value;
      const procDep = row.getCell('G').value;
      const runway = row.getCell('H').value;

      const aircraftFiltered = new AircraftFiltered(
        aircraftIdentification,
        timeDeparture,
        typeAircraft,
        [], 
        stele,
        procDep,
        runway
      );

      filteredAircrafts.push(aircraftFiltered);
    }
  });
  console.log('ya lo he leido');
}

app.get("/filteredAircrafts/:filePath", async (req, res) => {
  const MIN_LAT = 40.9;
  const MAX_LAT = 41.7;
  const MIN_LNG = 1.5;
  const MAX_LNG = 2.6;
  

  try {
    const currentDir = __dirname
    const filePathCSV = path.join(
      currentDir + "../../../",
      req.params.filePath.replace(".ast", ".csv")
    )

    try {
      await stat(filePathCSV)
      console.log("El archivo CSV ya existe.")
    } catch (error) {
      const e = error
      if (e.code === "ENOENT") {
        console.log("El archivo CSV no existe, creándolo...")
        const dir = path.dirname(filePathCSV)
        await mkdir(dir, { recursive: true })
      } else {
        throw error
      }
    }

    const aircraftMap = {}

    await loadAircraftIdentifiers();

    fs.createReadStream(filePathCSV)
      .pipe(csv())
      .on("data", data => {
        const {
          aircraftIdentification,
          IAS,
          flightLevel,
          lat,
          lng,
          Height,
          timeOfDay, 
          TYP,
          U_stereo,
          V_stereo,
          Height_stereo
        } = data

        const validTYPValues = [
          'Single ModeS All-Call',
          'Single ModeS Roll-Call',
          'ModeS All-Call + PSR',
          'ModeS Roll-Call + PSR'
        ];

        const aircraftFiltered = filteredAircrafts.find(a => a.aircraftIdentification === aircraftIdentification);

        if (aircraftFiltered && Number(lat) >= MIN_LAT && Number(lat) <= MAX_LAT && Number(lng) >= MIN_LNG && Number(lng) <= MAX_LNG) {
          if(validTYPValues.includes(TYP)){
            if (!aircraftMap[aircraftIdentification]) {
              const newAircraft = new AircraftFiltered(
                aircraftFiltered.aircraftIdentification,
                aircraftFiltered.timeDeparture,
                aircraftFiltered.typeAircraft,
                [{ lat: Number(lat), lng: Number(lng), height: Number(flightLevel)*100*0.3048, timeOfDay: String(timeOfDay) }],
                aircraftFiltered.stele,
                aircraftFiltered.procDep,
                aircraftFiltered.runway
              );
              aircraftMap[aircraftIdentification] = newAircraft;
            } else {
              aircraftMap[aircraftIdentification].addRouteElement({
                lat: Number(lat),
                lng: Number(lng),
                height: Number(flightLevel)*100*0.3048,
                timeOfDay: String(timeOfDay),
                V_stereo: Number(V_stereo),
                U_stereo: Number(U_stereo),
                Height_stereo: Number(Height_stereo)
              });
            }
          }
        }              
      })
      .on("end", () => {
        const aircraftArray = Object.values(aircraftMap);
        aircraftArray.sort((a, b) => {
          const dateA = moment(a.timeDeparture, 'DD/MM/YYYY HH:mm:ss').toDate();
          const dateB = moment(b.timeDeparture, 'DD/MM/YYYY HH:mm:ss').toDate();
          return dateA - dateB;
        });

        const distances = [];
        for (let i = 1; i < aircraftArray.length; i++) {
          const prevAircraft = aircraftArray[i - 1];
          const currentAircraft = aircraftArray[i];

          const startTime = moment.tz(prevAircraft.timeDeparture, timeZone).toDate();
          const endTime = moment.tz(`${moment(startTime).format('MM/DD/YYYY')} ${currentAircraft.route[currentAircraft.route.length - 1].timeOfDay}`, timeZone).toDate();
          
          let currentTime = moment(startTime);

          distances_between_flights = [];
          while (currentTime <= moment(endTime)) {
            const prevPosition = findPositionAtTime(prevAircraft, currentTime.toDate());
            const currentPosition = findPositionAtTime(currentAircraft, currentTime.toDate());

            if (prevPosition && currentPosition) {
              const distance = calculateDistance(
                prevPosition.U_stereo,
                prevPosition.V_stereo,
                currentPosition.U_stereo,
                currentPosition.V_stereo
              );

              distances_between_flights.push(distance);
            }

            currentTime = currentTime.add(4, 'seconds');
          }

          const minDistance = Math.min(...distances_between_flights);
          distances.push(minDistance);
        }

        console.log(distances);
        //radarMinimum(aircraftArray, distances);
        LoAMinimum(aircraftArray, distances);
        //ContrailsMinimum(aircraftArray, distances);

        res.json(aircraftArray);
      })
  } catch (error) {
    console.error("Error", error)
    res.status(500).send("Internal Server Error")
  }
})

function radarMinimum(aircraftArray, distances) {
  const totalDistances = distances.length;
  const distancesGreaterThan3 = distances.filter(distance => distance > 3).length;

  const percentage = (distancesGreaterThan3 / totalDistances) * 100;

  console.log(`BREACH MINIMUM RADAR: ${distancesGreaterThan3} - ${totalDistances} (${percentage.toFixed(2)}%)`);
}

function LoAMinimum(aircraftArray, distances) {
  const currentDir = __dirname
  const filePath = path.join(
    currentDir + "../../../Tabla_Clasificacion_aeronaves.csv",
  )

  let LoARequirements = {
    'HP': {
      'HP': { 'SameSID': 5, 'DifferentSID': 3 },
      'R': { 'SameSID': 5, 'DifferentSID': 3 },
      'LP': { 'SameSID': 5, 'DifferentSID': 3 },
      'NR+': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR-': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR': { 'SameSID': 3, 'DifferentSID': 3 }
    },
    'R': { 
      'HP': { 'SameSID': 7, 'DifferentSID': 5 },
      'R': { 'SameSID': 5, 'DifferentSID': 3 },
      'LP': { 'SameSID': 5, 'DifferentSID': 3 },
      'NR+': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR-': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR': { 'SameSID': 3, 'DifferentSID': 3 }
    },
    'LP': {
      'HP': { 'SameSID': 8, 'DifferentSID': 6 },
      'R': { 'SameSID': 6, 'DifferentSID': 4 },
      'LP': { 'SameSID': 5, 'DifferentSID': 3 },
      'NR+': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR-': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR': { 'SameSID': 3, 'DifferentSID': 3 }
    },
    'NR+': {
      'HP': { 'SameSID': 11, 'DifferentSID': 8 },
      'R': { 'SameSID': 9, 'DifferentSID': 6 },
      'LP': { 'SameSID': 9, 'DifferentSID': 6 },
      'NR+': { 'SameSID': 5, 'DifferentSID': 3 },
      'NR-': { 'SameSID': 3, 'DifferentSID': 3 },
      'NR': { 'SameSID': 3, 'DifferentSID': 3 }
    },
    'NR-': {
      'HP': { 'SameSID': 9, 'DifferentSID': 9 },
      'R': { 'SameSID': 9, 'DifferentSID': 9 },
      'LP': { 'SameSID': 9, 'DifferentSID': 9 },
      'NR+': { 'SameSID': 9, 'DifferentSID': 6 },
      'NR-': { 'SameSID': 5, 'DifferentSID': 3 },
      'NR': { 'SameSID': 3, 'DifferentSID': 3 }
    },
    'NR': {
      'HP': { 'SameSID': 9, 'DifferentSID': 9 },
      'R': { 'SameSID': 9, 'DifferentSID': 9 },
      'LP': { 'SameSID': 9, 'DifferentSID': 9 },
      'NR+': { 'SameSID': 9, 'DifferentSID': 9 },
      'NR-': { 'SameSID': 9, 'DifferentSID': 9 },
      'NR': { 'SameSID': 5, 'DifferentSID': 3 }
    }
  };

  const columnMapping = {};

  fs.createReadStream(filePath)
    .pipe(csv({
      separator: ';',
    }))
    .on('data', (row) => {
      for (const column in row) {
        if (!columnMapping[column]) {
          columnMapping[column] = [];
        }
        columnMapping[column].push(row[column]);
      }
    })
    .on('end', () => {
      let count = 0;

      for (let i = 0; i < aircraftArray.length - 1; i++) {


        const typeAircraft1 = aircraftArray[i].typeAircraft;
        console.log(typeAircraft1)

        const typeAircraft2 = aircraftArray[+ 1].typeAircraft;

        const typeAircraft1_csv = findTypeName(typeAircraft1, columnMapping);
        const typeAircraft2_csv = findTypeName(typeAircraft2, columnMapping);
        if (typeAircraft1_csv && typeAircraft2_csv) {
          const requiredSeparation = getRequiredSeparation(typeAircraft1_csv, typeAircraft2_csv, LoARequirements);
          console.log("YINE")
          
          const actualDistance = distances[i];
          
          if (actualDistance < requiredSeparation) {
            count++;
          }
        }
        
        
      }
      console.log(`Number of aircraft pairs not maintaining required separation: ${count}`)
    }
  );

}

function findTypeName(typeAircraft, columnMapping) {
  for (const column in columnMapping) {
    if (columnMapping[column].includes(typeAircraft)) {
      return column;
    }
  }
  return null;
}

function getRequiredSeparation(typeAircraft1, typeAircraft2, LoARequirements) {
  console.log("HERE E")
  console.log(typeAircraft1 + "  " + typeAircraft2)
  minDistance = LoARequirements[typeAircraft1][typeAircraft2]
  return minDistance;
}

function ContrailsMinimum(aircraftArray, distances) {
  const separationRequirements = {
    'Super heavy': {
        'Heavy': 6,
        'Medium': 7,
        'Light': 8
    },
    'Heavy': {
        'Heavy': 4,
        'Medium': 5,
        'Light': 6
    },
    'Medium': {
        'Light': 5
    }
  };

  const violations = [];

  const contrailTranslation = {
      'Media': 'Medium',
      'Ligera': 'Light',
      'Pesada': 'Heavy',
      'Super pesada': 'Super heavy'
  };

  for (let i = 0; i < aircraftArray.length - 1; i++) {
      const preceding = contrailTranslation[aircraftArray[i].stele];
      const succeeding = contrailTranslation[aircraftArray[i + 1].stele];

      const requiredSeparation = (separationRequirements[preceding] || {})[succeeding];

      if (requiredSeparation !== undefined) {
          if (distances[i] < requiredSeparation) {
              violations.push({ precedingIndex: i, succeedingIndex: i + 1, actualSeparation: distances[i], requiredSeparation: requiredSeparation });
          }
      }
  }

  console.log(violations);
}

function findPositionAtTime(aircraft, time) {
  const marginInSeconds = 2;

  const validPosition = aircraft.route.find(coord => {
    
    const coordTime = moment.tz(`${moment(time).format('MM/DD/YYYY')} ${coord.timeOfDay}`, timeZone).toDate();
    const timeDiff = Math.abs(coordTime - time);

    return timeDiff <= marginInSeconds * 1000;
  });

  return validPosition || null;
}

function calculateDistance(U1, V1, U2, V2) {
  const distance = Math.sqrt((U1-U2)^2 + (V1-V2)^2)/1852;
  return distance;
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname + "/../uploads/")
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname)
  }
})

const upload = multer({ storage })

app.post("/upload", upload.single("file"), (req, res) => {
  res.send("Archivo subido con éxito")
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})