import { SERVER_URL } from "../environments/environments";


export async function fetchBytes(filePath: string) {
    try {
        console.log(filePath);
        const response = await fetch(SERVER_URL + '/readFile/' + filePath);
        const data = await response.text();
        console.log(data);
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

/*
export async function getAircrafts(filePath: string) {
    try {
        const filePathCSV = filePath.replace('.ast', '.csv');

        const response = await fetch(filePathCSV);
        const blob = await response.blob();

        const fileReader = new FileReader();

        return new Promise<Aircraft[]>((resolve, reject) => {
            fileReader.onloadend = () => {
                const csvString = fileReader.result as string;
                const aircraftList: Aircraft[] = [];

                Papa.parse(csvString, {
                    header: true,
                    dynamicTyping: false,
                    complete: (result) => {
                        const validTYPValues = [
                            'Single ModeS All-Call',
                            'Single ModeS Roll-Call',
                            'ModeS All-Call + PSR',
                            'ModeS Roll-Call + PSR'
                        ];

                        result.data.forEach((row: any) => {
                            const {
                                aircraftIdentification,
                                IAS,
                                flightLevel,
                                lat,
                                lng,
                                Height,
                                timeOfDay,
                                TYP
                            } = row as {
                                aircraftIdentification: string;
                                IAS: number;
                                flightLevel: number;
                                lat: number;
                                lng: number;
                                Height: number;
                                timeOfDay: string;
                                TYP: string;
                            };

                            if (validTYPValues.includes(TYP)) {
                                const existingAircraft = aircraftList.find(a => a.aircraftIdentification === aircraftIdentification);

                                if (existingAircraft) {
                                    existingAircraft.addRouteElement({
                                        lat: Number(lat),
                                        lng: Number(lng),
                                        height: Number(flightLevel) * 100 * 0.3048,
                                        timeOfDay: String(timeOfDay)
                                    });
                                } else {
                                    const newAircraft = new Aircraft(
                                        aircraftIdentification,
                                        Number(IAS),
                                        Number(flightLevel),
                                        [{
                                            lat: Number(lat),
                                            lng: Number(lng),
                                            height: Number(flightLevel) * 100 * 0.3048,
                                            timeOfDay: String(timeOfDay)
                                        }],
                                        String(TYP)
                                    );
                                    aircraftList.push(newAircraft);
                                }
                            }
                        });
                        console.log(aircraftList)

                        resolve(aircraftList);
                    },
                });

                
            };
            fileReader.readAsText(blob);
        });
    } catch (error) {
        console.error('Error fetching file data:', error);
    }
}*/
