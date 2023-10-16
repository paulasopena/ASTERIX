import React from "react";
import { useEffect, useState } from 'react';
import { fetchBytes } from "../../asterix/file_manager";
import { Message } from "../../domain/Message";

const Home = () => {
  const [fileData, setFileData] = useState<Message[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBytes('230502-est-080001_BCN_60MN_08_09.ast');
        if (data != undefined) {
          const parsedData = JSON.parse(data);
          setFileData(parsedData);
        }        
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <p>This is the main Page</p>
      <ul style={{textAlign: 'left'}}>
        {fileData.map((message, index) => (
          <li key={index}>
            <p>Message number: {index}</p>
            <p>Data: </p>
            <ul>
              <li>{message.message.messages.data.join(', ')}</li>
            </ul>
            <p>Data Source Identifier:</p>
            <ul>
              <li>SAC: {message.message.dataSourceIdentifier.SAC}</li>
              <li>SIC: {message.message.dataSourceIdentifier.SIC}</li>
            </ul>
            <p>Time of day:</p>
            <ul>
              <li>In seconds: {message.message.timeOfDay}</li>
            </ul>
            <p>Target Report Descriptor:</p>
            <ul>
              <li>TYP: {message.message.targetReportDescriptor.TYP}</li>
              <li>SIM: {message.message.targetReportDescriptor.SIM}</li>
              <li>SPI: {message.message.targetReportDescriptor.SPI}</li>
              <li>RAB: {message.message.targetReportDescriptor.RAB}</li>
              <li>TST: {message.message.targetReportDescriptor.TST}</li>
              <li>ERR: {message.message.targetReportDescriptor.ERR}</li>
              <li>XPP: {message.message.targetReportDescriptor.XPP}</li>
              <li>ME: {message.message.targetReportDescriptor.ME}</li>
              <li>MI: {message.message.targetReportDescriptor.MI}</li>
              <li>FOE_FRI: {message.message.targetReportDescriptor.FOE_FRI}</li>
              <li>ADSB_EP: {message.message.targetReportDescriptor.ADSB_EP}</li>
              <li>ADSB_VAL: {message.message.targetReportDescriptor.ADSB_VAL}</li>
              <li>SCN_EP: {message.message.targetReportDescriptor.SCN_EP}</li>
              <li>SCN_VAL: {message.message.targetReportDescriptor.SCN_VAL}</li>
              <li>PAI_EP: {message.message.targetReportDescriptor.PAI_EP}</li>
              <li>PAI_VAL: {message.message.targetReportDescriptor.PAI_VAL}</li>
              <li>SPARE: {message.message.targetReportDescriptor.SPARE}</li>
            </ul>
            <p>Measured Position in Polar Co-ordinates:</p>
            <ul>
              <li>RHO: {message.message.measuredPositionPolarCoordinates.rho}</li>
              <li>THETA: {message.message.measuredPositionPolarCoordinates.theta}</li>
            </ul>
            <p>Mode-3/A Code in Octal Representation:</p>
            <ul>
              <li>V: {message.message.mode3ACodeOctalRepresentation.V}</li>
              <li>G: {message.message.mode3ACodeOctalRepresentation.G}</li>
              <li>Mode3A: {message.message.mode3ACodeOctalRepresentation.mode3A}</li>
            </ul>
            <p>Flight Level in Binary Representation:</p>
            <ul>
              <li>G: {message.message.flightLevelBinaryRepresentation.G}</li>
              <li>V: {message.message.flightLevelBinaryRepresentation.V}</li>
              <li>Flight Level: {message.message.flightLevelBinaryRepresentation.flightLevel}</li>
            </ul>
            <p>Radar Plot Characteristics:</p>
            <ul>
              <li>SRL: {message.message.radarPlotCharacteristics.SRL}</li>
              <li>SRR: {message.message.radarPlotCharacteristics.SRR}</li>
              <li>SAM: {message.message.radarPlotCharacteristics.SAM}</li>
              <li>PRL: {message.message.radarPlotCharacteristics.PRL}</li>
              <li>PAM: {message.message.radarPlotCharacteristics.PAM}</li>
              <li>RPD: {message.message.radarPlotCharacteristics.RPD}</li>
              <li>APD: {message.message.radarPlotCharacteristics.APD}</li>
            </ul>
            <p>Aircraft address:</p>
            <ul>
              <li>{message.message.aircraftAddress}</li>
            </ul>
            <p>Aircraft identifier:</p>
            <ul>
              <li>{message.message.aircraftIdentification}</li>
            </ul>
            <p>Track number:</p>
            <ul>
              <li>{message.message.trackNumber}</li>
            </ul>
            <p>Calculated position cartesian coordinates:</p>
            <ul>
              <li>X: {message.message.calculatedPositionCartesianCoordinates.x}</li>
              <li>Y: {message.message.calculatedPositionCartesianCoordinates.y}</li>
            </ul>
            <p>Calculated Track Velocity in Polar Coordinates:</p>
            <ul>
              <li>Ground speed (kt): {message.message.calculatedTrackVelocityPolarCoordinates.rho}</li>
              <li>Heading: {message.message.calculatedTrackVelocityPolarCoordinates.theta}</li>
            </ul>
            <p>Track Status:</p>
            <ul>
              <li>CNF: {message.message.trackStatus.CNF}</li>
              <li>RAD: {message.message.trackStatus.RAD}</li>
              <li>DOU: {message.message.trackStatus.DOU}</li>
              <li>MAH: {message.message.trackStatus.MAH}</li>
              <li>CDM: {message.message.trackStatus.CDM}</li>
              <li>TRE: {message.message.trackStatus.TRE}</li>
              <li>GHO: {message.message.trackStatus.GHO}</li>
              <li>SUP: {message.message.trackStatus.SUP}</li>
              <li>TCC: {message.message.trackStatus.TCC}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;