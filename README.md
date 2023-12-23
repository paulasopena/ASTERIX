# ❄️ ASTERIX DECODER (P2) ❄️

This project serves as a decoder and simulator for information provided in the **ASTERIX** (All-Purpose Structured EUROCONTROL Surveillance Information Exchange) standard.

Surveillance sensors exchange information in this standardized format (ASTERIX), and to comprehend the information, understanding the decoding process is of utmost importance. The decoding of this information forms the core of the project.

ASTERIX categorizes its information into different categories based on the exchanged data. Each surveillance sensor is associated with at least one category. The specific category decoded in this project is **CAT048**.

This software provides a glimpse into the tools that air traffic controllers use to assist them in maintaining the minimum separation between aircraft. Precision is crucial for both airborne and ground operations.


<img src="https://github.com/paulasopena/ASTERIX/assets/91852254/4f5e5f1c-4300-44eb-97ca-584fc09b457e" alt="Image" width="700" align="center">


## 🔸 TECHNOLOGY CHOSEN 🔸

The ASTERIX codec has been developed with a combination of technologies. 

The client-side application is built using **React** with **TypeScript**:
* **React** is a popular JavaScript library for building web user interfaces. By incorporating **TypeScript** into the mix, the development team benefits from static typing, enabling better code quality, early error detection, and improved developer tooling.
* Since the output of the project had to be a desktop application, we introduced **Electron** into the equation. Electron allows developers to build cross-platform desktop applications using web technologies such as HTML, CSS, and JavaScript (or TypeScript in this case). This ensures that the ASTERIX codec can be deployed on various operating systems, providing a consistent user experience regardless of the platform.

On the server side, the technology of choice was **Express.js**, a fast and minimalist web application framework for Node.js. Leveraging the asynchronous, event-driven nature of Node.js, Express allows for the creation of lightweight and scalable server-side applications. Its simplicity makes it an excellent choice for building RESTful APIs, handling HTTP requests and responses efficiently.

In summary, the ASTERIX codec adopts a full-stack approach with React TypeScript and Electron for the client-side, Express for the server-side, and Node.js as the runtime bridging these components. This technology stack ensures a seamless development experience, efficient communication between client and server, and the flexibility to deploy the application as an executable program.

<img src="https://github.com/paulasopena/ASTERIX/assets/91852254/505802ce-aa5d-4415-b2e4-d5ae9e2a0ba1" alt="logo512" width="100"> <img src="https://github.com/paulasopena/ASTERIX/assets/91852254/4068cbb2-e449-45a4-ae48-9d584ea5fe79" alt="Electron Logo" width="100"> 


### 🔹 LIBRARIES
Regarding the libraries used, we want to highlight the one utilized for the map:
* We have chosen to employ Deck.gl, a library that provides us with a 3D map in various styles.

## 🔸 STRUCTURE OF THE CODE 🔸

