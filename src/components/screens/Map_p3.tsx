import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFilteredAircrafts } from "../../asterix/file_manager";
import { Map } from 'react-map-gl';
import DeckGL from '@deck.gl/react/typed';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers/typed';
import './HomeStyle.css';
import Picker from './PickerScreen';
import airplaneIcon from '../../images/airplane.png';
import airplaneIcon2 from '../../images/airplane_pink.png';
import airplane1 from '../../images/1.jpg';
import airplane2 from '../../images/2.jpg';
import airplane3 from '../../images/3.jpg';
import airplane4 from '../../images/4.jpg';
import airplane5 from '../../images/5.jpg';
import airplane6 from '../../images/6.jpg';
import airplane7 from '../../images/8.jpg';
import airplane9 from '../../images/9.jpg';
import airplane10 from '../../images/10.jpg';
import airplane11 from '../../images/11.jpg';
import airplane12 from '../../images/12.jpg';
import airplane13 from '../../images/13.jpg';
import airplane14 from '../../images/14.jpg';
import airplane15 from '../../images/15.jpg';
import airplane16 from '../../images/16.jpg';
import airplane17 from '../../images/17.jpg';
import airplane18 from '../../images/18.jpg';
import airplane19 from '../../images/19.jpg';
import airplane20 from '../../images/20.jpg';
import { IconLayer } from '@deck.gl/layers/typed';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { makeStyles } from '@material-ui/core/styles';
import PlayArrow from '@material-ui/icons/PlayArrow';
import IconButton from '@material-ui/core/IconButton';
import StopIcon from '@material-ui/icons/Stop';
import FastForward from '@material-ui/icons/FastForward';
import BarChartIcon from '@material-ui/icons/BarChart';
import Home from '@material-ui/icons/Home';
import { AircraftFiltered, RouteCoordinates } from '../../domain/AircraftFiltered';

const MAP_TOKEN = "pk.eyJ1IjoiYWxiaWV0YSIsImEiOiJjbHBuem12NzAwcjE5MmtxeTdqZHl5bDVzIn0.9Ut0-aEAkqOPZ1OwQlpbIA";
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 41.287738,
  longitude: 2.069213,
  zoom: 11,
  bearing: 0,
  pitch: 30
}

const airplaneImages = [
  airplane1, airplane2, airplane3, airplane4, airplane5,
  airplane6, airplane7, airplane9, airplane10, airplane11,
  airplane12, airplane13, airplane14, airplane15, airplane16,
  airplane17, airplane18, airplane19, airplane20
];

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

