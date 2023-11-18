export class GeoUtils {
  
  convertPolarToLLa(rho: number, theta: number): { lat: number, lon: number } {
    const earthRadius = 6371;

    const thetaRad = theta * (Math.PI / 180);

    const lat = 90 - (rho / earthRadius) * (180 / Math.PI);

    const lon = thetaRad;

    return { lat, lon };
  }
  
}