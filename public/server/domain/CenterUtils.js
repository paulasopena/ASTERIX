class CenterUtils {
    constructor(centerCoordinates) {
      this.coordinates=centerCoordinates;
      this.rotationMatrix=this.calculateRotationMatrix(); 
      this.translationMatrix=this.calculateTranslationMatrix();
    }
    calculateRotationMatrix() {
        const lat = (this.coordinates.Lat * Math.PI) / 180.0
        const lon = (this.coordinates.Lon * Math.PI) / 180.0
        const rotationValues = [
          [-Math.sin(lon), Math.cos(lon), 0],
          [
            -Math.sin(lat) * Math.cos(lon),
            -Math.sin(lat) * Math.sin(lon),
            Math.cos(lat)
          ],
          [
            Math.cos(lat) * Math.cos(lon),
            Math.cos(lat) * Math.sin(lon),
            Math.sin(lat)
          ]
        ]
    
        const rotationMatrix = new GeneralMatrix(3, 3, rotationValues)
        return rotationMatrix
      }
      calculateTranslationMatrix() {
        const A = 6378137.0
        const E2 = 0.00669437999014
        const lat = (this.coordinates.Lat * Math.PI) / 180.0
        const lon = (this.coordinates.Lon * Math.PI) / 180.0
        const alt = this.coordinates.Alt
        const nu = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(lat), 2.0))
    
        const translationMatrix = new GeneralMatrix(3, 1, [
          [(nu + alt) * Math.cos(lat) * Math.cos(lon)],
          [(nu + alt) * Math.cos(lat) * Math.sin(lon)],
          [(nu * (1 - E2) + alt) * Math.sin(lat)]
        ])
        return translationMatrix
      }
  }
  module.exports = {
    CenterUtils
  };