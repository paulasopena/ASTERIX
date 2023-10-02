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
        var counter = 3;

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
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2)
                        console.log(parameter[0] + "iiii" + parameter[1]);

                        var octet1  = this.messages.readUInt8(numFSPEC + counter).toString(2).padStart(8, '0').split('');
                        var octet2  = this.messages.readUInt8(numFSPEC + counter + 1).toString(2).padStart(8, '0').split('');
                        const array = [...octet1, ...octet2];
                        this.setDataSourceIdentifier(array);
                        counter = counter + 2;
                    } else {
                        console.log('Data Source Identifier: null');
                    }

                    /*  
                        Data Item I048/140, Time of Day
                        Definition: Absolute time stamping expressed as Co-ordinated Universal Time (UTC).
                        Format: Three-octet fixed length Data Item. 
                    */
                    if (binaryArray[6] === '1') {
                        var octet1  = this.messages.readUInt8(numFSPEC + counter).toString(2).padStart(8, '0').split('');
                        var octet2  = this.messages.readUInt8(numFSPEC + counter + 1).toString(2).padStart(8, '0').split('');
                        var octet3  = this.messages.readUInt8(numFSPEC + counter + 2).toString(2).padStart(8, '0').split('');
                        const array = [...octet1, ...octet2, ...octet3];
                        this.setTimeOfDay(array);
                        counter = counter + 3;
                    } else {
                        console.log('Time of Day: null');
                    }

                    /*
                        Data Item I048/020, Target Report Descriptor
                        Definition: Type and properties of the target report.
                        Format: Variable length Data Item comprising a first part of one-octet, followed by one-octet extents 
                        as necessary.
                    */
                    if (binaryArray[5] === '1') {
                        var octet1  = this.messages.readUInt8(numFSPEC + counter).toString(2).padStart(8, '0').split('');

                        var numTarget = 0;
                        var moreTarget = true;
                        var i = 0;

                        while (i <= 7) { 
                            if ( moreTarget ) {
                                if (octet1[7] === '1') {
                                    numTarget += 1;
                                } else {
                                    numTarget += 1; 
                                    moreTarget = false;
                                }               
                            }
                            i = i + 1;
                        }

                        console.log('numTarget: ' + numTarget);

                        var bitArray: any[] = []; 
                        var j = 0;

                        while (j < numTarget) {
                            var bits = this.messages.readUInt8(numFSPEC + counter + j).toString(2).padStart(8, '0').split('');
                            bitArray = bitArray.concat(bits);
                            j = j + 1;
                        }

                        this.setTargetReportDescriptor(bitArray, numTarget);

                        console.log('Target Report Descriptor: ' + bitArray);

                    } else {
                        console.log('Target Report Descriptor: null');
                    }

                    /*
                        Data Item I048/040, Measured Position in Polar Co-ordinates
                        Definition: Measured position of an aircraft in local polar co-ordinates.
                        Format: Four-octet fixed length Data Item.
                    */
                    if (binaryArray[4] === '1') {

                    }

                    /*
                        Data Item I048/070, Mode-3/A Code in Octal Representation
                        Definition: Mode-3/A code converted into octal representation.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[3] === '1') {

                    }

                    /*
                        Data Item I048/090, Flight Level in Binary Representation
                        Definition: Flight Level converted into binary representation.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[2] === '1') {

                    }

                    /*
                        Data Item I048/130, Radar Plot Characteristics
                        Definition: Additional information on the quality of the target report.
                        Format: Compound Data Item.
                    */
                    if (binaryArray[1] === '1') {

                    }
                    break;
                case 1:

                    /*
                        Data Item I048/220, Aircraft Address
                        Definition: Aircraft address (24-bits Mode S address) assigned uniquely to each aircraft.
                        Format: Three-octet fixed length Data Item.
                    */
                    if (binaryArray[7] === '1') {
                        
                    }

                    /*
                        Data Item I048/240, Aircraft Identification
                        Definition: Aircraft identification (in 8 characters) obtained from an aircraft equipped with a 
                        Mode S transponder.
                        Format: Six-octet fixed length Data Item.
                    */
                    if (binaryArray[6] === '1') {

                    }

                    /*
                        Data Item I048/250, BDS Register Data
                        Definition: BDS Register Data as extracted from the aircraft transponder.
                        Format: Repetitive Data Item starting with a one-octet Field Repetition Indicator (REP) followed 
                        by at least one BDS Register comprising one seven octet BDS Register Data and one octet BDS Register 
                        code.
                    */
                    if (binaryArray[5] === '1') {

                    }

                    /*
                        Data Item I048/161, Track Number
                        Definition: An integer value representing a unique reference to a track record within a particular 
                        track file.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[4] === '1') {

                    }

                    /*
                        Data Item I048/042, Calculated Position in Cartesian Co-ordinates
                        Definition: Calculated position of an aircraft in Cartesian co-ordinates.
                        Format: Four-octet fixed length Data Item in Two’s Complement.
                    */
                    if (binaryArray[3] === '1') {

                    }

                    /*
                        Data Item I048/200, Calculated Track Velocity in Polar Co-ordinates
                        Definition: Calculated track velocity expressed in polar co-ordinates.
                        Format: Four-octet fixed length Data Item.
                    */
                    if (binaryArray[2] === '1') {

                    }

                    /*
                        Data Item I048/170, Track Status
                        Definition: Status of monoradar track (PSR and/or SSR updated).
                        Format: Variable length Data Item comprising a first part of one-octet, followed by one-octet 
                        extents as necessary.
                    */
                    if (binaryArray[1] === '1') {

                    }
                    break;
                case 2:

                    /*
                        No s'ha d'analitzar
                    */
                    if (binaryArray[7] === '1') {
                        
                    }

                    /*
                        No s'ha d'analitzar
                    */
                    if (binaryArray[6] === '1') {

                    }

                    /*
                        No s'ha d'analitzar
                    */
                    if (binaryArray[5] === '1') {

                    }

                    /*
                        No s'ha d'analitzar
                    */
                    if (binaryArray[4] === '1') {

                    }

                    /*
                        Data Item I048/110, Height Measured by a 3D Radar
                        Definition: Height of a target as measured by a 3D radar. The height shall use mean sea level as the 
                        zero reference level.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[3] === '1') {

                    }

                    /*
                        No s'ha d'analitzar
                    */
                    if (binaryArray[2] === '1') {

                    }

                    /*
                        Data Item I048/230, Communications/ACAS Capability and Flight Status
                        Definition: Communications capability of the transponder, capability of the on-board ACAS equipment 
                        and flight status.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[1] === '1') {

                    }
                    break;
            }

            j += 1;
        }
    }

    async setDataSourceIdentifier(buffer: string[]) {
        var SAC = buffer.slice(0, 8).join('');
        var SIC = buffer.slice(8, 16).join('');

        /*this.dataSourceIdentifier.SAC = SAC;
        this.dataSourceIdentifier.SIC = SIC;*/

        console.log('SAC (binari): ' + SAC);
        console.log('SIC (binari): ' + SIC);
    }

    async setTargetReportDescriptor(buffer: string[], numTarget: number) {
        if (numTarget === 1) {
            var TYP = buffer.slice(0, 3).join('');
            console.log('TYP: ' + TYP);
        }

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

    async setTimeOfDay(buffer: string[]) {
        var timeDay = buffer.slice(0, 24).join('');
    
        const decimalTimeDay = parseInt(timeDay, 2);
        
        console.log('Time-of-day (binario): ' + timeDay + ' -- (decimal): ' + decimalTimeDay/128 + 's');
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
