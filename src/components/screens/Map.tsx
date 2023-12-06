import React, { useEffect, useRef, useState } from 'react';
import {FolderOpenOutline, FileTrayOutline, DownloadOutline, TabletLandscapeOutline, PlayOutline, StopSharp, FlashOutline} from 'react-ionicons';
import { useNavigate } from 'react-router-dom';
import { fetchBytes, getAircrafts } from "../../asterix/file_manager";
import { Map } from 'react-map-gl';
import DeckGL from '@deck.gl/react/typed';
import {GeoJsonLayer} from '@deck.gl/layers/typed';
import {create} from 'xmlbuilder2';
import {saveAs} from 'file-saver';
import {XMLBuilder} from 'xmlbuilder2/lib/interfaces';
import './HomeStyle.css';
import { Aircraft, RouteCoordinates } from '../../domain/Aircraft';
import Picker from './PickerScreen';

const MAP_TOKEN = "pk.eyJ1IjoiYWxiaWV0YSIsImEiOiJjbHBuem12NzAwcjE5MmtxeTdqZHl5bDVzIn0.9Ut0-aEAkqOPZ1OwQlpbIA";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 41.3007024,
  longitude: 2.1020575,
  zoom: 7,
  bearing: 0,
  pitch: 30
}

const findClosestPosition = (positions: RouteCoordinates[], targetTime: number): RouteCoordinates | null => {
  let closestPosition = null;
  let minTimeDifference = Infinity;

  positions.forEach(position => {
    const positionTime = convertTimeToSeconds(position.timeOfDay);
    const timeDifference = Math.abs(targetTime - positionTime);

    if (timeDifference < minTimeDifference) {
      minTimeDifference = timeDifference;
      closestPosition = position;
    }
  });

  return closestPosition;
};

