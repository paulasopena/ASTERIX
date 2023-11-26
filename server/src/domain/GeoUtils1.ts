import { GeneralMatrix } from "./GeneralMatrix";

export class CoordinatesXYZ {
    X: number;
    Y: number;
    Z: number;

    constructor(x: number, y: number, z: number) {
        this.X = x;
        this.Y = y;
        this.Z = z;
    }
}
export class CoordinatesPolar {
    Rho: number;
    Elevation: number;
    Theta: number;

    constructor(Rho: number, Elevation: number, Theta: number) {
        this.Rho = Rho;
        this.Elevation = Elevation;
        this.Theta = Theta;
    }
}
export class CoordinatesWGS84 {
    Lat: number;
    Lon: number;
    Alt: number;
    
    constructor(Lat: number, Lon: number, Alt: number) {
        this.Lat = Lat;
        this.Lon = Lon;
        this.Alt = Alt;
    }
}

export class GeoUtils1 {
    private A: number;
    private E2: number;
    private translationMatrixHT: Map<CoordinatesWGS84, GeneralMatrix> = new Map<CoordinatesWGS84, GeneralMatrix>();
    private rotationMatrixHT: Map<CoordinatesWGS84, GeneralMatrix> = new Map<CoordinatesWGS84, GeneralMatrix>();
    private ALMOST_ZERO = 1e-10; 
    private REQUIRED_PRECISION = 1e-12; 
  
    constructor() {    
        this.A = 6378137.0;
        this.E2 = 0.00669437999014;
    }

