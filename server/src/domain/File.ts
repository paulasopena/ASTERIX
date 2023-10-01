import fs from 'fs';
import { CAT048 } from "./CAT048";

export class File {
    path: string;
    cat048: CAT048[] = [];

    constructor(path: string) {
        this.path = path;
    }

    readFile() {
    
        const fileBuffer = fs.readFileSync(this.path);
    
        let i = 0;
        let counter = fileBuffer.readUInt8(2);

        let listByte: Buffer[] = [];

        while (i < fileBuffer.length) {
            const array = fileBuffer.slice(i, i + counter);
            listByte.push(array);
            i += counter;

            if (i + 2 < fileBuffer.length) {
                counter = fileBuffer.readUInt8(i + 2);
            }
        }

        const listHex: string[][] = listByte.map(buffer =>
            Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0'))
        );

        for (const arraystring of listHex) {
            const CAT = parseInt(arraystring[0], 16);
            console.log(CAT);

            if (CAT === 48) {
                const newcat048 = new CAT048(arraystring);
                this.cat048.push(newcat048);
            } 
        }
    }
}