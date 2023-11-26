export class Aircraft {
    aircraftIdentification: String;
    IAS: Number;
    flightLevel: Number;
    route: [RouteCoordinates];

    constructor(aircraftIdentification: String, IAS: Number, flightLevel: Number, route: [RouteCoordinates]) {
        this.aircraftIdentification = aircraftIdentification;
        this.IAS = IAS;
        this.flightLevel = flightLevel;
        this.route = route; 
    }

    addRouteElement(newRoute: RouteCoordinates) {
        this.route.push(newRoute);
    }
}

interface RouteCoordinates {
    lat: number;
    lng: number;
    height: number;
    timeOfDay: String;
}
