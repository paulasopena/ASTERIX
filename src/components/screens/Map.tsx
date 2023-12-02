import React, { useEffect, useRef, useState } from 'react';
import {FolderOpenOutline, FileTrayOutline, DownloadOutline, TabletLandscapeOutline } from 'react-ionicons';
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
  
  const openFile = () => {
    navigation('/picker');
  };

  const seeTableDecoder = () => {
    navigation('/home2');
  };

  const [fileData, setFileData] = useState<Aircraft[]>([]);
  const [layerTrayectories, setLayerTrayectories] = useState<any>();
  const [earliestTime, setEarliestTime] = useState<number>(0);
  const [latestTime, setLatestTime] = useState<number>(100);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const aircrafts =await getAircrafts('230502-est-080001_BCN_60MN_08_09.csv');
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
        
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (fileData.length > 0 && currentTime !== null) {

      const intervalId = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 5);
        updatePositions();
      }, 500);

      return () => clearInterval(intervalId);
    }
  }, [fileData, currentTime]);

  const updatePositions = () => {
    const updatedPointsData = fileData.map(aircraft => {
      const closestPosition = findClosestPosition(aircraft.route, currentTime);

      if (closestPosition && closestPosition.lng !== undefined && closestPosition.lat !== undefined) {
        return {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [closestPosition.lng, closestPosition.lat],
          },
        };
      } else {
        return null;
      }
    }).filter(Boolean);

    const routeLines = fileData.map(aircraft => {
      const routeCoordinates = aircraft.route.map(position => [position.lng, position.lat]);
      
      const currentIndex = aircraft.route.findIndex(position => {
        const positionTime = convertTimeToSeconds(position.timeOfDay);
        return Math.abs(currentTime - positionTime) < 5;
      });
  
      const currentLine = {
        type: 'Feature',
        properties: {
          isCurrentLine: true,
        },
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates.slice(0, currentIndex + 1),
        },
      };
  
      const restOfRoute = {
        type: 'Feature',
        properties: {
          isCurrentLine: false,
        },
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates.slice(currentIndex + 1),
        },
      };
  
      return [currentLine, restOfRoute];
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
          alert(aircraft.aircraftIdentification);
        }
      }
    }));
  };

  const handleTimelineChange = (event: any) => {
    const value = parseFloat(event.target.value);
    setCurrentTime(value);
  };

  const downloadFile = () => {
    const filePath = '230502-est-080001_BCN_60MN_08_09.csv';
  
    const fileUrl = process.env.PUBLIC_URL + '/' + filePath;
  
    window.location.href = fileUrl;
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
    <div style={{ display: 'flex', height: '100vh' }}>
       <div style={{ flex: 1, position: 'relative' }}>
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
      <div style={{ width: '75px', padding: '16px', backgroundColor: '#000000', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={openFile}>
          <FolderOpenOutline color={'#ffffff'} title={'Open file'} height="50px" width="50px" />
        </button>
        <button onClick={() => downloadFile()}>
          <FileTrayOutline color={'#ffffff'} title={'Export to CSV'} height="50px" width="50px" />
        </button>
        <button onClick={() => generateKML()}>
          <DownloadOutline color={'#ffffff'} title={'Export to KML'} height="50px" width="50px" />
        </button>
        <button onClick={seeTableDecoder}>
          <TabletLandscapeOutline color={'#ffffff'} title={'Open the table'} height="50px" width="50px" />
        </button>

        <input
          type="range"
          min={earliestTime}
          max={latestTime}
          value={currentTime}
          onChange={handleTimelineChange}
          step={1}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )

};

export default MapComponent;
