import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getFilteredAircrafts } from '../../asterix/file_manager';
import { AircraftFiltered, RouteCoordinates } from '../../domain/AircraftFiltered';

const RadarStatistics: React.FC = () => {
    const navigation = useNavigate();
    const [fileData, setFileData] = useState<AircraftFiltered[]>([]);
    const [distances] = useState<number[]>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const filePathCSV = localStorage.getItem('nombreArchivo');
            if (filePathCSV) {
              const filePath = filePathCSV.replace('.ast', '.csv');
              const aircrafts =await getFilteredAircrafts(filePath);
              if (aircrafts != undefined) {
                const parsedAircrafts = JSON.parse(aircrafts);
                setFileData(parsedAircrafts);                
              }
            }        
          } catch (error) {
            console.error('Error fetching file data:', error);
          }
        };
    
        fetchData().then(() => {
            const distances = calculateConsecutiveDepartureDistances(fileData, radarUpdateTime);
            console.log(distances);
        });
    }, []);

    function calculateConsecutiveDepartureDistances(fileData: AircraftFiltered[], radarUpdateTime: number) {
        const distances = [];

        for (let i = 0; i < fileData.length - 1; i++) {
          const currentAircraft = fileData[i];
          const nextAircraft = fileData[i + 1];

          const currentDepartureTimeSeconds = convertTimeToSeconds(currentAircraft.timeDeparture);
          const nextDepartureTimeSeconds = convertTimeToSeconds(nextAircraft.timeDeparture);

          if (currentDepartureTimeSeconds < nextDepartureTimeSeconds) {
            for (let time = currentDepartureTimeSeconds; time <= nextDepartureTimeSeconds; time += radarUpdateTime) {
              const currentPosition = findPositionAtTime(currentAircraft.route, time);
              const nextPosition = findPositionAtTime(nextAircraft.route, time);
              
              if (currentPosition && nextPosition) {
                const distance = calculateDistanceNM(
                  currentPosition.lat, currentPosition.lng,
                  nextPosition.lat, nextPosition.lng
                );
                
                distances.push({
                  time: new Date(time * 1000), 
                  distanceNM: distance
                });
              }
            }
          }
        }
        
        return distances;
    }

    function calculateDistanceNM(lat1: number, lng1: number, lat2: number, lng2: number) {
        const R = 6371e3; 
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lng2-lng1) * Math.PI/180;
        
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        const distance = R * c;
        return distance * 0.00053995680345572; 
    }
    
    const convertTimeToSeconds = (timeOfDay: string): number => {
        const [hours, minutes, seconds] = timeOfDay.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };
    
    const findPositionAtTime = (positions: RouteCoordinates[], targetTime: number): RouteCoordinates | null => {
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
    
    const radarUpdateTime = 4;  


    return (
        <div>
            <button onClick={() => navigation('/chooseStatistic')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>

        </div>
    )
    
}



export default RadarStatistics;