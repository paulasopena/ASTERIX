class AircraftFiltered {
    constructor(aircraftIdentification, timeDeparture, typeAircraft, route, stele, procDep, runway) {
        this.aircraftIdentification = aircraftIdentification
        this.timeDeparture = timeDeparture,
        this.typeAircraft = typeAircraft,
        this.route = route,
        this.stele = stele,
        this.procDep = procDep,
        this.runway = runway
    }

    addRouteElement(newRoute) {
        this.route.push(newRoute)
    }
}

module.exports = AircraftFiltered;