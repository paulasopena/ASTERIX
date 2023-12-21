const {
  CenterUtils
} = require("./CenterUtils");
class CoordinatesXYZ {
  constructor(x, y, z) {
    this.X = x;
    this.Y = y;
    this.Z = z;
  }
}

class CoordinatesPolar {
  constructor(Rho, Elevation, Theta) {
    this.Rho = Rho;
    this.Elevation = Elevation;
    this.Theta = Theta;
  }
}

class CoordinatesWGS84 {
  constructor(Lat, Lon, Alt) {
    this.Lat = Lat;
    this.Lon = Lon;
    this.Alt = Alt;
  }
}

class CoordinatesUVH {
  constructor(U, V, Height){
    this.U=U;
    this.V=V;
    this.Height=Height;
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

class GeoUtils {
  constructor(coordinates) {
    this.coordinates = coordinates
    this.rotationMatrix = this.calculateRotationMatrix()
    this.translationMatrix = this.calculateTranslationMatrix()
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
  polarCoordinates2cartesian(polarCoordinates) {
    let res = new CoordinatesXYZ(
      polarCoordinates.Rho * Math.sin(polarCoordinates.Theta),
      polarCoordinates.Rho * Math.cos(polarCoordinates.Theta),
      polarCoordinates.Elevation
    )
    return res
  }
  cartesian2Geocentric(cartesianCoordinates) {
    let matrixValues = [
      [cartesianCoordinates.X],
      [cartesianCoordinates.Y],
      [cartesianCoordinates.Z]
    ]
    let inputMatrix = new GeneralMatrix(3, 1, matrixValues)
    let outputMatrix = this.rotationMatrix
      .transpose()
      .multiply(inputMatrix)
      .addEquals(this.translationMatrix)
    let res = new CoordinatesXYZ(
      outputMatrix.getElement(0, 0),
      outputMatrix.getElement(1, 0),
      outputMatrix.getElement(2, 0)
    )
    return res
  }
  geocentric2Geodesic(c) {
    const res = new CoordinatesWGS84(0, 0, 0)

    const b = 6356752.3142
    const A = 6378137.0
    const E2 = 0.00669437999014

    if (Math.abs(c.X) < 1e-10 && Math.abs(c.Y) < 1e-10) {
      if (Math.abs(c.Z) < 1e-8) {
        res.Lat = Math.PI / 2.0
      } else {
        res.Lat = (Math.PI / 2.0) * (c.Z / Math.abs(c.Z) + 0.5)
      }
      res.Lon = 0
      res.Alt = Math.abs(c.Z) - b
      return res
    }

    const d_xy = Math.sqrt(c.X * c.X + c.Y * c.Y)
    res.Lat = Math.atan(
      c.Z / d_xy / (1 - (A * E2) / Math.sqrt(d_xy * d_xy + c.Z * c.Z))
    )
    let nu = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(res.Lat), 2))
    res.Alt = d_xy / Math.cos(res.Lat) - nu

    let Lat_over
    if (res.Lat >= 0) {
      Lat_over = -0.1
    } else {
      Lat_over = 0.1
    }

    let loop_count = 0
    while (Math.abs(res.Lat - Lat_over) > 1e-12 && loop_count < 50) {
      loop_count++
      Lat_over = res.Lat
      res.Lat = Math.atan(
        (c.Z * (1 + res.Alt / nu)) / (d_xy * (1 - E2 + res.Alt / nu))
      )
      nu = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(res.Lat), 2.0))
      res.Alt = d_xy / Math.cos(res.Lat) - nu
    }

    res.Lon = Math.atan2(c.Y, c.X)

