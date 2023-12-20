const express = require("express");
const fs = require("fs");
const cors = require("cors");
const File = require("../domain/File");
const multer = require("multer");
const Aircraft = require("../domain/Aircraft");
const csv = require("csv-parser");
const path = require("path");
const util = require("util");
const ExcelJS = require('exceljs');

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
          TYP
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
              timeOfDay: String(timeOfDay)
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

let aircraftIdentifiers = new Set();
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
      aircraftIdentifiers.add(row.getCell('B').value); 
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
    console.log(aircraftIdentifiers);

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
          TYP
        } = data

        const validTYPValues = [
          'Single ModeS All-Call',
          'Single ModeS Roll-Call',
          'ModeS All-Call + PSR',
          'ModeS Roll-Call + PSR'
        ];

        if (aircraftIdentifiers.has(aircraftIdentification)) {
          if (Number(lat) >= MIN_LAT && Number(lat) <= MAX_LAT && Number(lng) >= MIN_LNG && Number(lng) <= MAX_LNG) {
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
                  timeOfDay: String(timeOfDay)
                });
              }
            }
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