This section is clearly divide it into two parts:
### 🔹 CLASSES AND OBJECTS USED 🔹
#### ▫️ CAT048
This class contains all the information that can be provided by the data items. If the data item exists, then its information is fullfilled in this class, in case it does not it is left blank.
<details>
  <summary><strong>CAT048 CLASS CODE</strong></summary>
  
  ```Javascript
class CAT048 {
  constructor(messages) {
    this.messages = messages
    this.dataSourceIdentifier = { SAC: 0, SIC: 0 }
    this.targetReportDescriptor = {
      TYP: "",
      SIM: "",
      RDP: "",
      SPI: "",
      RAB: ""
    }
    this.measuredPositionPolarCoordinates = { rho: 0, theta: 0 }
    this.calculatedPositionCartesianCoordinates = { x: 0, y: 0 }
    this.calculatedPositionLLACoordinates = { lat: 0, lng: 0 }
    this.mode3ACodeOctalRepresentation = { V: "", G: "", L: "", mode3A: "" }
    this.flightLevelBinaryRepresentation = { V: "", G: "", flightLevel: 0 }
    this.modeCcorrected = 0
    this.heightMeasuredBy3DRadar = { Height: 0 }
    this.radarPlotCharacteristics = {
      SRL: "",
      SRR: "",
      SAM: "",
      PRL: "",
      PAM: "",
      RPD: "",
      APD: ""
    }
    this.timeOfDay = ""
    this.trackNumber = 0
    this.trackStatus = { CNF: "", RAD: "", DOU: "", MAH: "", CDM: "" }
    this.calculatedTrackVelocityPolarCoordinates = { rho: 0, theta: 0 }
    this.aircraftAddress = ""
    this.communicationsACASCapabilityFlightStatus = {
      COM: "",
      STAT: "",
      SI: "",
      MSSC: "",
      ARC: "",
      AIC: "",
      B1A: "",
      B1B: ""
    }
    this.aircraftIdentification = ""
    this.BDSRegisterData = {
      modeS: "",
      RASstatus: 0,
      RollAngle: 0,
      TTAstatus: 0,
      TrueTrackAngle: 0,
      GSstatus: 0,
      GroundSpeed: 0,
      TARstatus: 0,
      TrackAngleRate: 0,
      TAstatus: 0,
      TrueAirspeed: 0,
      HDGstatus: 0,
      HDG: 0,
      IASstatus: 0,
      IAS: 0,
      MACHstatus: 0,
      MACH: 0,
      BARstatus: 0,
      BAR: 0,
      IVVstatus: 0,
      IVV: 0,
      MCPstatus: 0, //1
      MCPaltitude: 0,
      FMSstatus: 0,
      FMSaltitude: 0,
      BPSstatus: 0,
      BPSpressure: 0,
      modeStatus: 0,
      VNAV: 0,
      ALTHold: 0,
      approach: 0,
      targetAltStatus: "",
      targetAltSource: ""
    }
  }
````
</details>

#### ▫️ AIRCRAFT
This class is used to select only the relevant information from the previous class to display it into the simulation. 
<details>
  <summary><strong>AIRCRAFT CLASS CODE</strong></summary>
  
  ```Javascript
class Aircraft {
    constructor(aircraftIdentification, IAS, flightLevel, route, TYP) {
      this.aircraftIdentification = aircraftIdentification
      this.IAS = IAS
      this.flightLevel = flightLevel
      this.route = route
      this.TYP=TYP
    }
  
    addRouteElement(newRoute) {
      this.route.push(newRoute)
    }
  }
````
</details>

#### ▫️ FILE 
This class finds out only the CAT048 messages from the binary file uploaded.

