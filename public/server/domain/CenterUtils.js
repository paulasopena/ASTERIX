class CenterUtils {
    constructor(coordinates) {
      this.coordinates=coordinates;
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
       
        const rotationMatrix = new GeneralMatrix(3, 3, rotationValues);
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
  class GeneralMatrix {
    constructor(n, m, matrix) {
      if (matrix === null || matrix === undefined) {
        this.n = n
        this.m = m
        this.matrix = Array.from({ length: this.n }, () => Array(this.m).fill(0))
        return
      }
      this.m = m
      this.n = n
      this.matrix = matrix
    }
    transpose() {
      const transMatrix = new GeneralMatrix(this.m, this.n)
      for (let i = 0; i < this.m; i++) {
        for (let j = 0; j < this.n; j++) {
          transMatrix.matrix[j][i] = this.matrix[i][j]
        }
      }
      return transMatrix
    }
    multiply(B) {
      const X = new GeneralMatrix(this.n, B.m)
      for (let i = 0; i < X.n; i++) {
        for (let k = 0; k < X.m; k++) {
          for (let j = 0; j < this.m; j++) {
            X.matrix[i][k] = X.matrix[i][k] + this.matrix[i][j] * B.matrix[j][k]
          }
        }
      }
  
      return X
    }
    addEquals(B) {
      this.checkMatrixDimensions(B)
      const X = new GeneralMatrix(this.n, this.m, this.matrix)
      for (let i = 0; i < this.n; i++) {
        for (let j = 0; j < this.m; j++) {
          X.matrix[i][j] += B.matrix[i][j]
        }
      }
      return X
    }
    substractEquals(B){
      this.checkMatrixDimensions(B);
      const X = new GeneralMatrix(this.n, this.m, this.matrix)
      for (let i = 0; i < this.n; i++) {
        for (let j = 0; j < this.m; j++) {
          X.matrix[i][j] -= B.matrix[i][j]
        }
      }
      return X
  
    }
    checkMatrixDimensions(B) {
      if (B.m !== this.m || B.n !== this.n) {
        throw new Error("GeneralMatrix dimensions must agree.")
      }
    }
    getElement(i, j) {
      return this.matrix[i][j]
    }
  }
  module.exports = {
    CenterUtils
  };