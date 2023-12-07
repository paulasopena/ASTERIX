class Aircraft {
    constructor(aircraftIdentification, IAS, flightLevel, route, TYP) {
      this.aircraftIdentification = aircraftIdentification
      this.IAS = IAS
      this.flightLevel = flightLevel
      this.route = route
      this.TYP=TYP
    }
  
    addRouteElement(newRoute) {
      this.route.push(newRoute)
    }
  }
  
  module.exports = Aircraft;