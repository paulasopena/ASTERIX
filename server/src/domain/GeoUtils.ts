class CoordinatesXYZ {
  constructor(public X: number, public Y: number, public Z: number) {}
}
class CoordinatesWGS84{
  constructor(public lat: number, public lon: number, public h: number) {}
}

export class GeoUtils2 {
  private A: number; // Semi-major earth axis
  private E2: number; // Square of the first eccentricity

  constructor() {    
    this.A = 6378137.0;
    this.E2 = 0.00669437999014; 
  }

  private ALMOST_ZERO = 1e-10; // Ajusta según tus necesidades
  private REQUIRED_PRECISION = 1e-12; // Ajusta según tus necesidades

  private degreesToRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private radiansToDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
  public changePolarGeocentric(rho:number, theta:number):CoordinatesXYZ{
    // 2.007+25.25 this is the elevation of the BCN airport + the elevation on the antenna
    const cartesian = new CoordinatesXYZ(0,0,0);
    //cartesian.X=rho*Math.cos(2.007+25.25)*Math.sin(this.degreesToRadians(theta));
    //console.log(cartesian.X +"X");
    cartesian.X=rho*Math.cos(this.degreesToRadians(theta));
    //cartesian.Y=rho*Math.cos(2.007+25.25)*Math.cos(this.degreesToRadians(theta));
    //console.log(cartesian.Y +"Y");
    cartesian.Y=rho*Math.sin(this.degreesToRadians(theta));
    //cartesian.Z=rho*Math.sin(2.007+25.25);
    cartesian.Z=2.007+25.25;
    console.log(cartesian.Z +"Z");
    return cartesian;
  }

  public changeGeocentricToGeodesic(rho:number, theta:number): {lat: number, lon: number} | null {
    const c=this.changePolarGeocentric(rho,theta);
    if (!c) return null;
    const res = new CoordinatesWGS84(0,0,0);

    const b = 6356752.3142; // semi-minor earth axis

    if (Math.abs(c.X) < this.ALMOST_ZERO && Math.abs(c.Y) < this.ALMOST_ZERO) {
      if (Math.abs(c.Z) < this.ALMOST_ZERO) {
        // the point is at the center of earth :)
        res.lat = Math.PI / 2.0;
      } else {
        res.lat = (Math.PI / 2.0) * ((c.Z / Math.abs(c.Z)) + 0.5);
      }
      res.lon = 0;
      res.h = Math.abs(c.Z) - b;
      return res;
    }

    const dXY = Math.sqrt(c.X * c.X + c.Y * c.Y);
    res.lat = Math.atan((c.Z / dXY) / (1 - (this.A * this.E2) / Math.sqrt(dXY * dXY + c.Z * c.Z)));
    let nu = this.A / Math.sqrt(1 - this.E2 * Math.pow(Math.sin(res.lat), 2.0));
    res.h = (dXY / Math.cos(res.lat)) - nu;

    let latOver = res.lat >= 0 ? -0.1 : 0.1;

    let loopCount = 0;
    while (Math.abs(res.lat - latOver) > this.REQUIRED_PRECISION && loopCount < 50) {
      loopCount++;
      latOver = res.lat;
      res.lat = Math.atan((c.Z * (1 + res.h / nu)) / (dXY * ((1 - this.E2) + (res.h / nu))));
      nu = this.A / Math.sqrt(1 - this.E2 * Math.pow(Math.sin(res.lat), 2.0));
      res.h = dXY / Math.cos(res.lat) - nu;
    }

    res.lon = Math.atan2(c.Y, c.X);
    // if (loopCount === 50) { // exception }

    return { lat: res.lat, lon: res.lon };
  }
}
  

  