export class GeneralMatrix {
    m: number;
    n: number;
    A: number[][];

    constructor(m: number, n: number, s?: number | number[][], vals?: number[]) {
        this.m = m;
        this.n = n;
        this.A = new Array(m);

        if (s === undefined) {
            for (let i = 0; i < m; i++) {
                this.A[i] = new Array(n);
            }
        } else if (Array.isArray(s)) {
            for (let i = 0; i < m; i++) {
                if (s[i].length !== n) {
                    throw new Error("All rows must have the same length.");
                }
            }
            this.A = s;
        } else {
            for (let i = 0; i < m; i++) {
                this.A[i] = new Array(n).fill(s);
            }
        }

    }
    getElement(i: number, j: number): number {
        return this.A[i][j];
    }

    transpose(): GeneralMatrix {
        const X = new GeneralMatrix(this.n, this.m);
        const C = X.A;

        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                C[j][i] = this.A[i][j];
            }
        }

        return X;
    }

    multiply(B: GeneralMatrix): GeneralMatrix {
        if (B.m !== this.n) {
            throw new Error("GeneralMatrix inner dimensions must agree.");
        }

        const X = new GeneralMatrix(this.m, B.n);
        const C = X.A;
        const Bcolj: number[] = new Array(this.n);

        for (let j = 0; j < B.n; j++) {
            for (let k = 0; k < this.n; k++) {
                Bcolj[k] = B.A[k][j];
            }

            for (let i = 0; i < this.m; i++) {
                const Arowi: number[] = this.A[i];
                let s = 0;

                for (let k = 0; k < this.n; k++) {
                    s += Arowi[k] * Bcolj[k];
                }

                C[i][j] = s;
            }
        }

        return X;
    }

    addEquals(B: GeneralMatrix): GeneralMatrix {
        this.checkMatrixDimensions(B);

        for (let i = 0; i < this.m; i++) {
            for (let j = 0; j < this.n; j++) {
                this.A[i][j] += B.A[i][j];
            }
        }

        return this;
    }

    private checkMatrixDimensions(B: GeneralMatrix): void {
        if (B.m !== this.m || B.n !== this.n) {
            throw new Error("GeneralMatrix dimensions must agree.");
        }
    }
}