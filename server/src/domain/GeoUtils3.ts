export class RadarCoordinates {
    constructor(public rho: number, public theta: number, public phi: number) {}
  }
  
  export class GeodeticCoordinates {
    constructor(public latitude: number, public longitude: number, public altitude: number) {}
  }
  
  export class RadarConverter {
    private static EARTH_RADIUS = 6371000; // Radio de la Tierra en metros
  
    public static convertToGeodetic(radarCoords: RadarCoordinates, radarLocation: GeodeticCoordinates): GeodeticCoordinates {
      const { rho, theta, phi } = radarCoords;
  
      // Convert to Cartesian Coordinates
      const X = rho * Math.cos(phi) * Math.cos(theta);
      const Y = rho * Math.cos(phi) * Math.sin(theta);
      const Z = rho * Math.sin(phi);
  
      // Convert to Geodetic Coordinates
      const latitude = Math.asin(Z / Math.sqrt(X ** 2 + Y ** 2 + Z ** 2))*(180/Math.PI)+ radarLocation.latitude;
      const longitude = Math.atan2(Y, X)*(180/Math.PI) + radarLocation.longitude;
      const altitude = Math.sqrt(X ** 2 + Y ** 2 + Z ** 2) - this.EARTH_RADIUS;
  
      return new GeodeticCoordinates(latitude, longitude, altitude);
    }
  }
  
  