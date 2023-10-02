import { File } from "../domain/File";
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
