export class Aircraft {
    aircraftIdentification: string;
    IAS: Number;
    flightLevel: Number;
    route: [RouteCoordinates];

    constructor(aircraftIdentification: string, IAS: Number, flightLevel: Number, route: [RouteCoordinates]) {
        this.aircraftIdentification = aircraftIdentification;
        this.IAS = IAS;
        this.flightLevel = flightLevel;
        this.route = route; 
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
