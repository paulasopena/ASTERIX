# ASTERIX DECODER

This project is a decoder and simulator of the information provided in the **ASTERIX** (All-purpose Structured EUROCONTROL Surveillance Information Exchange ) standard.
The surveillance sensors exchange information with this standarized format (ASTERIX) and to understand the information it is really important to understand how to decode this information.
The way of decoding this information is the core of the project.

ASTERIX classifies its information into different categories depending on the information exchanged. Each surveillance sensor has associated at least one category.
The category that has been decoded in this project is **CAT048**.

## TECHNOLOGY CHOSEN

The ASTERIX codec has been developed with a combination of technologies. 

The client-side application is built using **React** with **TypeScript**, taking advantage of the benefits that both technologies bring to the table.
**React** is a popular JavaScript library for building web user interfaces. By incorporating **TypeScript** into the mix, the development team benefits from static typing, enabling better code quality, early error detection, and improved developer tooling.
Since the output of the project had to be a desktop application, we introduced **Electron** into the equation. Electron allows developers to build cross-platform desktop applications using web technologies such as HTML, CSS, and JavaScript (or TypeScript in this case). This ensures that the ASTERIX codec can be deployed on various operating systems, providing a consistent user experience regardless of the platform.

On the server side, the technology of choice was **Express.js**, a fast and minimalist web application framework for Node.js. Leveraging the asynchronous, event-driven nature of Node.js, Express allows for the creation of lightweight and scalable server-side applications. Its simplicity makes it an excellent choice for building RESTful APIs, handling HTTP requests and responses efficiently.

In summary, the ASTERIX codec adopts a full-stack approach with React TypeScript and Electron for the client-side, Express for the server-side, and Node.js as the runtime bridging these components. This technology stack ensures a seamless development experience, efficient communication between client and server, and the flexibility to deploy the application as an executable program.

## STRUCTURE OF THE CODE

This section is clearly divide it into two parts:
### CLASSES AND OBJECTS USED
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
### FLOW STRUCTURE
## HOW TO MAKE IT WORK

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## FEATURES

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