<details>
  <summary><strong>FILE CLASS CODE</strong></summary>
  
  ```Javascript
class File {
  constructor(path) {
    this.path = path;
    this.cat048 = [];
  }

  readFile() {
    const fileBuffer = fs.readFileSync(this.path);

    let i = 0;
    let counter = fileBuffer.readUInt8(2);

    let listByte = [];

    while (i < fileBuffer.length) {
      const array = fileBuffer.slice(i, i + counter);
      listByte.push(array);
      i += counter;

      if (i + 2 < fileBuffer.length) {
        counter = fileBuffer.readUInt8(i + 2);
      }
    }

    for (const arraystring of listByte) {
      const CAT = parseInt(arraystring[0].toString(16).padStart(2, "0"), 16);

      if (CAT === 48) {
        const newcat048 = new CAT048(arraystring);
        this.cat048.push(newcat048);
      }
    }
  }
}
````
</details>

#### ▫️ MAIN DECODER FUNCTION
<details>
  <summary><strong>decodeMessages()</strong></summary>

```Javascript
async decodeMessages() {
    const length = this.messages.readUInt16BE(1) // Comencem a llegir 16 desde la posició 1 (ens saltem la CAT)
    const realLength = this.messages.length
    assert.strictEqual(length, realLength, "Length mismatch.")

    var i = 0
    var moreFSPEC = true

    var numFSPEC = 0

    while (i <= 4) {
      // Analitzem el FSPEC
      if (moreFSPEC) {
        var currentByte = this.messages.readUInt8(i + 3)
        const binaryArray = currentByte
          .toString(2)
          .padStart(8, "0")
          .split("")
          .reverse() // [7,6,5,4,3,2,1,0]

        if (binaryArray[0] === "1") {
          numFSPEC += 1
        } else {
          numFSPEC += 1 // Aquí també per saber quants 'blocs' de data items també, el últim FSPEC será false però tindrem 3 blocs (bytes)
          moreFSPEC = false
        }
      }
      i = i + 1
    }

    var j = 0
    var counter = 3

    while (j < numFSPEC) {
      var currentByte = this.messages.readUInt8(j + 3)
      const binaryArray = currentByte
        .toString(2)
        .padStart(8, "0")
        .split("")
        .reverse() // [7,6,5,4,3,2,1,0]

      switch (j) {
        case 0:
          /*  
                        Data Item I048/010, Data Source Identifier
                        Definition: Identification of the radar station from which the data is received.
                        Format: Two-octet fixed length Data Item.
                    */
          if (binaryArray[7] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 2
            )
            this.setDataSourceIdentifier(parameter)
            counter = counter + 2
          } else {
            console.log("Data Source Identifier: null")
          }

          /*  
                        Data Item I048/140, Time of Day
                        Definition: Absolute time stamping expressed as Co-ordinated Universal Time (UTC).
                        Format: Three-octet fixed length Data Item. 
                    */
          if (binaryArray[6] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 3
            )
            this.setTimeOfDay(parameter)
            counter = counter + 3
          } else {
            console.log("Time of Day: null")
          }

          /*
                        Data Item I048/020, Target Report Descriptor
                        Definition: Type and properties of the target report.
                        Format: Variable length Data Item comprising a first part of one-octet, followed by one-octet extents 
                        as necessary.
                    */
          if (binaryArray[5] === "1") {
            var numTarget = 0
            var moreTarget = true
            var i = 0

            while (i <= 3) {
              if (moreTarget) {
                var octet1 = this.messages
                  .readUInt8(numFSPEC + counter + i)
                  .toString(2)
                  .padStart(8, "0")
                  .split("")
                if (octet1[7] === "1") {
                  numTarget += 1
                } else {
                  numTarget += 1
                  moreTarget = false
                }
              }
              i = i + 1
            }

            var parameter

            if (numTarget == 1) {
              parameter = this.messages.subarray(
                numFSPEC + counter,
                numFSPEC + counter + 1
              )
              counter = counter + 1
            } else if (numTarget == 2) {
              parameter = this.messages.subarray(
                numFSPEC + counter,
                numFSPEC + counter + 2
              )
              counter = counter + 2
            } else {
              parameter = this.messages.subarray(
                numFSPEC + counter,
                numFSPEC + counter + 3
              )
              counter = counter + 3
            }

            this.setTargetReportDescriptor(parameter, numTarget)
          } else {
            console.log("Target Report Descriptor: null")
          }

          /*
                        Data Item I048/040, Measured Position in Polar Co-ordinates
                        Definition: Measured position of an aircraft in local polar co-ordinates.
                        Format: Four-octet fixed length Data Item.
                    */
          if (binaryArray[4] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 4
            )
            this.setMeasuredPositionPolarCoordinates(parameter)
            counter = counter + 4
          }

          /*
                        Data Item I048/070, Mode-3/A Code in Octal Representation
                        Definition: Mode-3/A code converted into octal representation.
                        Format: Two-octet fixed length Data Item.
                    */
          if (binaryArray[3] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 2
            )
            this.setMode3ACodeOctalRepresentation(parameter)
            counter = counter + 2
          }

          /*
                        Data Item I048/090, Flight Level in Binary Representation
                        Definition: Flight Level converted into binary representation.
                        Format: Two-octet fixed length Data Item.
                    */
          if (binaryArray[2] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 2
            )
            this.setFlightLevelBinaryRepresentation(parameter)
            counter = counter + 2
          }

          /*
                        Data Item I048/130, Radar Plot Characteristics
                        Definition: Additional information on the quality of the target report.
                        Format: Compound Data Item.
                    */
          if (binaryArray[1] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 1
            )
            var octet = parameter[0].toString(2).padStart(8, "0")

            var subfieldCounter = 0

            if (octet[0] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var srl = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(srl, 0)
              subfieldCounter += 1
            }
            if (octet[1] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var srr = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(srr, 1)
              subfieldCounter += 1
            }
            if (octet[2] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var sam = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(sam, 2)
              subfieldCounter += 1
            }
            if (octet[3] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var prl = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(prl, 3)
              subfieldCounter += 1
            }
            if (octet[4] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var pam = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(pam, 4)
              subfieldCounter += 1
            }
            if (octet[5] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var rpd = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(rpd, 5)
              subfieldCounter += 1
            }
            if (octet[6] === "1") {
              var parameter = this.messages.subarray(
                numFSPEC + counter + subfieldCounter + 1,
                numFSPEC + counter + subfieldCounter + 2
              )
              var apd = parameter[0].toString(2).padStart(8, "0")
              this.setRadarPlotCharacteristics(apd, 6)
              subfieldCounter += 1
            }
            if (octet[7] === "1") {
              //End of primary subfield
            }

            var subfieldLength = subfieldCounter + 1
            counter = counter + subfieldLength
          }
          break
        case 1:
          /*
                        Data Item I048/220, Aircraft Address
                        Definition: Aircraft address (24-bits Mode S address) assigned uniquely to each aircraft.
                        Format: Three-octet fixed length Data Item.
                    */
          if (binaryArray[7] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 3
            )
            this.setAircraftAddress(parameter)
            counter = counter + 3
          }

          /*
                        Data Item I048/240, Aircraft Identification
                        Definition: Aircraft identification (in 8 characters) obtained from an aircraft equipped with a 
                        Mode S transponder.
                        Format: Six-octet fixed length Data Item.
                    */
          if (binaryArray[6] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 6
            )
            this.setAircraftIdentification(parameter)
            counter = counter + 6
          }

          /*
                        Data Item I048/250, BDS Register Data
                        Definition: BDS Register Data as extracted from the aircraft transponder.
                        Format: Repetitive Data Item starting with a one-octet Field Repetition Indicator (REP) followed 
                        by at least one BDS Register comprising one seven octet BDS Register Data and one octet BDS Register 
                        code.
                    */
          if (binaryArray[5] === "1") {
            var parameterRepetition = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 1
            )
            const bitsRepetition = parameterRepetition[0]
              .toString(2)
              .padStart(8, "0")
            const numberBDS = parseInt(bitsRepetition, 2)
            counter = counter + 1
            let byteBDS = counter
            for (let i = 0; i < numberBDS; i += 1) {
              var parameterBDSData = this.messages.subarray(
                numFSPEC + byteBDS,
                numFSPEC + byteBDS + 8
              )
              const bitsBDSData = parameterBDSData[0]
                .toString(2)
                .padStart(8, "0")
              const bitsBDSData2 = parameterBDSData[1]
                .toString(2)
                .padStart(8, "0")
              const bitsBDSData3 = parameterBDSData[2]
                .toString(2)
                .padStart(8, "0")
              const bitsBDSData4 = parameterBDSData[3]
                .toString(2)
                .padStart(8, "0")
              const bitsBDSData5 = parameterBDSData[4]
                .toString(2)
                .padStart(8, "0")
              const bitsBDSData6 = parameterBDSData[5]
                .toString(2)
                .padStart(8, "0")
              const bitsBDSData7 = parameterBDSData[6]
                .toString(2)
                .padStart(8, "0")
              const chainBitsDataBDS =
                bitsBDSData +
                bitsBDSData2 +
                bitsBDSData3 +
                bitsBDSData4 +
                bitsBDSData5 +
                bitsBDSData6 +
                bitsBDSData7
              var parameterBDSRegister = this.messages.subarray(
                numFSPEC + byteBDS + 7,
                numFSPEC + byteBDS + 8
              )
              this.setModeBDS(parameterBDSRegister, chainBitsDataBDS)
              byteBDS = byteBDS + 8
            }

            counter = counter + numberBDS * 8
          }

          /*
                        Data Item I048/161, Track Number
                        Definition: An integer value representing a unique reference to a track record within a particular 
                        track file.
                        Format: Two-octet fixed length Data Item.
                    */
          if (binaryArray[4] === "1") {
            var parameterTrackNumber = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 2
            )
            this.setTrackNumber(parameterTrackNumber)
            counter = counter + 2
          }

          /*
                        Data Item I048/042, Calculated Position in Cartesian Co-ordinates
                        Definition: Calculated position of an aircraft in Cartesian co-ordinates.
                        Format: Four-octet fixed length Data Item in Two’s Complement.
                    */
          if (binaryArray[3] === "1") {
            var parameterCartesianCoordinates = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 4
            )
            this.setCalculatedPositionCartesianCoordinates(
              parameterCartesianCoordinates
            )
            counter = counter + 4
          }

          /*
                        Data Item I048/200, Calculated Track Velocity in Polar Co-ordinates
                        Definition: Calculated track velocity expressed in polar co-ordinates.
                        Format: Four-octet fixed length Data Item.
                    */
          if (binaryArray[2] === "1") {
            var parameterTrackVelocity = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 4
            )
            this.setCalculatedTrackVelocityPolarCoordinates(
              parameterTrackVelocity
            )
            counter = counter + 4
          }

          /*
                        Data Item I048/170, Track Status
                        Definition: Status of monoradar track (PSR and/or SSR updated).
                        Format: Variable length Data Item comprising a first part of one-octet, followed by one-octet 
                        extents as necessary.
                    */
          if (binaryArray[1] === "1") {
            var parameterTrackStatus = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 1
            )
            this.setTrackStatus(parameterTrackStatus)
            const firstByteTrackStatus = parameterTrackStatus[0]
              .toString(2)
              .padStart(8, "0")
            const fx = firstByteTrackStatus.split("")
            counter = counter + 1
            if (fx[7] === "1") {
              var parameterTrackStatusSecondByte = this.messages.subarray(
                numFSPEC + counter + 1,
                numFSPEC + counter + 2
              )
              this.setTrackStatus2(parameterTrackStatusSecondByte)
              counter = counter + 1
            }
          }
          break
        case 2:
          /*
                        No s'ha d'analitzar (I048/210)
                        Four-octet fixed length Data Item.
                    */
          if (binaryArray[7] === "1") {
            counter = counter + 4
          }

          /*
                        No s'ha d'analitzar (I048/030)
                        Variable length Data Item comprising a first part of one-octet, followed by one-octet extents as necessary.
                    */
          if (binaryArray[6] === "1") {
            var numTarget = 0
            var moreTarget = true
            var i = 0

            while (moreTarget) {
              var octet1 = this.messages
                .readUInt8(numFSPEC + counter + i)
                .toString(2)
                .padStart(8, "0")
                .split("")
              if (octet1[7] === "1") {
                numTarget += 1
              } else {
                numTarget += 1
                moreTarget = false
              }
              i = i + 1
            }

            counter = counter + numTarget
          }

          /*
                        No s'ha d'analitzar (I048/080)
                        Two-octet fixed length Data Item.
                    */
          if (binaryArray[5] === "1") {
            counter = counter + 2
          }

          /*
                        No s'ha d'analitzar (I048/100)
                        Four-octet fixed length Data Item.
                    */
          if (binaryArray[4] === "1") {
            counter = counter + 4
          }

          /*
                        Data Item I048/110, Height Measured by a 3D Radar
                        Definition: Height of a target as measured by a 3D radar. The height shall use mean sea level as the 
                        zero reference level.
                        Format: Two-octet fixed length Data Item.
                    */
          if (binaryArray[3] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 2
            )
            this.setHeightMeasuredBy3DRadar(parameter)
            counter = counter + 2
          }

          /*
                        No s'ha d'analitzar (I048/120)
                        Compound Data Item, comprising a primary subfield of one octet, followed by one of the two defined subfields.
                    */
          if (binaryArray[2] === "1") {
            var octet1 = this.messages
              .readUInt8(numFSPEC + counter)
              .toString(2)
              .padStart(8, "0")
              .split("")
            if (octet1[0] === "1") {
              counter = counter + 3
            } else if (octet1[1] === "1") {
              counter = counter + 8
            }
          }

          /*
                        Data Item I048/230, Communications/ACAS Capability and Flight Status
                        Definition: Communications capability of the transponder, capability of the on-board ACAS equipment 
                        and flight status.
                        Format: Two-octet fixed length Data Item.
                    */
          if (binaryArray[1] === "1") {
            var parameter = this.messages.subarray(
              numFSPEC + counter,
              numFSPEC + counter + 2
            )
            this.setCommunicationsACASCapabilityFlightStatus(parameter)
            counter = counter + 2
          }
          break
      }
      this.setModeCCorrected()
      this.setLatitudeLongitude()
      j += 1
    }
  }
