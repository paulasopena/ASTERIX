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
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2);
                        this.setDataSourceIdentifier(parameter);
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
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 3);
                        this.setTimeOfDay(parameter);
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
                        var numTarget = 0;
                        var moreTarget = true;
                        var i = 0;

                        while (i <= 3) { 
                            if ( moreTarget ) {
                                var octet1  = this.messages.readUInt8(numFSPEC + counter + i).toString(2).padStart(8, '0').split('');
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

                        var parameter: Buffer;

                        if (numTarget == 1) {
                            parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 1);
                            counter = counter + 1;
                        } else if (numTarget == 2) {
                            parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2);
                            counter = counter + 2;
                        } else {
                            parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 3);
                            counter = counter + 3;
                        }    
                        
                        this.setTargetReportDescriptor(parameter, numTarget);

                    } else {
                        console.log('Target Report Descriptor: null');
                    }

                    /*
                        Data Item I048/040, Measured Position in Polar Co-ordinates
                        Definition: Measured position of an aircraft in local polar co-ordinates.
                        Format: Four-octet fixed length Data Item.
                    */
                    if (binaryArray[4] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 4);
                        this.setMeasuredPositionPolarCoordinates(parameter);
                        counter = counter + 4;

                    }

                    /*
                        Data Item I048/070, Mode-3/A Code in Octal Representation
                        Definition: Mode-3/A code converted into octal representation.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[3] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2);
                        this.setMode3ACodeOctalRepresentation(parameter);
                        counter = counter + 2;
                    }

                    /*
                        Data Item I048/090, Flight Level in Binary Representation
                        Definition: Flight Level converted into binary representation.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[2] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2);
                        this.setFlightLevelBinaryRepresentation(parameter);
                        counter = counter + 2;
                    }

                    /*
                        Data Item I048/130, Radar Plot Characteristics
                        Definition: Additional information on the quality of the target report.
                        Format: Compound Data Item.
                    */
                    if (binaryArray[1] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 1);
                        var octet = parameter[0].toString(2).padStart(8, '0');

                        var subfieldCounter = 0;
                        
                        if (octet[0] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var srl = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(srl, 0);
                            subfieldCounter += 1
                        }
                        if (octet[1] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var srr = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(srr, 1);
                            subfieldCounter += 1
                        }
                        if (octet[2] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var sam = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(sam, 2);
                            subfieldCounter += 1
                        }
                        if (octet[3] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var prl = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(prl, 3);
                            subfieldCounter += 1
                        }
                        if (octet[4] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var pam = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(pam, 4);
                            subfieldCounter += 1
                        }
                        if (octet[5] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var rpd = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(rpd, 5);
                            subfieldCounter += 1
                        }
                        if (octet[6] === '1') {
                            var parameter = this.messages.subarray(numFSPEC + counter + subfieldCounter + 1, numFSPEC + counter + subfieldCounter + 2);
                            var apd = parameter[0].toString(2).padStart(8, '0');
                            this.setRadarPlotCharacteristics(apd, 6);
                            subfieldCounter += 1
                        }
                        if (octet[7] === '1') {
                            //End of primary subfield
                        }

                        var subfieldLength = subfieldCounter + 1;
                        counter = counter + subfieldLength;

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

    async setDataSourceIdentifier(buffer: Buffer) {
        var SAC = buffer[0];
        var SIC = buffer[1];

        var binarySAC = SAC.toString(2).padStart(8, '0');
        var binarySIC = SIC.toString(2).padStart(8, '0');

        console.log('SAC (binario): ' + binarySAC);
        console.log('SIC (binario): ' + binarySIC);

        this.dataSourceIdentifier = {SAC: binarySAC, SIC: binarySIC};
    }

    async setTargetReportDescriptor(buffer: Buffer, numTarget: number) {
        var octet1;
        var octet2;
        var octet3;
        if (numTarget === 1) {
            octet1 = buffer[0].toString(2).padStart(8, '0');
        } else if (numTarget === 2) {
            octet1 = buffer[0].toString(2).padStart(8, '0');
            octet2 = buffer[1].toString(2).padStart(8, '0');
        } else if (numTarget === 3) {
            octet1 = buffer[0].toString(2).padStart(8, '0');
            octet2 = buffer[1].toString(2).padStart(8, '0');
            octet3 = buffer[2].toString(2).padStart(8, '0');
        } else {
            console.log('Valor de numTarget no válido');
        }
        if (octet1 != undefined) {
            var TYP;

            var binaryOctet1 = octet1.slice(0, 3);

            if (binaryOctet1 === '000') {
                TYP = 'No detection';
            } else if (binaryOctet1 === '001') {
                TYP = 'Single PSR detection';
            } else if (binaryOctet1 === '010') {
                TYP = 'Single SSR detection';
            } else if (binaryOctet1 === '011') {
                TYP = 'SSR + PSR detection';
            } else if (binaryOctet1 === '100') {
                TYP = 'Single ModeS All-Call';
            } else if (binaryOctet1 === '101') {
                TYP = 'Single ModeS Roll-Call';
            } else if (binaryOctet1 === '110') {
                TYP = 'ModeS All-Call + PSR';
            } else if (binaryOctet1 === '111') {
                TYP = 'ModeS Roll-Call + PSR';
            } else {
                TYP = 'Valor no reconocido'; 
            }

            console.log('TYP: ' + TYP);

            var SIM = octet1[3] === '1' ? 'Simulated target report' : 'Actual target report';
            var RDP = octet1[4] === '1' ? 'Report from RDP Chain 2' : 'Report from RDP Chain 1';
            var SPI = octet1[5] === '1' ? 'Special Position Identification' : 'Absence of SPI';
            var RAB = octet1[6] === '1' ? 'Report from field monitor (fixed transponder)' : 'Report from aircraft transponder';
            var FX = octet1[7] === '1' ? 'Extension into first extent' : 'End of Data Item';

            console.log('SIM: ' + SIM);
            console.log('RDP: ' + RDP);
            console.log('SPI: ' + SPI);
            console.log('RAB: ' + RAB);
            console.log('FX: ' + FX);  
            
            this.targetReportDescriptor = {TYP: TYP, SIM: SIM, RDP: RDP, SPI: SPI, RAB: RAB};
        }

        if (octet2 != undefined) {
            var TST = octet2[0] === '1' ? 'Test target report' : 'Real target report';
            var ERR = octet2[1] === '1' ? 'Extended Range present' : 'No Extended Range';
            var XPP = octet2[2] === '1' ? 'X-Pulse present' : 'No X-Pulse present';
            var ME = octet2[3] === '1' ? 'Military emergency' : 'No military emergency';
            var MI = octet2[4] === '1' ? 'Military identification' : 'No military identification';
            var FOE_FRI = octet2.slice(4, 6);
            var FX = octet2[7] === '1' ? 'Extension into next extent' : 'End of Data Item';

            console.log('TST: ' + TST);
            console.log('ERR: ' + ERR);
            console.log('XPP: ' + XPP);
            console.log('ME: ' + ME);
            console.log('MI: ' + MI);
            console.log('FOE/FRI: ' + FOE_FRI);
            console.log('FX: ' + FX);

        }

        if (octet3 != undefined) {
            var ADSB = octet3[0] === '1' ? 'ADSB populated' : 'ADSB not populated';
            var ADSB_VAL = octet3[1] === '1' ? 'available' : 'not available';
            var SCN = octet3[2] === '1' ? 'SCN populated' : 'SCN not populated';
            var SCN_VAL = octet3[3] === '1' ? 'available' : 'not available';
            var PAI = octet3[4] === '1' ? 'PAI populated' : 'PAI not populated';
            var PAI_VAL = octet3[5] === '1' ? 'available' : 'not available';
            var SPARE = octet3[6] === '1' ? 'Spare Bit, not set to 0' : 'Spare Bit, set to 0';
            var FX = octet3[7] === '1' ? 'Extension into next extent' : 'End of Data Item';

            console.log('ADSB: ' + ADSB);
            console.log('ADSB_VAL: ' + ADSB_VAL);
            console.log('SCN: ' + SCN);
            console.log('SCN_VAL: ' + SCN_VAL);
            console.log('PAI: ' + PAI);
            console.log('PAI_VAL: ' + PAI_VAL);
            console.log('SPARE: ' + SPARE);
            console.log('FX: ' + FX);
        }

    }

    async setMeasuredPositionPolarCoordinates(buffer: Buffer) {
        var RHO = parseInt(buffer[0].toString(2).padStart(8, '0') + buffer[1].toString(2).padStart(8, '0'), 2);
        console.log('RHO (decimal): ' + RHO + ' -- (nmi): ' + RHO/256 + ' nmi');

        var THETA = parseInt(buffer[2].toString(2).padStart(8, '0') + buffer[3].toString(2).padStart(8, '0'), 2);
        console.log('THETA (decimal): ' + THETA + ' -- (º): ' + (THETA * (360 / Math.pow(2, 16))) + ' º');
    }

    async setCalculatedPositionCartesianCoordinates(buffer: Buffer) {

    }

    async setMode3ACodeOctalRepresentation(buffer: Buffer) {
        var octet1 = buffer[0].toString(2).padStart(8, '0');
        var octet2 = buffer[1].toString(2).padStart(8, '0');

        var V = octet1[0] === '1' ? 'Code not validated' : 'Code validated';
        var G = octet1[1] === '1' ? 'Garbled code' : 'Default';
        var L = octet1[2] === '1' ? 'Mode-3/A code not extracted during the last scan' : 'Mode-3/A code derived from the reply of the transponder';
        var bit13 = octet1[3] === '1' ? 'Spare bit not set to 0' : 'Spare bit set to 0';
        var octalCode = octet1.slice(1) + octet2; 

        function binaryToOctal(binaryString: string) {
            while (binaryString.length % 3 !== 0) {
                binaryString = '0' + binaryString;
            }
        
            var octalString = '';
            for (var i = 0; i < binaryString.length; i += 3) {
                var octalDigit = parseInt(binaryString.slice(i, i + 3), 2).toString(8);
                octalString += octalDigit;
            }
        
            return octalString;
        }

        console.log('V: ' + V);
        console.log('G: ' + G);
        console.log('L: ' + L);
        console.log('Bit13: ' + bit13);
        console.log('Octal Code (binary): ' + octalCode + ' -- (octal): ' + binaryToOctal(octalCode));

    }

    async setFlightLevelBinaryRepresentation(buffer: Buffer) {
        var octet1 = buffer[0].toString(2).padStart(8, '0');
        var octet2 = buffer[1].toString(2).padStart(8, '0');

        var V = octet1[0] === '1' ? 'Code not validated' : 'Code validated';
        var G = octet1[1] === '1' ? 'Garbled code' : 'Default';
        
        var flightLevelBinary = octet1.slice(2, 8) + octet2;

        console.log('V: ' + V);
        console.log('G: ' + G);

        var flightLevelDecimal = parseInt(flightLevelBinary, 2);

        var flightLevelValue = flightLevelDecimal * 0.25;

        console.log('Flight Level (Binary): ' + flightLevelBinary + ' -- (decimal): ' + flightLevelDecimal + '-- (1/4 FL): ' + flightLevelValue);

    }

    async setHeightMeasuredBy3DRadar(buffer: Buffer) {

    }

    async setRadarPlotCharacteristics(buffer: string, subfield: number) {
        if (subfield === 0) {
            var SRL = buffer;     
            console.log('SRL (decimal): ' + parseInt(SRL, 2) + ' -- (dg): ' + parseInt(SRL, 2)*(360 / Math.pow(2, 13)) + ' dg');

        } else if (subfield === 1) {
            var SRR = buffer;    
            console.log('SRR: ' + parseInt(SRR, 2));
        } else if (subfield === 2) {
            var SAM = buffer;    
            console.log('SAM (binary): ' + SAM);
        } else if (subfield === 3) {
            var PRL = buffer;   
            console.log('PRL (decimal): ' + parseInt(PRL, 2) + ' -- (dg): ' + parseInt(PRL, 2)*(360 / Math.pow(2, 13)) + ' dg');
        } else if (subfield === 4) {
            var PAM = buffer;    
            console.log('PAM (binary): ' + PAM + ' -- (decimal): ' + parseInt(PAM, 2) + ' dBm');
        } else if (subfield === 5) {
            var RPD = buffer;    
            console.log('RPD (decimal): ' + parseInt(RPD, 2) + ' -- (nmi): ' + parseInt(RPD, 2)/256 + ' nmi');
        } else if (subfield === 6) {
            var APD = buffer;    
            console.log('APD (decimal): ' + parseInt(APD, 2) + ' -- (dg): ' + parseInt(APD, 2)*(360 / Math.pow(2, 14)) + ' dg');
        }
    }
    

    async setTimeOfDay(buffer: Buffer) {
        var binaryBuffer1 = buffer[0].toString(2).padStart(8, '0');
        var binaryBuffer2 = buffer[1].toString(2).padStart(8, '0');
        var binaryBuffer3 = buffer[2].toString(2).padStart(8, '0');

        var timeDay = binaryBuffer1 + binaryBuffer2 + binaryBuffer3;

        const decimalTimeDay = parseInt(timeDay, 2);
    
        console.log('Time-of-day (binario): ' + timeDay + ' -- (decimal): ' + decimalTimeDay/128 + ' s');
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
