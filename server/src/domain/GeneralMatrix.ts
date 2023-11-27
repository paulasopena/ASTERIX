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

class GeneralMatrix{
    private n: number; //number of rows
    private m: number; //number of columns
    private matrix: number[][];
    constructor(n: number, m:number, matrix?:number[][]){
        if(matrix===null || matrix===undefined){
            this.n=n;
            this.m=m;
            this.matrix = Array.from({ length: this.n }, () => Array(this.m).fill(0));
            return;
        }
        this.m=m; 
        this.n=n;
        this.matrix=matrix;
    }
    transpose(): GeneralMatrix {
        const transMatrix = new GeneralMatrix(this.m, this.n);
        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                transMatrix.matrix[j][i] = this.matrix[i][j];
            }
        }
        return transMatrix;
    }
    multiply(B: GeneralMatrix): GeneralMatrix {
        const X = new GeneralMatrix(this.n, B.m);
        for (let i = 0; i < X.n; i++) {
            for (let k = 0; k < X.m; k++) {
                for(let j=0; j<this.m; j++){
                    X.matrix[i][k]=X.matrix[i][k]+this.matrix[i][j]*B.matrix[j][k];
                }  
            }    
        }

        return X;
    }
    addEquals(B: GeneralMatrix): GeneralMatrix {
        this.checkMatrixDimensions(B);
        const X = new GeneralMatrix(this.n, this.m, this.matrix);
        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                X.matrix[i][j] += B.matrix[i][j];
            }
        }
        return X;
    }
    checkMatrixDimensions(B: GeneralMatrix): void {
        if (B.m !== this.m || B.n !== this.n) {
            throw new Error("GeneralMatrix dimensions must agree.");
        }
    }
    getElement(i: number, j: number): number {
        return this.matrix[i][j];
    }
}
export class GeoUtils{
    private rotationMatrix: GeneralMatrix;
    private translationMatrix: GeneralMatrix;
    coordinates: CoordinatesWGS84; //coordinates detected from the Radar 
    constructor(coordinates:CoordinatesWGS84){
        this.coordinates=coordinates;
        this.rotationMatrix=this.calculateRotationMatrix();
        this.translationMatrix=this.calculateTranslationMatrix();

    }
    calculateRotationMatrix(){
        const lat= this.coordinates.Lat*Math.PI/180.0;
        const lon = this.coordinates.Lon*Math.PI/180.0;
        const rotationValues: number[][] = [
            [-Math.sin(lon), Math.cos(lon), 0],
            [-Math.sin(lat) * Math.cos(lon), -Math.sin(lat) * Math.sin(lon), Math.cos(lat)],
            [Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)]
        ];
    
        const rotationMatrix: GeneralMatrix = new GeneralMatrix(3, 3, rotationValues);
        return rotationMatrix;
    }
    calculateTranslationMatrix(){
        const A = 6378137.0;
        const E2 = 0.00669437999014; 
        const lat= this.coordinates.Lat*Math.PI/180.0;
        const lon = this.coordinates.Lon*Math.PI/180.0;
        const alt = this.coordinates.Alt;
        const nu: number = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(lat), 2.0));

        const translationMatrix= new GeneralMatrix(3,1,[
            [(nu + alt) * Math.cos(lat) * Math.cos(lon)],
            [(nu + alt) * Math.cos(lat) * Math.sin(lon)],
            [(nu * (1 - E2) + alt) * Math.sin(lat)]
        ]);
        return translationMatrix;
    }
    polarCoordinates2cartesian(polarCoordinates: CoordinatesPolar): CoordinatesXYZ{
        let res: CoordinatesXYZ = new CoordinatesXYZ(
            polarCoordinates.Rho * Math.sin(polarCoordinates.Theta),
            polarCoordinates.Rho * Math.cos(polarCoordinates.Theta),
            polarCoordinates.Elevation 
        );
        return res;
    }
    cartesian2Geocentric(cartesianCoordinates: CoordinatesXYZ): CoordinatesXYZ{
    
        let matrixValues: number[][] = [[cartesianCoordinates.X], [cartesianCoordinates.Y], [cartesianCoordinates.Z]];
        let inputMatrix: GeneralMatrix = new GeneralMatrix(3, 1, matrixValues);
        let outputMatrix: GeneralMatrix = this.rotationMatrix.transpose().multiply(inputMatrix).addEquals(this.translationMatrix);
        let res: CoordinatesXYZ = new CoordinatesXYZ(
            outputMatrix.getElement(0, 0),
            outputMatrix.getElement(1, 0),
            outputMatrix.getElement(2, 0)
        );
        return res;

    }
    geocentric2Geodesic(c:CoordinatesXYZ): CoordinatesWGS84{
        const res: CoordinatesWGS84 = new CoordinatesWGS84(0, 0, 0);

        const b: number = 6356752.3142;
        const A = 6378137.0;
        const E2 = 0.00669437999014; 

        if (Math.abs(c.X) < 1e-10 && Math.abs(c.Y) < 1e-10) {
            if (Math.abs(c.Z) < 1e-8) {
                res.Lat = Math.PI / 2.0;
            } else {
                res.Lat = (Math.PI / 2.0) * ((c.Z / Math.abs(c.Z)) + 0.5);
            }
            res.Lon = 0;
            res.Alt = Math.abs(c.Z) - b;
            return res;
        }

        const d_xy: number = Math.sqrt(c.X * c.X + c.Y * c.Y);
        res.Lat = Math.atan((c.Z / d_xy) / (1 - (A * E2) / Math.sqrt(d_xy * d_xy + c.Z * c.Z)));
        let nu: number = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(res.Lat), 2));
        res.Alt = (d_xy / Math.cos(res.Lat)) - nu;

        let Lat_over: number;
        if (res.Lat >= 0) {
            Lat_over = -0.1;
        } else {
            Lat_over = 0.1;
        }

        let loop_count: number = 0;
        while ((Math.abs(res.Lat - Lat_over) > 1e-12) && (loop_count < 50)) {
            loop_count++;
            Lat_over = res.Lat;
            res.Lat = Math.atan((c.Z * (1 + res.Alt / nu)) / (d_xy * ((1 - E2) + (res.Alt / nu))));
            nu = A / Math.sqrt(1 - E2 * Math.pow(Math.sin(res.Lat), 2.0));
            res.Alt = d_xy / Math.cos(res.Lat) - nu;
        }

        res.Lon = Math.atan2(c.Y, c.X);

        return res;

    }
    conversion(polarCoordinates: CoordinatesPolar): CoordinatesWGS84{
        const cartesianFirst=this.polarCoordinates2cartesian(polarCoordinates);
        const geodesicSecond=this.cartesian2Geocentric(cartesianFirst);
        const geocentricThird=this.geocentric2Geodesic(geodesicSecond);
        return geocentricThird;
    }

}
export function getTheRadar(): CoordinatesWGS84 {
    return { Lat: 41.3007023, Lon: 2.1020588, Alt: 2.007 + 25.25 }
}
export function calculateElevation (rhoNM: number, FL: number) {
    var H: number;
    var El: number;
    const A = 6378137.0;
    var Hri = 2.007 + 25.25;
    var rho = rhoNM * 1852;

    if (FL >= 0) {
        H = FL * 100 * 0.3048;
    } else {
        H = 0;
    }
    const asinArg = (2 * A * (H - Hri) + H^2 - Hri^2 - rho^2) / (2 * rho * (A + Hri));

    if (Math.abs(asinArg) <= 1) {
        El = Math.asin(asinArg);
    } else {
        console.log('Invalid asin argument: ' + asinArg);
        El = NaN; 
    }
    return El;
}