````
  
</details>

### 🔹 FLOW STRUCTURE 🔹

As mentioned in the technology section, the project follows a client-server structure. In essence, the client initiates an HTTP POST REQUEST to send a file for decoding, and the server undertakes the decoding process. Upon decoding, a CSV file containing the decoded information is generated and stored in a designated location within the project. This approach is adopted due to the decoded CSV's considerable size, surpassing the constraints of a typical HTTP REQUEST.

Subsequently, when the simulation phase commences, another HTTP request is sent to the server. In response, the server provides a list of Aircrafts along with their respective routes. This crucial data enables the client to simulate trajectories effectively.

![Diagrama sin título](https://github.com/paulasopena/ASTERIX/assets/91852254/a4b9a790-7e8a-4280-a4c1-cad4a27286de)

## 🔸 HOW TO MAKE IT WORK 🔸

The code has **four main functions**:

1. Read and decode the binary data into CAT048 information.
2. Export the decoded data to a CSV file.
3. Generate a KML file that can be imported into Google Earth with relevant information.
4. Display the information in a user-friendly and paginated table.
  
![image](https://github.com/paulasopena/ASTERIX/assets/91852254/5a0585ea-d2c6-456e-8d31-6ebbd4a858b9)


## 🔸GANTT DIAGRAM AND PROJECT DEVELOPMENT 🔸

In order to summarize the development progress contributed by the three main contributors, a Gantt diagram has been created.

![image](https://github.com/paulasopena/ASTERIX/assets/91852254/ea64e0e1-79ed-4463-819c-d565444c29f7)

As it can be seen in the GANTT diagram, the most time consuming parts have been the decoding of the data item 250 and doing the transformations to coordinates WGS84.

# ❄️ STATISTICAL ANALYSIS OF TECHNICAL AND AOPERATIONAL PARAMETERS (P3) ❄️

The essence of this project is an analytical review of the implementation of new RNAV 1 Standard Instrument Departures (SIDs) at Barcelona Airport (LEBL), a pivotal component of the BRAIN Phase II project initiated in April 2023. This project is oriented towards augmenting the airport's movement capacity. Following a designated period of testing and transition, we aim to evaluate the fidelity of actual take-off trajectories to the SIDs as delineated in the AIP.

Our study encompasses a statistical analysis of diverse technical and operational parameters associated with take-offs from runways RWY 24L and RWY 06R. Key ATM parameters under study include the losses in separation between consecutive take-offs, assessed through:

1. Radar
2. LoA (Letter of Agreement between LECB-LEBL, encompassing TMA-TWR)
3. Contrails

Building upon the success of Project 2, which developed an ASTERIX decoder and simulator, this project extends those efforts.


## 🔸 CREATORS AND CONTRIBUTORS 🔸

* Alba Roma Gómez 🌺
* Itziar Mensa Minguito 🌻
* Paula Sopena Coello 🌼
* Víctor Peso Keyer 🪻
* Ismael Benítez Martínez 🍃
* Guillem Purtí Ramírez 🍂