    private degreesToRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }

    
    calculateElevation (rhoNM: number, FL: number) {
        var H: number;
        var El: number;
        var Hri = 2.007 + 25.25;
        var rho = rhoNM * 1852;


        if (FL >= 0) {
            H = FL * 100 * 0.3048;
        } else {
            H = 0;
        }
        //console.log('H: ' + H);
        //console.log('Hri: ' + Hri);
        //console.log('Rho: ' + rho);
        //console.log('A: ' + this.A)
        const asinArg = (2 * this.A * (H - Hri) + H^2 - Hri^2 - rho^2) / (2 * rho * (this.A + Hri));

        //console.log('Asin argument: ' + asinArg);

        if (Math.abs(asinArg) <= 1) {
            El = Math.asin(asinArg);
        } else {
            console.log('Invalid asin argument: ' + asinArg);
            El = NaN; 
        }

        //console.log('El: ' + El);

        return El;
    }

    changeRadarSpherical2RadarCartesian(polarCoordinates: CoordinatesPolar): CoordinatesXYZ | null {
        if (polarCoordinates == null) return null;
        /*
        let res: CoordinatesXYZ = new CoordinatesXYZ(
            polarCoordinates.Rho * Math.cos(polarCoordinates.Elevation) * Math.sin(polarCoordinates.Theta),
            polarCoordinates.Rho * Math.cos(polarCoordinates.Elevation) * Math.cos(polarCoordinates.Theta),
            polarCoordinates.Rho * Math.sin(polarCoordinates.Elevation)
        );
        */
        let res: CoordinatesXYZ = new CoordinatesXYZ(
            polarCoordinates.Rho * Math.sin(polarCoordinates.Elevation) * Math.cos(polarCoordinates.Theta),
            polarCoordinates.Rho * Math.sin(polarCoordinates.Elevation) * Math.sin(polarCoordinates.Theta),
            polarCoordinates.Rho * Math.cos(polarCoordinates.Elevation)
        );
        return res;
    }

    changeRadarCartesian2Geocentric(radarCoordinates: CoordinatesWGS84, cartesianCoordinates: CoordinatesXYZ): CoordinatesXYZ {
        let translationMatrix: GeneralMatrix = this.obtainTranslationMatrix(radarCoordinates)!;
        let rotationMatrix: GeneralMatrix = this.obtainRotationMatrix(radarCoordinates)!;

        let coefInput: number[][] = [[cartesianCoordinates.X], [cartesianCoordinates.Y], [cartesianCoordinates.Z]];
        
        let inputMatrix: GeneralMatrix = new GeneralMatrix(3, 1, coefInput);

        let R1: GeneralMatrix = rotationMatrix.transpose();
        let R2: GeneralMatrix = R1.multiply(inputMatrix);
        R2.addEquals(translationMatrix);

        let res: CoordinatesXYZ = new CoordinatesXYZ(
            R2.getElement(0, 0),
            R2.getElement(1, 0),
            R2.getElement(2, 0)
        );

        return res;
    }

    changeGeocentric2Geodesic(c: CoordinatesXYZ): CoordinatesWGS84 | null {
        if (c == null) return null;
        const res: CoordinatesWGS84 = new CoordinatesWGS84(0, 0, 0);

        const b: number = 6356752.3142;

        if (Math.abs(c.X) < this.ALMOST_ZERO && Math.abs(c.Y) < this.ALMOST_ZERO) {
            if (Math.abs(c.Z) < this.ALMOST_ZERO) {
                res.Lat = Math.PI / 2.0;
            } else {
                res.Lat = (Math.PI / 2.0) * ((c.Z / Math.abs(c.Z)) + 0.5);
            }
            res.Lon = 0;
            res.Alt = Math.abs(c.Z) - b;
            return res;
        }

        const d_xy: number = Math.sqrt(c.X * c.X + c.Y * c.Y);
        res.Lat = Math.atan((c.Z / d_xy) / (1 - (this.A * this.E2) / Math.sqrt(d_xy * d_xy + c.Z * c.Z)));
        let nu: number = this.A / Math.sqrt(1 - this.E2 * Math.pow(Math.sin(res.Lat), 2.0));
        res.Alt = (d_xy / Math.cos(res.Lat)) - nu;

        let Lat_over: number;
        if (res.Lat >= 0) {
            Lat_over = -0.1;
        } else {
            Lat_over = 0.1;
        }

        let loop_count: number = 0;
        while ((Math.abs(res.Lat - Lat_over) > this.REQUIRED_PRECISION) && (loop_count < 50)) {
            loop_count++;
            Lat_over = res.Lat;
            res.Lat = Math.atan((c.Z * (1 + res.Alt / nu)) / (d_xy * ((1 - this.E2) + (res.Alt / nu))));
            nu = this.A / Math.sqrt(1 - this.E2 * Math.pow(Math.sin(res.Lat), 2.0));
            res.Alt = d_xy / Math.cos(res.Lat) - nu;
        }

        res.Lon = Math.atan2(c.Y, c.X);

        return res;
    }
    obtainTranslationMatrix(radarCoordinates: CoordinatesWGS84): GeneralMatrix | null {
        let translationMatrix: GeneralMatrix | null = null;
        if(this.translationMatrixHT==null){
            this.translationMatrixHT= new Map<CoordinatesWGS84, GeneralMatrix>();
        }
        if (this.translationMatrixHT.has(radarCoordinates)) {
            translationMatrix = this.translationMatrixHT.get(radarCoordinates) || null;
        } else {
            translationMatrix = this.calculateTranslationMatrix(radarCoordinates, this.A, this.E2);
            if (translationMatrix) {
                this.translationMatrixHT.set(radarCoordinates, translationMatrix);
            }
        }
        return translationMatrix;
    }

    obtainRotationMatrix(radarCoordinates: CoordinatesWGS84): GeneralMatrix | null {
        let rotationMatrix: GeneralMatrix | null = null;
        if(this.rotationMatrixHT==null){
            this.rotationMatrixHT=new Map<CoordinatesWGS84, GeneralMatrix>(); 
        }
        if (!this.rotationMatrixHT.has(radarCoordinates)) {
            rotationMatrix = this.calculateRotationMatrix(radarCoordinates.Lat, radarCoordinates.Lon);
            this.rotationMatrixHT.set(radarCoordinates, rotationMatrix);
        } else {
            rotationMatrix = this.rotationMatrixHT.get(radarCoordinates) || null;
        }

        return rotationMatrix;
    }

    calculateTranslationMatrix(c: CoordinatesWGS84, A: number, E2: number): GeneralMatrix {
        const nu: number = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(c.Lat), 2.0));
    
        const coefT1: number[][] = [
            [(nu + c.Alt) * Math.cos(c.Lat) * Math.cos(c.Lon)],
            [(nu + c.Alt) * Math.cos(c.Lat) * Math.sin(c.Lon)],
            [(nu * (1 - E2) + c.Alt) * Math.sin(c.Lat)]
        ];
    
        const m: GeneralMatrix = new GeneralMatrix(3, 1, coefT1);
        return m;
    }

    calculateRotationMatrix(lat: number, lon: number): GeneralMatrix {
        const coefR1: number[][] = [
            [-Math.sin(lon), Math.cos(lon), 0],
            [-Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat)],
            [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)]
        ];
    
        const m: GeneralMatrix = new GeneralMatrix(3, 3, coefR1);
        return m;
    }
    
    
}


