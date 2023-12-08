export class Aircraft {
    aircraftIdentification: string;
    IAS: Number;
    flightLevel: Number;
    route: [RouteCoordinates];
    TYP: string;
    isClicked: boolean;

    constructor(aircraftIdentification: string, IAS: Number, flightLevel: Number, route: [RouteCoordinates], TYP: string) {
        this.aircraftIdentification = aircraftIdentification;
        this.IAS = IAS;
        this.flightLevel = flightLevel;
        this.route = route; 
        this.TYP=TYP;
        this.isClicked=false;
    }
}

export interface RouteCoordinates {
    lat: number;
    lng: number;
    height: number;
    timeOfDay: string;
}
