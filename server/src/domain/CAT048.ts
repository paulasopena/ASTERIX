import assert from "assert";

export class CAT048 {
    messages: Buffer;

    // Data Items
    dataSourceIdentifier!: DataSourceIdentifier;                                            //010
    targetReportDescriptor!: TargetReportDescriptor;                                        //020
    measuredPositionPolarCoordinates!: PolarCoordinates;                                    //040
    calculatedPositionCartesianCoordinates!: CartesianCoordinates;                          //042
    mode3ACodeOctalRepresentation!: Mode3ACodeOctalRepresentation;                          //070
    flightLevelBinaryRepresentation!: FlightLevelBinaryRepresentation;                      //090
    heightMeasuredBy3DRadar!: HeightMeasuredBy3DRadar;                                      //110
    radarPlotCharacteristics!: RadarPlotCharacteristics;                                    //130
    timeOfDay!: number;   //(s)                                                             //140
    trackNumber!: number;                                                                   //161
    trackStatus!: TrackStatus;                                                              //170
    calculatedTrackVelocityPolarCoordinates!: PolarCoordinates;                             //200
    aircraftAddress!: string;                                                               //220
    communicationsACASCapabilityFlightStatus!: CommunicationsACASCapabilityFlightStatus;    //230
    aircraftIdentification!: string[];   //(8 characters)                                   //240
    bDSRegisterData!: BDSRegisterData;                                                      //250


    constructor(messages: Buffer) {
        this.messages = messages;
    }

    async decodeMessages() {

        const length = this.messages.readUInt16BE(1);
        const realLength = this.messages.length;
        assert.strictEqual(length, realLength, 'Length mismatch.');

        var i = 0;
        var moreFSPEC = true;
        var counter = 4;

        while (i < 4) {
            if ( moreFSPEC ) {
                console.log("SPECK")
                var currentByte  = this.messages.readUInt8(i + 3);
                const binaryArray = currentByte.toString(2).padStart(8, '0').split('').reverse();       // [7,6,5,4,3,2,1,0]
                

                switch (i) {
                    case 0:
                        if (binaryArray[7] === '1') {
                            this.setDataSourceIdentifier(this.messages.subarray(counter, counter + 2))
                            const array = this.messages.subarray(counter, counter + 2)
                            console.log(array.readUInt8(0) + "andd" + array.readUInt8(1))
                        }
                        if (binaryArray[6] === '1') {

                        }
                        if (binaryArray[5] === '1') {
 
                        }
                        if (binaryArray[4] === '1') {
    
                        }
                        if (binaryArray[3] === '1') {

                        }
                        if (binaryArray[2] === '1') {

                        }
                        if (binaryArray[1] === '1') {

                        }
                        break;
                    case 1:
                        if (binaryArray[7] === '1') {
                            
                        }
                        if (binaryArray[6] === '1') {

                        }
                        if (binaryArray[5] === '1') {

                        }
                        if (binaryArray[4] === '1') {

                        }
                        if (binaryArray[3] === '1') {

                        }
                        if (binaryArray[2] === '1') {

                        }
                        if (binaryArray[1] === '1') {

                        }
                        break;
                    case 2:
                        if (binaryArray[7] === '1') {
                            
                        }
                        if (binaryArray[6] === '1') {

                        }
                        if (binaryArray[5] === '1') {

                        }
                        if (binaryArray[4] === '1') {

                        }
                        if (binaryArray[3] === '1') {

                        }
                        if (binaryArray[2] === '1') {

                        }
                        if (binaryArray[1] === '1') {

                        }
                        break;
                }
                
                if (binaryArray[0] === '0') {
                    moreFSPEC = false;
                }
            }
            i = i + 1;
        }
    }

    async setDataSourceIdentifier(buffer: Buffer) {

    }

    async setTargetReportDescriptor(buffer: Buffer) {

    }

    async setMeasuredPositionPolarCoordinates(buffer: Buffer) {

    }

    async setCalculatedPositionCartesianCoordinates(buffer: Buffer) {

    }

    async setMode3ACodeOctalRepresentation(buffer: Buffer) {

    }

    async setFlightLevelBinaryRepresentation(buffer: Buffer) {

    }

    async setHeightMeasuredBy3DRadar(buffer: Buffer) {

    }

    async setRadarPlotCharacteristics(buffer: Buffer) {

    }

    async setTimeOfDay(buffer: Buffer) {

    }

    async setTrackNumber(buffer: Buffer) {

    }

    async setTrackStatus(buffer: Buffer) {

    }

    async setCalculatedTrackVelocityPolarCoordinates(buffer: Buffer) {

    }

    async setAircraftAddress(buffer: Buffer) {

    }

    async setCommunicationsACASCapabilityFlightStatus(buffer: Buffer) {

    }

    async setAircraftIdentification(buffer: Buffer) {

    }

    async setBDSRegisterData(buffer: Buffer) {

    }


}

interface DataSourceIdentifier {
    SAC: string;
    SIC: string;
}

interface TargetReportDescriptor {
    TYP: string;
    SIM: string;
    RDP: string;
    SPI: string;
    RAB: string;
    TST?: string;
    ERR?: string;
    XPP?: string;
    ME?: string;
    MI?: string;
    FOE_FRI?: string;
    ADSB?: string;
    ADSB_EP?: string;
    ADSB_VAL?: string;
    SCN?: string;
    SCN_EP?: string;
    SCN_VAL?: string;
    PAI?: string;
    PAI_EP?: string;
    PAI_VAL?: string;
    SPARE?: string;
}

interface PolarCoordinates {
    rho: number;
    theta: number;
}

interface CartesianCoordinates {
    x: number;
    y: number;
}

interface Mode3ACodeOctalRepresentation {
    V: string;
    G: string;
    L: string;
    mode3A: string;
}

interface FlightLevelBinaryRepresentation {
    V: string;
    G: string;
    flightLevel: string;
}

interface HeightMeasuredBy3DRadar {
    Height: string;
}

interface RadarPlotCharacteristics {
    SRL: string;
    SRR: string;
    SAM: string;
    PRL: string;
    PAM: string;
    RPD: string;
    APD: string;
}

interface TrackStatus {
    CNF: string;
    RAD: string;
    DOU: string;
    MAH: string;
    CDM: string;
    TRE?: string;
    GHO?: string;
    SUP?: string;
    TCC?: string;
}

interface CommunicationsACASCapabilityFlightStatus {
    COM: string;
    STAT: string;
    SI: string;
    MSSC: string;
    ARC: string;
    AIC: string;
    B1A: string;
    B1B: string;
}

interface BDSRegisterData {
    REP: string;
    BDSDATA: string;
    BDS1: string;
    BDS2: string;
}
