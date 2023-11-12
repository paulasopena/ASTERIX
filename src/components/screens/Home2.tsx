import React from "react";
import { useEffect, useState } from 'react';
import { fetchBytes } from "../../asterix/file_manager";
import { Message } from "../../domain/Message";
import { useNavigate } from "react-router-dom";
import './HomeStyle.css';

const Home2 = () => {
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
      <table>
          <thead>
              <tr>
                  <th>NUM</th>
                  <th>SAC</th>
                  <th>SIC</th>
                  <th>Time</th>
                  <th>Latitud</th>
                  <th>Longitud</th>
                  <th>TYP020</th>
                  <th>SIM020</th>
                  <th>RDP020</th>
                  <th>SPI020</th>
                  <th>RAB020</th>
                  <th>TST020</th>
                  <th>ERR020</th>
                  <th>XPP020</th>
                  <th>ME020</th>
                  <th>MI020</th>
                  <th>FOEFRI 020</th>
                  <th>RHO</th>
                  <th>THETA</th>
                  <th>V070</th>
                  <th>G070</th>
                  <th>Mode 3A</th>
                  <th>V090</th>
                  <th>G090</th>
                  <th>Flight Level</th>
                  <th>ModeC Corrected</th>
                  <th>SRL130</th>
                  <th>SRR130</th>
                  <th>SAM130</th>
                  <th>PRL130</th>
                  <th>PAM130</th>
                  <th>RDP130</th>
                  <th>APD130</th>
                  <th>Target Address</th>
                  <th>Target identification</th>
                  <th>Mode S</th>
                  <th>MCPSTATUS</th>
                  <th>MCP ALT</th>
                  <th>FMSSTATUS</th>
                  <th>FMS ALT</th>
                  <th>BPSTATUS</th>
                  <th>BP</th>
                  <th>Mode Status</th>
                  <th>VNAV</th>
                  <th>ALT HOLD</th>
                  <th>APP</th>
                  <th>TARGETALT STATUS</th>
                  <th>TARGETALT SOURCE</th>
                  <th>RASTATUS</th>
                  <th>RA</th>
                  <th>TTASTATUS</th>
                  <th>TTA</th>
                  <th>GSSTATUS</th>
                  <th>GS</th>
                  <th>TARSTATUS</th>
                  <th>TAR</th>
                  <th>TASSTATUS</th>
                  <th>TAS</th>
                  <th>HDGSTATUS</th>
                  <th>HDG</th>
                  <th>IASSTATUS</th>
                  <th>IAS</th>
                  <th>MACHSTATUS</th>
                  <th>MACH</th>
                  <th>BARSTATUS</th>
                  <th>BAR</th>
                  <th>IVVSTATUS</th>
                  <th>IVV</th>
                  <th>Track number</th>
                  <th>X Component</th>
                  <th>Y Component</th>
                  <th>Ground speed (kt)</th>
                  <th>Heading</th>
                  <th>CNF170</th>
                  <th>RAD170</th>
                  <th>DOU170</th>
                  <th>MAH170</th>
                  <th>CDM170</th>
                  <th>TRE170</th>
                  <th>GHO170</th>
                  <th>SUP170</th>
                  <th>TCC170</th>
                  <th>Measured Height</th>
                  <th>COM230</th>
                  <th>STAT230</th>
                  <th>SI230</th>
                  <th>MSCC230</th>
                  <th>ARC230</th>
                  <th>AIC230</th>
                  <th>B1A230</th>
                  <th>B1B230</th>
              </tr>
          </thead>
          <tbody>
            {fileData.map((message, index) => (
              <tr key={index}>
                <td>{index}</td>
                <td>{message.message.dataSourceIdentifier.SAC}</td>
                <td>{message.message.dataSourceIdentifier.SIC}</td>
                <td>{message.message.timeOfDay}</td>
                <td>LATITUDE MISSING</td>
                <td>LONGITUDE MISSING</td>
                <td>{message.message.targetReportDescriptor.TYP}</td>
                <td>{message.message.targetReportDescriptor.SIM}</td>
                <td></td>
                <td>{message.message.targetReportDescriptor.SPI}</td>
                <td>{message.message.targetReportDescriptor.RAB}</td>
                <td>{message.message.targetReportDescriptor.TST}</td>
                <td>{message.message.targetReportDescriptor.ERR}</td>
                <td>{message.message.targetReportDescriptor.XPP}</td>
                <td>{message.message.targetReportDescriptor.ME}</td>
                <td>{message.message.targetReportDescriptor.MI}</td>
                <td>{message.message.targetReportDescriptor.FOE_FRI}</td>
                <td>{message.message.measuredPositionPolarCoordinates.rho}</td>
                <td>{message.message.measuredPositionPolarCoordinates.theta}</td>
                <td>{message.message.mode3ACodeOctalRepresentation.V}</td>
                <td>{message.message.mode3ACodeOctalRepresentation.G}</td>
                <td>{message.message.mode3ACodeOctalRepresentation.mode3A}</td>
                <td>{message.message.flightLevelBinaryRepresentation.V}</td>
                <td>{message.message.flightLevelBinaryRepresentation.G}</td>
                <td>{message.message.flightLevelBinaryRepresentation.flightLevel}</td>
                <td>MODE C CORRECTED MISSING?</td>
                <td>{message.message.radarPlotCharacteristics.SRL}</td>
                <td>{message.message.radarPlotCharacteristics.SRR}</td>
                <td>{message.message.radarPlotCharacteristics.SAM}</td>
                <td>{message.message.radarPlotCharacteristics.PRL}</td>
                <td>{message.message.radarPlotCharacteristics.PAM}</td>
                <td>{message.message.radarPlotCharacteristics.RPD}</td>
                <td>{message.message.radarPlotCharacteristics.APD}</td>
                <td>{message.message.aircraftAddress}</td>
                <td>{message.message.aircraftIdentification}</td>
                <td>{message.message.BDSRegisterData.modeS}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.MCPstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.MCPaltitude}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.FMSstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.FMSaltitude}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.BPSstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.BPSpressure}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.modeStatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.VNAV}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.ALTHold}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.approach}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.targetAltStatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode4.targetAltSource}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.RASstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.RollAngle}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.TTAstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.TrueTrackAngle}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.GSstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.GroundSpeed}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.TARstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.TrackAngleRate}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.TAstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode5.TrueAirspeed}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.HDGstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.HDG}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.IASstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.IAS}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.MACHstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.MACH}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.BARstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.BAR}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.IVVstatus}</td>
                <td>{message.message.BDSRegisterData.bdsCode6.IVV}</td>
                <td>{message.message.trackNumber}</td>
                <td>{message.message.calculatedPositionCartesianCoordinates.x}</td>
                <td>{message.message.calculatedPositionCartesianCoordinates.y}</td>
                <td>{message.message.calculatedTrackVelocityPolarCoordinates.rho}</td>
                <td>{message.message.calculatedTrackVelocityPolarCoordinates.theta}</td>
                <td>{message.message.trackStatus.CNF}</td>
                <td>{message.message.trackStatus.RAD}</td>
                <td>{message.message.trackStatus.DOU}</td>
                <td>{message.message.trackStatus.MAH}</td>
                <td>{message.message.trackStatus.CDM}</td>
                <td>{message.message.trackStatus.TRE}</td>
                <td>{message.message.trackStatus.GHO}</td>
                <td>{message.message.trackStatus.SUP}</td>
                <td>{message.message.trackStatus.TCC}</td>
                <td>{message.message.heightMeasuredBy3DRadar.Height}</td>
                <td>{message.message.communicationsACASCapabilityFlightStatus.COM}</td>
                <td>{message.message.communicationsACASCapabilityFlightStatus.STAT}</td>
                <td>{message.message.communicationsACASCapabilityFlightStatus.SI}</td>
                <td>{message.message.communicationsACASCapabilityFlightStatus.MSSC}</td>
                <td>{message.message.communicationsACASCapabilityFlightStatus.ARC}</td>
                <td>{message.message.communicationsACASCapabilityFlightStatus.AIC}</td>
                <td>BDS 1,0 bit 16 = {message.message.communicationsACASCapabilityFlightStatus.B1A}</td>
                <td>BDS 1,0 bits 37/40 = {message.message.communicationsACASCapabilityFlightStatus.B1B}</td>
              </tr>
            ))}
          </tbody>
      </table>
    </div>
  );
};
const tableStyle = {
  border: "1px solid #ccc",
  borderCollapse: "collapse",
  width: "100%",
};
const thStyle = {
  border: "1px solid #ccc",
  backgroundColor: "#f2f2f2",
  padding: "8px",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};

export default Home2;