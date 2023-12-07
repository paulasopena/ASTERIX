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

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## HOW TO MAKE IT WORK

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## FEATURES

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.