const MapComponent_P3: React.FC = () => {
  const navigation = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openFile = () => {
    setIsModalOpen(!isModalOpen);
  };

  const closePicker = () => {
    setIsModalOpen(false);
    const fetchData = async () => {
      try {
        const filePathCSV = localStorage.getItem('nombreArchivo');
        if (filePathCSV) {
          const filePath = filePathCSV.replace('.ast', '.csv');
          const aircrafts = await getFilteredAircrafts(filePath);
          if (aircrafts != undefined) {
            const parsedAircrafts = aircrafts;    
            setFileData(parsedAircrafts);

            const allTimes = parsedAircrafts.reduce((times: number[], aircraft: { route: { timeOfDay: string; }[]; }) => {
              aircraft.route.forEach((position: { timeOfDay: string; }) => {
                const timeInSeconds = convertTimeToSeconds(position.timeOfDay);
                times.push(timeInSeconds);
              });
              return times;
            }, [] as number[]);

            let earliest = Infinity;
            let latest = -Infinity;

            allTimes.forEach((time: number) => {
              if (time < earliest) earliest = time;
              if (time > latest) latest = time;
            });


            setEarliestTime(earliest);
            console.log(earliest)
            setLatestTime(latest);
            setCurrentTime(earliest);
            
          }
        }        
        
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  };

  const seeStatistics = () => {
    navigation('/chooseStatistic');
  };

  const returnHome = () => {
    navigation('/map');
  };

  const [fileData, setFileData] = useState<AircraftFiltered[]>([]);
  const [layerTrayectories, setLayerTrayectories] = useState<any>();
  const [layerIcon, setLayerIcon] = useState<any>();
  const [textLayer, setTextLayer] = useState<any>();
  const [earliestTime, setEarliestTime] = useState<number>(0);
  const [latestTime, setLatestTime] = useState<number>(100);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [displayCurrentTime, setDisplayCurrentTime] = useState<string>('');
  const [displayLastestTime, setDisplayLatestTime] = useState<string>('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(500);
  const [buttonColor, setButtonColor] = useState<string>('#333');
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftFiltered | null>(null);

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * airplaneImages.length);
    setSelectedImage(airplaneImages[randomIndex]);
  }, [selectedAircraft]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const filePathCSV = localStorage.getItem('nombreArchivo');
        if (filePathCSV) {
          const filePath = filePathCSV.replace('.ast', '.csv');
          const aircrafts =await getFilteredAircrafts(filePath);
          if (aircrafts != undefined) {
            const parsedAircrafts = aircrafts;
            setFileData(parsedAircrafts);

            const allTimes = parsedAircrafts.reduce((times: number[], aircraft: { route: { timeOfDay: string; }[]; }) => {
              aircraft.route.forEach((position: { timeOfDay: string; }) => {
                const timeInSeconds = convertTimeToSeconds(position.timeOfDay);
                times.push(timeInSeconds);
              });
              return times;
            }, [] as number[]);

            let earliest = Infinity;
            let latest = -Infinity;

            allTimes.forEach((time: number) => {
              if (time < earliest) earliest = time;
              if (time > latest) latest = time;
            });

            setEarliestTime(earliest);
            console.log(earliest);
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
    if((hoursLatest && minutesLatest && secondsLatest)>=0){
      setDisplayLatestTime(`${padZero(hoursLatest)}:${padZero(minutesLatest)}:${padZero(secondsLatest)}`);
    }
    else{
      setIsSimulationRunning(false);
      setDisplayLatestTime('00:00:00');
    } 
  };
  
  const padZero = (num: number) => {
    return num < 10 ? `0${num}` : num;
  };
  
  function calculateDirectionAngle(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const degToRad = (degrees: number) => degrees * (Math.PI / 180);

    const deltaLon = degToRad(lon2 - lon1);
    lat1 = degToRad(lat1);
    lat2 = degToRad(lat2);

    const y = Math.sin(deltaLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    let angle = Math.atan2(y, x);
    angle = (angle + 2 * Math.PI) % (2 * Math.PI);

    const radToDeg = (radians: number) => radians * (180 / Math.PI);
    return (radToDeg(angle) + 270) % 360;
  }

  function calculateDistance(U1: number, V1: number, U2: number, V2: number) {
    const distance = Math.sqrt(Math.pow(U1-U2, 2.0) + Math.pow(V1-V2, 2.0))/1852;
    return distance;
  }
  

  const updatePositions = () => {
    const updatedPointsData = fileData.map(aircraft => {
      const closestPosition = findClosestPosition(aircraft.route, currentTime);
      const closestPosition2 = findClosestPosition(aircraft.route, currentTime + 10);

      if (closestPosition && closestPosition2 && closestPosition.lng !== undefined && closestPosition.lat !== undefined && closestPosition != closestPosition2) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [closestPosition.lng, closestPosition.lat, closestPosition.height]
          },
          isClicked: aircraft.isClicked,
          nextPosition: [closestPosition2.lng, closestPosition2.lat, closestPosition2.height],
          aircraftIdentification: aircraft.aircraftIdentification,
        };
      } else {
        return null;
      }
    }).filter(Boolean);

    setLayerIcon(new IconLayer({
      id: 'icon-layer',
      data: updatedPointsData,
      getIcon: d => ({
        url: d.isClicked ? airplaneIcon2 : airplaneIcon,
        width: 128,
        height: 128,
        anchorY: 128
      }),
      getSize: d => Math.max(2, Math.min(d.contributions / 1000 * 25, 25)),
      pickable: true,
      sizeScale: 15,
      getPosition: (d: { geometry: { coordinates: any; }; }) => d.geometry.coordinates,
      getAngle: d => {
        if (d.nextPosition) {
          const angle = calculateDirectionAngle(d.geometry.coordinates[0], d.geometry.coordinates[1], d.nextPosition[0], d.nextPosition[1]);
          return angle;
        }
        return 0;
      },
      onClick: (info) => {
        console.log(info);
        const aircraft = fileData.find(item => item.aircraftIdentification === info.object.aircraftIdentification);
        if (aircraft) {
          setSelectedAircraft(aircraft);
        }
      
        const updatedData = fileData.map(item => {
          if (item.aircraftIdentification === info.object.aircraftIdentification) {
            return { ...item, isClicked: true };
          } else {
            return { ...item, isClicked: false };
          }
        });

        setFileData(updatedData);
      }
    }));

    const routeLines = fileData.map((aircraft, index) => {      
      if (index < fileData.length - 1) {
        const hours = new Date(fileData[index + 1].timeDeparture).getHours();
        const minutes = new Date(fileData[index + 1].timeDeparture).getMinutes();
        const seconds = new Date(fileData[index + 1].timeDeparture).getSeconds();
        const timeDeparture = (hours-2)*3600 + minutes*60 + seconds;
        if ((timeDeparture) < currentTime && (timeDeparture + 200) > currentTime) {
          const currentIndex1 = aircraft.route.findIndex(position => {
            const positionTime = convertTimeToSeconds(position.timeOfDay);
            return Math.abs(currentTime - positionTime) < 5;
          });
    
          if (currentIndex1 !== -1) {
            const currentPosition1 = aircraft.route[currentIndex1];
            
            const nextAircraft = fileData[index + 1];
            const currentIndex2 = nextAircraft.route.findIndex(position => {
              const positionTime = convertTimeToSeconds(position.timeOfDay);
              return Math.abs(currentTime - positionTime) < 5;
            });
  
            if (currentIndex2 !== -1) {
              const currentPosition2 = nextAircraft.route[currentIndex2];
  
              const distance = calculateDistance(
                currentPosition1.U_stereo, currentPosition1.V_stereo,
                currentPosition2.U_stereo, currentPosition2.V_stereo
              );
              
              const distanceText = (distance).toFixed(2) + ' NM';
  
              const lineBetweenAircrafts = {
                type: 'Feature',
                properties: {
                  isCurrentLine: true,
                  distanceText: distanceText
                },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [currentPosition1.lng, currentPosition1.lat],
                    [currentPosition2.lng, currentPosition2.lat],
                  ],
                },
              };
      
              return lineBetweenAircrafts;
            }
          }
        }
        return null;
        
      }
      return null;
    }).filter(line => line !== null);

    setTextLayer(new TextLayer({
      id: 'text-layer',
      data: routeLines,
      getText: d => d.properties.distanceText,
      getPosition: (d: { geometry: { coordinates: [number, number, number][] } }) => {
        const start = d.geometry.coordinates[0];
        const end = d.geometry.coordinates[1];
        const midpoint = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2
        ];
        return midpoint as [number, number, number];
      },
      getTextSize: 8,
      sizeScale: 0.5,
      sizeUnits: 'pixels',
      sizeMinPixels: 8, 
      sizeMaxPixels: 50, 
    }));

    setLayerTrayectories(new GeoJsonLayer({
      id: 'trayectories',
      data: {
        type: 'FeatureCollection',
        features: [...updatedPointsData, ...routeLines],
      },
      filled: true,
      getLineColor: f => {
        if (f.geometry.type === 'Point') {
          return [206, 122, 165, 255];
        } else if (f.properties?.isCurrentLine) {
          return [206, 122, 165, 255];
        } else {
          return [122, 195, 207, 255];
        }
      },
      getLineWidth: f => {
        return Math.max(2, Math.min(128 / 25, 2));
      },
      lineWidthUnits: 'pixels',
      autoHighlight: true,      
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

  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
      width: '180px',
      height: '70px'
    },
  }));
  const classes = useStyles();
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden'}}>
       <div style={{ flex: 1, position: 'relative'}}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <DeckGL
              initialViewState={INITIAL_VIEW_STATE}
              controller={true}
              layers={layerTrayectories && layerIcon && textLayer ? [layerTrayectories, layerIcon, textLayer] : []}
            >
              <Map mapStyle={MAP_STYLE}  mapboxAccessToken={MAP_TOKEN} />
            </DeckGL>
          </div>
      </div>
      <div style={{ width: '200px', padding: '16px', backgroundColor: '#f4f4f4', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          startIcon={<CloudUploadIcon />}
          onClick={openFile}
        >
          Upload
        </Button>
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={openFile}>&times;</span>
              <Picker onClose={closePicker}/>
            </div>
          </div>
        )}
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          startIcon={<BarChartIcon />}
          onClick={seeStatistics}
        >
          STATISTICS
        </Button>
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          startIcon={<Home />}
          onClick={returnHome}
        >
          RETURN TO HOME PAGE
        </Button>
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
            style={{ width: '70%', backgroundColor: '#ff90d6', outline: 'none' }}
        />
        <div style={{ marginRight: '10px' }}>{displayLastestTime}</div>
        <IconButton aria-label="play" onClick={startSimulation}>
          <PlayArrow />
        </IconButton>
        <IconButton aria-label="stop" onClick={stopSimulation}>
          <StopIcon/>
        </IconButton>
        <IconButton aria-label="fast" onClick={changeSpeed}>
          <FastForward />
        </IconButton>
        
      </div>
      {selectedAircraft && (
        <div style={{ position: 'fixed', left: 0, top: 0, padding: '10px', background: '#f4f4f4', border: '1px solid #ccc' }}>
            <div>
                {selectedImage && <img src={selectedImage} alt="Airplane" style={{ width: '200px', height: '200px'}}/>}
                <h2>Flight Details</h2>
                <div>
                    <p><strong>Aicraft ID:</strong> {selectedAircraft.aircraftIdentification}</p>
                    <p><strong>Time Departure:</strong> {selectedAircraft.timeDeparture} </p>
                    <p><strong>Type Aircraft:</strong> {selectedAircraft.typeAircraft}</p>
                    <p><strong>Stele:</strong> {selectedAircraft.stele}</p>
                    <p><strong>Procedure of Departure:</strong> {selectedAircraft.procDep}</p>
                    <p><strong>Runway:</strong> {selectedAircraft.runway}</p>
                </div>
            </div>
        </div>
      )}

    </div>
  )

};

export default MapComponent_P3;