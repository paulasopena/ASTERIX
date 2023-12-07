class Aircraft {
    constructor(aircraftIdentification, IAS, flightLevel, route) {
      this.aircraftIdentification = aircraftIdentification
      this.IAS = IAS
      this.flightLevel = flightLevel
      this.route = route
    }
  
    addRouteElement(newRoute) {
      this.route.push(newRoute)
    }
  }
  
  module.exports = Aircraft;