const convertTimeToSeconds = (timeOfDay: string): number => {
  const [hours, minutes, seconds] = timeOfDay.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const MapComponent: React.FC = () => {
  const navigation = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openFile = () => {
    setIsModalOpen(!isModalOpen);
  };

  const seeTableDecoder = () => {
    navigation('/home2');
  };

  const [fileData, setFileData] = useState<Aircraft[]>([]);
  const [layerTrayectories, setLayerTrayectories] = useState<any>();
  const [earliestTime, setEarliestTime] = useState<number>(0);
  const [latestTime, setLatestTime] = useState<number>(100);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [displayCurrentTime, setDisplayCurrentTime] = useState<string>('');
  const [displayLastestTime, setDisplayLatestTime] = useState<string>('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(500);
  const [buttonColor, setButtonColor] = useState<string>('#333');
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const filePathCSV = localStorage.getItem('nombreArchivo');
        if (filePathCSV) {
          const filePath = filePathCSV.replace('.ast', '.csv');
          const aircrafts =await getAircrafts(filePath);
          if (aircrafts != undefined) {
            const parsedAircrafts = JSON.parse(aircrafts);
            setFileData(parsedAircrafts);

            const allTimes = parsedAircrafts.reduce((times: number[], aircraft: { route: { timeOfDay: string; }[]; }) => {
              aircraft.route.forEach((position: { timeOfDay: string; }) => {
                const timeInSeconds = convertTimeToSeconds(position.timeOfDay);
                times.push(timeInSeconds);
              });
              return times;
            }, [] as number[]);

            const earliest = Math.min(...allTimes);
            const latest = Math.max(...allTimes);

            setEarliestTime(earliest);
            setLatestTime(latest);
            setCurrentTime(earliest);
            
          }
        }        
        
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    if (isSimulationRunning && fileData.length > 0 && currentTime !== null) {
      const intervalId = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 5);
        expressTimeHHMMSS();
        updatePositions();
      }, simulationSpeed);

      return () => clearInterval(intervalId);
    }
  }, [isSimulationRunning, fileData, currentTime]);

  const startSimulation = () => {
    setIsSimulationRunning(true);
  };

  const stopSimulation = () => {
    setIsSimulationRunning(false);
  };

  const expressTimeHHMMSS = () => {
    const hours = Math.floor(currentTime / 3600);
    const minutesRes = currentTime % 3600;
    const minutes = Math.floor(minutesRes / 60);
    const seconds = Math.floor(minutesRes % 60);
    setDisplayCurrentTime(`${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`);
  
    const hoursLatest = Math.floor((latestTime - currentTime) / 3600);
    const minutesLatestRes = (latestTime - currentTime) % 3600;
    const minutesLatest = Math.floor(minutesLatestRes / 60);
    const secondsLatest = Math.floor(minutesLatestRes % 60);
    setDisplayLatestTime(`${padZero(hoursLatest)}:${padZero(minutesLatest)}:${padZero(secondsLatest)}`);
  };
  
  const padZero = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };
  

  const updatePositions = () => {
    const updatedPointsData = fileData.map(aircraft => {
      const closestPosition = findClosestPosition(aircraft.route, currentTime);
      const closestPosition2 = findClosestPosition(aircraft.route, currentTime + 5);

      if (closestPosition && closestPosition2 && closestPosition.lng !== undefined && closestPosition.lat !== undefined && closestPosition != closestPosition2) {
        return {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [closestPosition.lng, closestPosition.lat, closestPosition.height]
          },
        };
      } else {
        return null;
      }
    }).filter(Boolean);

    const routeLines = fileData.map(aircraft => {
      const TRAIL_LENGTH = 10;
  
      const routeCoordinates = aircraft.route.map(position => [position.lng, position.lat]);
  
      const currentIndex = aircraft.route.findIndex(position => {
        const positionTime = convertTimeToSeconds(position.timeOfDay);
        return Math.abs(currentTime - positionTime) < 5;
      });
  
      const startIndex = Math.max(0, currentIndex - TRAIL_LENGTH);
  
      const currentLine = {
        type: 'Feature',
        properties: {
          isCurrentLine: true,
        },
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates.slice(startIndex, currentIndex + 1),
        },
      };
  
      return [currentLine];
    }).flat();

    setLayerTrayectories(new GeoJsonLayer({
      id: 'trayectories',
      data: {
        type: 'FeatureCollection',
        features: [...updatedPointsData, ...routeLines],
      },
      filled: true,
      pointRadiusMinPixels: 1,
      pointRadiusScale: 1500,
      getPointRadius: f => (f.geometry.type === 'Point' ? 1 : 0),
      getFillColor: [206, 122, 165, 255],
      getLineColor: f => {
        if (f.geometry.type === 'Point') {
          return [206, 122, 165, 255];
        } else if (f.properties?.isCurrentLine) {
          return [206, 122, 165, 255];
        } else {
          return [122, 195, 207, 255];
        }
      },
      getLineWidth: f => (f.geometry.type === 'Point' ? 1 : 100),
      pickable: true,
      autoHighlight: true,
      onClick: (info) => {
        const aircraft = fileData[info.index];
        if (aircraft) {
          setSelectedAircraft(aircraft);
        }
      }
      
    }));
  };

  const changeSpeed = () =>{
    if(simulationSpeed===500){
      setSimulationSpeed(300);
      setButtonColor('#c0aa0b');
    }
    else if(simulationSpeed===300){
      setSimulationSpeed(100);
      setButtonColor('#c24a00');
    }
    else if(simulationSpeed===200){
      setSimulationSpeed(50);
      setButtonColor('#ab0015');
    }
    else{
      setSimulationSpeed(500);
      setButtonColor('#333');
    }
  }

  const handleTimelineChange = (event: any) => {
    const value = parseFloat(event.target.value);
    setCurrentTime(value);
  };

  const downloadFile = () => {
    const filePathCSV = localStorage.getItem('nombreArchivo');
    if (filePathCSV) {
      const filePath = filePathCSV.replace('.ast', '_excel.csv');
  
      const fileUrl = process.env.PUBLIC_URL + '/' + filePath;
    
      window.location.href = fileUrl;
    }
    
  };


  const generateKML = () => {
    const root = create({
      version: "1.0",
      encoding: "UTF-8",
    }).ele("kml", { xmlns: "http://www.opengis.net/kml/2.2" });
    const document = root.ele("Document");

    
    fileData.forEach((flight) => {
      const placemark = document.ele("Placemark");
      const nameNode: XMLBuilder = placemark.ele("name");
      nameNode.txt(`Aircraft Identification: ${flight.aircraftIdentification}`);
      const descriptionNode: XMLBuilder = placemark.ele("description");
      descriptionNode.txt(`IAS: ${flight.IAS}, Flight Level: ${flight.flightLevel}`);
    
      flight.route.forEach((point) => {
        const placePoint = placemark.ele("Point");
        placePoint.ele("coordinates").txt(`${point.lng},${point.lat},${point.height}`);
      });
  

    });
    const kmlContent = root.end({ prettyPrint: true });

    const blob = new Blob([kmlContent], { type: "application/xml;charset=utf-8" });
    saveAs(blob, "flight_data.kml");
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden'}}>
       <div style={{ flex: 1, position: 'relative'}}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <DeckGL
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={layerTrayectories ? [layerTrayectories] : []}
            >
              <Map mapStyle={MAP_STYLE}  mapboxAccessToken={MAP_TOKEN} />
            </DeckGL>
          </div>
      </div>
      <div style={{ width: '75px', padding: '16px', backgroundColor: '#f4f4f4', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={openFile}>
          <FolderOpenOutline color={'#333'} title={'Open file'} height="50px" width="50px" />
        </button>
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={openFile}>&times;</span>
              <Picker onClose={openFile}/>
            </div>
          </div>
        )}
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={() => downloadFile()}>
          <FileTrayOutline color={'#333'} title={'Export to CSV'} height="50px" width="50px" />
        </button>
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={() => generateKML()}>
          <DownloadOutline color={'#333'} title={'Export to KML'} height="50px" width="50px" />
        </button>
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={seeTableDecoder}>
          <TabletLandscapeOutline color={'#333'} title={'Open the table'} height="50px" width="50px" />
        </button>
      </div>
        
     
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#f4f4f4', padding: '7px', position: 'fixed', bottom: 0, width: '100%', height: '5%' }}>
      <div style={{ marginRight: '10px' }}>{displayCurrentTime}</div>
      <input
          type="range"
          min={earliestTime}
          max={latestTime}
          value={currentTime}
          onChange={handleTimelineChange}
          step={1}
          style={{ width: '70%' }}
        />
        <div style={{ marginRight: '10px' }}>{displayLastestTime}</div>
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={startSimulation}>
          <PlayOutline color={'#333'} title={'Play simulation'} height="25px" width="25px" />
        </button>
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={stopSimulation}>
          <StopSharp color={'#333'} title={'Stop simulation'} height="25px" width="25px" />
        </button>
        <button style={{backgroundColor:'#e2e2e2', borderColor: '#f4f4f4'}} onClick={changeSpeed}>
          <FlashOutline color={buttonColor} title={'Fast-forward simulation'} height="25px" width="25px" />
        </button>
      </div>
      {selectedAircraft && (
        <div style={{ position: 'fixed', left: 0, top: 0, padding: '10px', background: '#f4f4f4', border: '1px solid #ccc' }}>
        <h3>{selectedAircraft.aircraftIdentification}</h3>
        </div>
      )}

    </div>
  )

};

export default MapComponent;
