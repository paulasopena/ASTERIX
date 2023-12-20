export class AircraftFiltered {
    aircraftIdentification: string;
    timeDeparture: string;
    typeAircraft: string;
    route: [RouteCoordinates];
    stele: string;
    procDep: string;
    runway: string;
    isClicked: boolean;

    constructor(aircraftIdentification: string, timeDeparture: string, typeAircraft: string, route: [RouteCoordinates], stele: string, procDep: string, runway: string) {
        this.aircraftIdentification = aircraftIdentification;
        this.timeDeparture = timeDeparture;
        this.typeAircraft = typeAircraft;
        this.route = route; 
        this.stele=stele;
        this.procDep = procDep;
        this.runway = runway;
        this.isClicked=false;
    }
}

export interface RouteCoordinates {
    lat: number;
    lng: number;
    height: number;
    timeOfDay: string;
}