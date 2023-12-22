
import { SERVER_URL } from "../environments/environments";


export async function fetchBytes(filePath: string) {
    try {
        const response = await fetch(SERVER_URL + '/readFile/' + filePath);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching file data:', error);
    }
};

export async function getAircrafts(filePath: string) {
    try {
        const response = await fetch(SERVER_URL + '/aircrafts/' + filePath);
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching file data:', error);
    }
};

export async function getFilteredAircrafts(filePath: string) {
    try {
        const response = await fetch(SERVER_URL + '/filteredAircrafts/' + filePath); 
        const text = await response.text(); 
        const data = JSON.parse(text);
        if (data && data.aircraftArray) {
            return data.aircraftArray;
        } else {
            console.error('Unexpected response structure:', data);
            return null;
        }
    } catch (error) {
        console.error('Error fetching file data:', error);
        return null;
    }
}

export async function getDistances(filePath: string) {
    try {
        const response = await fetch(SERVER_URL + '/filteredAircrafts/' + filePath);
        const text = await response.text(); 
        const data = JSON.parse(text);
        if (data && data.distances) {
            return data.distances;
        } else {
            console.error('Unexpected response structure:', data);
            return null;
        }
    } catch (error) {
        console.error('Error fetching file data:', error);
        return null;
    }
}

