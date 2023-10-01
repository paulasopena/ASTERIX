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

        const length = this.messages.readUInt16BE(1); // Comencem a llegir 16 desde la posició 1 (ens saltem la CAT)
        const realLength = this.messages.length;
        assert.strictEqual(length, realLength, 'Length mismatch.');

        var i = 0;
        var moreFSPEC = true;

        var numFSPEC = 0;

        while (i <= 4) { // Analitzem el FSPEC
            if ( moreFSPEC ) {
                var currentByte  = this.messages.readUInt8(i + 3);
                const binaryArray = currentByte.toString(2).padStart(8, '0').split('').reverse();       // [7,6,5,4,3,2,1,0]
                
                if (binaryArray[0] === '1') {
                    numFSPEC += 1;
                } else {
                    numFSPEC += 1; // Aquí també per saber quants 'blocs' de data items també, el últim FSPEC será false però tindrem 3 blocs (bytes) 
                    moreFSPEC = false;
                }               
            }
            i = i + 1;
        }

        console.log('Number FSPEC: ' + numFSPEC);

        var j = 0;

        while (j <= numFSPEC) {
            var currentByte  = this.messages.readUInt8(j + 3);
            const binaryArray = currentByte.toString(2).padStart(8, '0').split('').reverse();       // [7,6,5,4,3,2,1,0]

            switch (j) {
                case 0:

                    /*  
                        Data Item I048/010, Data Source Identifier
                        Definition: Identification of the radar station from which the data is received.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[7] === '1') {
                        var octet1  = this.messages.readUInt8(numFSPEC + 3).toString(2).padStart(8, '0').split('').reverse();
                        var octet2  = this.messages.readUInt8(numFSPEC + 4).toString(2).padStart(8, '0').split('').reverse();
                        const array = [...octet1, ...octet2];
                        console.log('Data Source Identifier (bits): ' + array);
                        console.log('Data Source Identifier (decimal): ' + this.messages.readUInt8(numFSPEC + 3) + ' ' + this.messages.readUInt8(numFSPEC + 4));
                        this.setDataSourceIdentifier(array);
                    } else {
                        console.log('Data Source Identifier: null');
                    }

                    /*  
                        Data Item I048/140, Time of Day
                        Definition: Absolute time stamping expressed as Co-ordinated Universal Time (UTC).
                        Format: Three-octet fixed length Data Item. 
                    */
                    if (binaryArray[6] === '1' && binaryArray[7] === '0') {
                        var octet1  = this.messages.readUInt8(numFSPEC + 3).toString(2).padStart(8, '0').split('').reverse();
                        var octet2  = this.messages.readUInt8(numFSPEC + 4).toString(2).padStart(8, '0').split('').reverse();
                        var octet3  = this.messages.readUInt8(numFSPEC + 5).toString(2).padStart(8, '0').split('').reverse();
                        const array = [...octet1, ...octet2, octet3];
                        console.log('Time of Day (bits): ' + array);
                        console.log('Time of Day (decimal): ' + this.messages.readUInt8(numFSPEC + 3) + ' ' + this.messages.readUInt8(numFSPEC + 4) + ' ' + this.messages.readUInt8(numFSPEC + 5));

                    } else if (binaryArray[6] === '1' && binaryArray[7] === '1') {
                        var octet1  = this.messages.readUInt8(numFSPEC + 5).toString(2).padStart(8, '0').split('').reverse();
                        var octet2  = this.messages.readUInt8(numFSPEC + 6).toString(2).padStart(8, '0').split('').reverse();
                        var octet3  = this.messages.readUInt8(numFSPEC + 7).toString(2).padStart(8, '0').split('').reverse();
                        const array = [...octet1, ...octet2, ...octet3];
                        console.log('Time of Day (bits): ' + array);
                        console.log('Time of Day (decimal): ' + this.messages.readUInt8(numFSPEC + 5) + ' ' + this.messages.readUInt8(numFSPEC + 6) + ' ' + this.messages.readUInt8(numFSPEC + 7));
                    } else {
                        console.log('Time of Day: null');
                    }

                    /*
                        Data Item I048/020, Target Report Descriptor
                        Definition: Type and properties of the target report.
                        Format: Variable length Data Item comprising a first part of one-octet, followed by one-octet extents as necessary.
                    */
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

            j += 1;
        }
    }

    async setDataSourceIdentifier(buffer: string[]) {
        var SAC = buffer.slice(0, 7);
        var SIC = buffer.slice(8, 15);
        console.log('SAC: ' + SAC);
        console.log('SIC: ' + SIC);
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
