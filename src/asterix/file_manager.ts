import { SERVER_URL } from "../environments/environments";


export async function fetchData() {
    try {
        const response = await fetch(SERVER_URL + '/readFile');
        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error fetching file data:', error);
    }
};

export async function sliceBuffer(buffer: Buffer) {
    
}