    return res
  }
  geodesic2geocentric(c){
   
    
    const A =6378137.0;
    const E2=0.00669437999013;
    let res = new CoordinatesXYZ();
    let nu = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(c.Lat), 2.0));
  
    res.X = (nu + c.Alt) * Math.cos(c.Lat) * Math.cos(c.Lon);
    res.Y = (nu + c.Alt) * Math.cos(c.Lat) * Math.sin(c.Lon);
    res.Z = (nu * (1 - E2) + c.Alt) * Math.sin(c.Lat);

    return res;
  }
  geocentric2systemCartesian(geo){
    const centerCoordinates = getTheCenter();
    let centerUtils = new CenterUtils(centerCoordinates);
    let T1 = centerUtils.translationMatrix;
    let R1 = centerUtils.rotationMatrix;
    let coefInput = [geo.X, geo.Y, geo.Z];
    let inputMatrix = new Array(3).fill(0).map((_, i) => [coefInput[i]]);
    let inputMatrixObj = new GeneralMatrix(3, 1, inputMatrix);
    let R2 = R1.multiply(inputMatrixObj.substractEquals(T1));
    let res = {
        X: R2.getElement(0, 0),
        Y: R2.getElement(1, 0),
        Z: R2.getElement(2, 0)
    };
    return res;
  }
  systemCartesian2systemStereographical(c){
    let res = new CoordinatesUVH();
    const centerCoordinates = getTheCenter();
    let R_S = 0;
    const A =6378137.0;
    const E2=0.00669437999013;
    R_S = (A * (1.0 - E2)) /
                Math.pow(1 - E2 * Math.pow(Math.sin(centerCoordinates.Lat), 2.0), 1.5);
    let centerUtils = new CenterUtils(centerCoordinates);
    let d_xy2 = c.X * c.X + c.Y * c.Y;
    res.Height = Math.sqrt(d_xy2 +
        (c.Z + centerUtils.coordinates.Alt + R_S) *
        (c.Z + centerUtils.coordinates.Alt + R_S)) - R_S;
    let k = (2 * R_S) /
        (2 * R_S + centerUtils.coordinates.Alt + c.Z + res.Height);
    res.U = k * c.X;
    res.V = k * c.Y;
    return res;
  }
  conversion(polarCoordinates) {
    const cartesianFirst = this.polarCoordinates2cartesian(polarCoordinates)
    const geodesicSecond = this.cartesian2Geocentric(cartesianFirst)
    const geocentricThird = this.geocentric2Geodesic(geodesicSecond)
    return geocentricThird
  }
  conversionEstereographical(polarCoordinates){
    const cartesianFirst = this.polarCoordinates2cartesian(polarCoordinates)
    const geocentricSecond = this.cartesian2Geocentric(cartesianFirst)
    const systemCartesianThird = this.geocentric2systemCartesian(geocentricSecond);
    const systemStereographical = this.systemCartesian2systemStereographical(systemCartesianThird);
    return systemStereographical;
  }
  conversionFromGeodesic(geodesicCoordinates){
    const geocentricFirst=this.geodesic2geocentric(geodesicCoordinates);
    const systemCartesianSecond=this.geocentric2systemCartesian(geocentricFirst);
    const systemStereographicalThird= this.systemCartesian2systemStereographical(systemCartesianSecond);
    return systemStereographicalThird;
  }
}

function getTheRadar() {
  return { Lat: 41.3007023, Lon: 2.1020588, Alt: 2.007 + 25.25 };
}
function getTheCenter() {
  
  return { Lat: 41.10904, Lon: 1.226947, Alt: 3438.954 };
}

function calculateElevation(rhoNM, FL) {
  var H
  var El
  const A = 6378137.0
  var Hri = 2.007 + 25.25
  var rho = rhoNM * 1852

  if (FL >= 0) {
    H = FL * 100 * 0.3048
  } else {
    H = 0
  }
  const asinArg =
    ((2 * A * (H - Hri) + H) ^ (2 - Hri) ^ (2 - rho) ^ 2) /
    (2 * rho * (A + Hri))

  if (Math.abs(asinArg) <= 1) {
    El = Math.asin(asinArg)
  } else {
    console.log("Invalid asin argument: " + asinArg)
    El = NaN
  }
  return El
}

module.exports = {
  CoordinatesXYZ,
  CoordinatesPolar,
  CoordinatesWGS84,
  CoordinatesUVH,
  GeneralMatrix,
  GeoUtils,
  getTheRadar,
  getTheCenter,
  calculateElevation,
};