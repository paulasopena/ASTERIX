# ❄️ ASTERIX DECODER ❄️

This project serves as a decoder and simulator for information provided in the **ASTERIX** (All-Purpose Structured EUROCONTROL Surveillance Information Exchange) standard.

Surveillance sensors exchange information in this standardized format (ASTERIX), and to comprehend the information, understanding the decoding process is of utmost importance. The decoding of this information forms the core of the project.

ASTERIX categorizes its information into different categories based on the exchanged data. Each surveillance sensor is associated with at least one category. The specific category decoded in this project is **CAT048**.

This software provides a glimpse into the tools that air traffic controllers use to assist them in maintaining the minimum separation between aircraft. Precision is crucial for both airborne and ground operations.

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

### 🔹 FLOW STRUCTURE 🔹

As mentioned in the technology section, the project follows a client-server structure. In essence, the client initiates an HTTP POST REQUEST to send a file for decoding, and the server undertakes the decoding process. Upon decoding, a CSV file containing the decoded information is generated and stored in a designated location within the project. This approach is adopted due to the decoded CSV's considerable size, surpassing the constraints of a typical HTTP REQUEST.

Subsequently, when the simulation phase commences, another HTTP request is sent to the server. In response, the server provides a list of Aircrafts along with their respective routes. This crucial data enables the client to simulate trajectories effectively.

![Diagrama sin título drawio (1)](https://github.com/paulasopena/ASTERIX/assets/91852254/7cf31482-19a2-4dec-99a2-44a250493186)

## 🔸 HOW TO MAKE IT WORK 🔸
Videos that explain the software demo.
## 🔸GANTT DIAGRAM AND PROJECT DEVELOPMENT 🔸

In order to summarize the development progress contributed by the three main contributors, a Gantt diagram has been created.

![image](https://github.com/paulasopena/ASTERIX/assets/91852254/ea64e0e1-79ed-4463-819c-d565444c29f7)

As it can be seen in the GANTT diagram, the most time consuming parts have been the decoding of the data item 250 and doing the transformations to coordinates WGS84.
## 🔸 CREATORS AND CONTRIBUTORS 🔸

* Alba Roma Gómez 🌺
* Itziar Mensa Minguito 🌻
* Paula Sopena Coello 🌼
* Víctor Peso Keyer 🪻
* Ismael Benítez Martínez 🍃
* Guillem Purtí Ramírez 🍂


