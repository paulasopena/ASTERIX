export class Aircraft {
    aircraftIdentification: string;
    IAS: Number;
    flightLevel: Number;
    route: [RouteCoordinates];
    TYP: string;

    constructor(aircraftIdentification: string, IAS: Number, flightLevel: Number, route: [RouteCoordinates], TYP: string) {
        this.aircraftIdentification = aircraftIdentification;
        this.IAS = IAS;
        this.flightLevel = flightLevel;
        this.route = route; 
        this.TYP=TYP;
    }

    addRouteElement(newRoute: RouteCoordinates) {
        this.route.push(newRoute);
    }
}

export interface RouteCoordinates {
    lat: number;
    lng: number;
    height: number;
    timeOfDay: string;
}
