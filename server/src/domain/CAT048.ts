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
    timeOfDay!: string;   //(s)                                                             //140
    trackNumber!: number;                                                                   //161
    trackStatus!: TrackStatus;                                                              //170
    calculatedTrackVelocityPolarCoordinates!: PolarCoordinates;                             //200
    aircraftAddress!: string;                                                               //220
    communicationsACASCapabilityFlightStatus!: CommunicationsACASCapabilityFlightStatus;    //230
    //aircraftIdentification!: string[];   //(8 characters)                                   //240
    aircraftIdentification!: string; 
    BDSRegisterData!: BDSRegisterData;                                                      //250
    modeBDS4!: BDSCode4;
    modeBDS5!: BDSCode5;
    modeBDS6!: BDSCode6; 


    constructor(messages: Buffer) {
        this.messages = messages;
        this.dataSourceIdentifier = { SAC: '', SIC: '' };
        this.targetReportDescriptor = { TYP: '', SIM: '', RDP: '', SPI: '', RAB: '' };
        this.measuredPositionPolarCoordinates = { rho: 0, theta: 0 };
        this.calculatedPositionCartesianCoordinates = { x: 0, y: 0 };
        this.mode3ACodeOctalRepresentation = { V: '', G: '', L: '', mode3A: '' };
        this.flightLevelBinaryRepresentation = { V: '', G: '', flightLevel: 0 };
        this.heightMeasuredBy3DRadar = { Height: 0 };
        this.radarPlotCharacteristics = { SRL: '', SRR: '', SAM: '', PRL: '', PAM: '', RPD: '', APD: '' };
        this.timeOfDay = '';
        this.trackNumber = 0;
        this.trackStatus = { CNF: '', RAD: '', DOU: '', MAH: '', CDM: '' };
        this.calculatedTrackVelocityPolarCoordinates = { rho: 0, theta: 0 };
        this.aircraftAddress = '';
        this.communicationsACASCapabilityFlightStatus = { COM: '', STAT: '', SI: '', MSSC: '', ARC: '', AIC: '', B1A: '', B1B: '' };
        // this.aircraftIdentification = ['', '', '', '', '', '', '', ''];
        this.aircraftIdentification = '';
        this.modeBDS4 = {   MCPstatus: 0, //1 
                            MCPaltitude: 0,
                            FMSstatus: 0, 
                            FMSaltitude: 0, 
                            BPSstatus: 0, 
                            BPSpressure: 0, 
                            modeStatus: 0, 
                            VNAV: 0, 
                            ALTHold: 0, 
                            approach: 0, 
                            targetAltStatus: '', 
                            targetAltSource: ''
                        };
        this.modeBDS5 = {   RASstatus: 0, 
                            RollAngle: 0,
                            TTAstatus: 0, 
                            TrueTrackAngle: 0,
                            GSstatus: 0,
                            GroundSpeed: 0,
                            TARstatus: 0,
                            TrackAngleRate: 0, 
                            TAstatus: 0,
                            TrueAirspeed: 0
                        };
        this.modeBDS6 = {   HDGstatus: 0, 
                            HDG: 0,
                            IASstatus: 0,
                            IAS: 0,
                            MACHstatus: 0,
                            MACH: 0,
                            BARstatus: 0, 
                            BAR: 0, 
                            IVVstatus: 0, 
                            IVV: 0 
                        };
        this.BDSRegisterData = {modeS: '', 
            bdsCode4: this.modeBDS4,
            bdsCode5: this.modeBDS5,
            bdsCode6: this.modeBDS6 };
        
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

        var j = 0;
        var counter = 3;

        while (j < numFSPEC) {
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
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 3);
                        this.setAircraftAddress(parameter); 
                        counter=counter+3;  
                    }

                    /*
                        Data Item I048/240, Aircraft Identification
                        Definition: Aircraft identification (in 8 characters) obtained from an aircraft equipped with a 
                        Mode S transponder.
                        Format: Six-octet fixed length Data Item.
                    */
                    if (binaryArray[6] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 6);
                        this.setAircraftIdentification(parameter);
                        counter=counter+6;
                    }

                    /*
                        Data Item I048/250, BDS Register Data
                        Definition: BDS Register Data as extracted from the aircraft transponder.
                        Format: Repetitive Data Item starting with a one-octet Field Repetition Indicator (REP) followed 
                        by at least one BDS Register comprising one seven octet BDS Register Data and one octet BDS Register 
                        code.
                    */
                    if (binaryArray[5] === '1') {
                        
                        var parameterRepetition = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 1);
                        const bitsRepetition = parameterRepetition[0].toString(2).padStart(8, '0');
                        const numberBDS=parseInt(bitsRepetition, 2);
                        console.log("Number BDSs of message:" +numberBDS);
                        counter=counter+1;
                        let byteBDS=counter; 
                        for(let i=0; i<numberBDS; i+=1){
                            var parameterBDSData = this.messages.subarray(numFSPEC+byteBDS, numFSPEC+byteBDS+8);
                            const bitsBDSData = parameterBDSData[0].toString(2).padStart(8, '0');
                            const bitsBDSData2 = parameterBDSData[1].toString(2).padStart(8, '0');
                            const bitsBDSData3 = parameterBDSData[2].toString(2).padStart(8, '0');
                            const bitsBDSData4 = parameterBDSData[3].toString(2).padStart(8, '0');
                            const bitsBDSData5 = parameterBDSData[4].toString(2).padStart(8, '0');
                            const bitsBDSData6 = parameterBDSData[5].toString(2).padStart(8, '0');
                            const bitsBDSData7 = parameterBDSData[6].toString(2).padStart(8, '0');
                            const chainBitsDataBDS=bitsBDSData+bitsBDSData2+bitsBDSData3+bitsBDSData4+bitsBDSData5+bitsBDSData6+bitsBDSData6;
                            var parameterBDSRegister=this.messages.subarray(numFSPEC+byteBDS+7, numFSPEC+byteBDS+8);
                            this.setModeBDS(parameterBDSRegister,chainBitsDataBDS);
                            byteBDS=byteBDS+8;
                        }
                        
                        counter=counter+numberBDS*8;
                    }

                    /*
                        Data Item I048/161, Track Number
                        Definition: An integer value representing a unique reference to a track record within a particular 
                        track file.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[4] === '1') {
                        var parameterTrackNumber = this.messages.subarray(numFSPEC+counter, numFSPEC+counter+2);
                        this.setTrackNumber(parameterTrackNumber);
                        counter=counter+2;
                    }

                    /*
                        Data Item I048/042, Calculated Position in Cartesian Co-ordinates
                        Definition: Calculated position of an aircraft in Cartesian co-ordinates.
                        Format: Four-octet fixed length Data Item in Two’s Complement.
                    */
                    if (binaryArray[3] === '1') {
                        var parameterCartesianCoordinates = this.messages.subarray(numFSPEC+counter, numFSPEC+counter+4);
                        this.setCalculatedPositionCartesianCoordinates(parameterCartesianCoordinates);
                        counter=counter+4;
                    }

                    /*
                        Data Item I048/200, Calculated Track Velocity in Polar Co-ordinates
                        Definition: Calculated track velocity expressed in polar co-ordinates.
                        Format: Four-octet fixed length Data Item.
                    */
                    if (binaryArray[2] === '1') {
                        var parameterTrackVelocity = this.messages.subarray(numFSPEC+counter, numFSPEC+counter+4);
                        this.setCalculatedTrackVelocityPolarCoordinates(parameterTrackVelocity);
                        counter=counter+4;
                    }

                    /*
                        Data Item I048/170, Track Status
                        Definition: Status of monoradar track (PSR and/or SSR updated).
                        Format: Variable length Data Item comprising a first part of one-octet, followed by one-octet 
                        extents as necessary.
                    */
                    if (binaryArray[1] === '1') {
                        var parameterTrackStatus = this.messages.subarray(numFSPEC+counter, numFSPEC+counter+1);
                        this.setTrackStatus(parameterTrackStatus);
                        const firstByteTrackStatus = parameterTrackStatus[0].toString(2).padStart(8, '0');
                        const fx = firstByteTrackStatus.split('');
                        counter=counter+1;
                        if(fx[7]==='1'){
                            var parameterTrackStatusSecondByte = this.messages.subarray(numFSPEC+counter+1, numFSPEC+counter+2);
                            this.setTrackStatus2(parameterTrackStatusSecondByte);
                            counter=counter+1;
                        }

                    }
                    break;
                case 2:

                    /*
                        No s'ha d'analitzar (I048/210)
                        Four-octet fixed length Data Item.
                    */
                    if (binaryArray[7] === '1') {
                        counter = counter + 4;
                    }

                    /*
                        No s'ha d'analitzar (I048/030)
                        Variable length Data Item comprising a first part of one-octet, followed by one-octet extents as necessary.
                    */
                    if (binaryArray[6] === '1') {
                        var numTarget = 0;
                        var moreTarget = true;
                        var i = 0;

                        while (moreTarget) { 
                            var octet1  = this.messages.readUInt8(numFSPEC + counter + i).toString(2).padStart(8, '0').split('');
                            if (octet1[7] === '1') {
                                numTarget += 1;
                            } else {
                                numTarget += 1; 
                                moreTarget = false;
                            }               
                            i = i + 1;
                        }

                        counter = counter + numTarget;
                    }

                    /*
                        No s'ha d'analitzar (I048/080)
                        Two-octet fixed length Data Item.
                    */
                    if (binaryArray[5] === '1') {
                        counter = counter + 2;
                    }

                    /*
                        No s'ha d'analitzar (I048/100)
                        Four-octet fixed length Data Item.
                    */
                    if (binaryArray[4] === '1') {
                        counter = counter + 4;
                    }

                    /*
                        Data Item I048/110, Height Measured by a 3D Radar
                        Definition: Height of a target as measured by a 3D radar. The height shall use mean sea level as the 
                        zero reference level.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[3] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2);
                        this.setHeightMeasuredBy3DRadar(parameter)
                        counter = counter + 2;
                    }

                    /*
                        No s'ha d'analitzar (I048/120)
                        Compound Data Item, comprising a primary subfield of one octet, followed by one of the two defined subfields.
                    */
                    if (binaryArray[2] === '1') {
                        var octet1  = this.messages.readUInt8(numFSPEC + counter).toString(2).padStart(8, '0').split('');
                        if (octet1[0] === '1') {
                            counter = counter + 3;
                        } else if (octet1[1] === '1') {
                            counter = counter + 8;
                        }
                    }

                    /*
                        Data Item I048/230, Communications/ACAS Capability and Flight Status
                        Definition: Communications capability of the transponder, capability of the on-board ACAS equipment 
                        and flight status.
                        Format: Two-octet fixed length Data Item.
                    */
                    if (binaryArray[1] === '1') {
                        var parameter = this.messages.subarray(numFSPEC + counter, numFSPEC + counter + 2);
                        this.setCommunicationsACASCapabilityFlightStatus(parameter)
                        counter = counter + 2;
                    }
                    break;
            }

            j += 1;
            
        }
    }

    async setDataSourceIdentifier(buffer: Buffer) {
        var SAC = buffer[0];
        var SIC = buffer[1];

        this.dataSourceIdentifier.SAC = SAC.toString(2).padStart(8, '0');
        this.dataSourceIdentifier.SIC = SIC.toString(2).padStart(8, '0');

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

            this.targetReportDescriptor.TYP = TYP;

            this.targetReportDescriptor.SIM = octet1[3] === '1' ? 'Simulated target report' : 'Actual target report';
            this.targetReportDescriptor.RDP = octet1[4] === '1' ? 'Report from RDP Chain 2' : 'Report from RDP Chain 1';
            this.targetReportDescriptor.SPI = octet1[5] === '1' ? 'Special Position Identification' : 'Absence of SPI';
            this.targetReportDescriptor.RAB = octet1[6] === '1' ? 'Report from field monitor (fixed transponder)' : 'Report from aircraft transponder';
            //this.targetReportDescriptor.fx = octet1[7] === '1' ? 'Extension into first extent' : 'End of Data Item'; 
        }

        if (octet2 != undefined) {
            this.targetReportDescriptor.TST = octet2[0] === '1' ? 'Test target report' : 'Real target report';
            this.targetReportDescriptor.ERR = octet2[1] === '1' ? 'Extended Range present' : 'No Extended Range';
            this.targetReportDescriptor.XPP = octet2[2] === '1' ? 'X-Pulse present' : 'No X-Pulse present';
            this.targetReportDescriptor.ME = octet2[3] === '1' ? 'Military emergency' : 'No military emergency';
            this.targetReportDescriptor.MI = octet2[4] === '1' ? 'Military identification' : 'No military identification';
            this.targetReportDescriptor.FOE_FRI = octet2.slice(4, 6);
            //var FX = octet2[7] === '1' ? 'Extension into next extent' : 'End of Data Item';
        }

        if (octet3 != undefined) {
            this.targetReportDescriptor.ADSB_EP = octet3[0] === '1' ? 'ADSB populated' : 'ADSB not populated';
            this.targetReportDescriptor.ADSB_VAL = octet3[1] === '1' ? 'On-Site ADS-B Information available' : 'On-Site ADS-B Information not available';
            this.targetReportDescriptor.SCN_EP = octet3[2] === '1' ? 'SCN populated' : 'SCN not populated';
            this.targetReportDescriptor.SCN_VAL = octet3[3] === '1' ? 'Surveillance Cluster Network Information available' : 'Surveillance Cluster Network Information not available';
            this.targetReportDescriptor.PAI_EP = octet3[4] === '1' ? 'PAI populated' : 'PAI not populated';
            this.targetReportDescriptor.PAI_VAL = octet3[5] === '1' ? 'Passive Acquisition Interface Information available' : 'Passive Acquisition Interface Information not available';
            this.targetReportDescriptor.SPARE = octet3[6] === '1' ? 'Spare Bit, not set to 0' : 'Spare Bit, set to 0';
            //var FX = octet3[7] === '1' ? 'Extension into next extent' : 'End of Data Item';
        }

    }

    async setMeasuredPositionPolarCoordinates(buffer: Buffer) {
        var RHO = parseInt(buffer[0].toString(2).padStart(8, '0') + buffer[1].toString(2).padStart(8, '0'), 2);
        this.measuredPositionPolarCoordinates.rho = RHO/256;

        var THETA = parseInt(buffer[2].toString(2).padStart(8, '0') + buffer[3].toString(2).padStart(8, '0'), 2);
        this.measuredPositionPolarCoordinates.theta = THETA * (360 / Math.pow(2, 16));
    }

    async setCalculatedPositionCartesianCoordinates(buffer: Buffer) {
        const XcomponentBits=buffer[0].toString(2).padStart(8,'0') + buffer[1].toString(2).padStart(8,'0');
        const YcomponentBits=buffer[2].toString(2).padStart(8,'0') + buffer[3].toString(2).padStart(8,'0');
        
        function twoComplementOfChainBits(chainBits: string): number{
            const signChain=chainBits.substring(0,1);
            const numberChain=chainBits.substring(1);
            var finalNumberChain='';
            var isNegative=false;
            if(signChain=='1'){
                isNegative=true;        
            }
        else{
            var invertedBits='';
            // Inverting all the bit chain first
            for(let i=0; i<numberChain.length; i+=1){
                numberChain[i]==='0' ? invertedBits=invertedBits+'1': invertedBits=invertedBits+'0';   
            }
            // Adding 1 to all the chain bit inversed
            let carry=1;
            
            for (let j = invertedBits.length - 1; j >= 0; j--) {
                const sum = Number(invertedBits[j]) + carry;
                finalNumberChain = (sum % 2) + finalNumberChain;
                carry = Math.floor(sum / 2);
              }
            }
            if(isNegative){
                return(-parseInt(finalNumberChain, 2));
            }
            else{
                return(parseInt(finalNumberChain, 2));
            }
            
        }
        this.calculatedPositionCartesianCoordinates.x=twoComplementOfChainBits(XcomponentBits);
        this.calculatedPositionCartesianCoordinates.y=twoComplementOfChainBits(YcomponentBits);
        

    }
    async twoComplementOfChainBits(chainBits: string){
        
        
        
        
    }

    async setMode3ACodeOctalRepresentation(buffer: Buffer) {
        var octet1 = buffer[0].toString(2).padStart(8, '0');
        var octet2 = buffer[1].toString(2).padStart(8, '0');

        this.mode3ACodeOctalRepresentation.V = octet1[0] === '1' ? 'Code not validated' : 'Code validated';
        this.mode3ACodeOctalRepresentation.G = octet1[1] === '1' ? 'Garbled code' : 'Default';
        this.mode3ACodeOctalRepresentation.L = octet1[2] === '1' ? 'Mode-3/A code not extracted during the last scan' : 'Mode-3/A code derived from the reply of the transponder';
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

        this.mode3ACodeOctalRepresentation.mode3A = binaryToOctal(octalCode);

    }

    async setFlightLevelBinaryRepresentation(buffer: Buffer) {
        var octet1 = buffer[0].toString(2).padStart(8, '0');
        var octet2 = buffer[1].toString(2).padStart(8, '0');

        this.flightLevelBinaryRepresentation.V = octet1[0] === '1' ? 'Code not validated' : 'Code validated';
        this.flightLevelBinaryRepresentation.G = octet1[1] === '1' ? 'Garbled code' : 'Default';
        
        var flightLevelBinary = octet1.slice(2, 8) + octet2;

        var flightLevelDecimal = parseInt(flightLevelBinary, 2);

        var flightLevelValue = flightLevelDecimal * 0.25;

        this.flightLevelBinaryRepresentation.flightLevel = flightLevelValue;

    }

    async setHeightMeasuredBy3DRadar(buffer: Buffer) {
        var octet1 = buffer[0].toString(2).padStart(8, '0');
        var octet2 = buffer[1].toString(2).padStart(8, '0');
        
        var heightMeasuredBinary = octet1.slice(2, 8) + octet2;

        var heightMeasuredDecimal = parseInt(heightMeasuredBinary, 2);

        var heightMeasuredFeet = heightMeasuredDecimal * 25;

        this.heightMeasuredBy3DRadar.Height = heightMeasuredFeet;
    }

    async setRadarPlotCharacteristics(buffer: string, subfield: number) {
        if (subfield === 0) {
            var SRL = buffer;     
            this.radarPlotCharacteristics.SRL = parseInt(SRL, 2)*(360 / Math.pow(2, 13)) + ' dg';

        } else if (subfield === 1) {
            var SRR = buffer;    
            this.radarPlotCharacteristics.SRR = parseInt(SRR, 2) + '';
        } else if (subfield === 2) {
            var SAM = buffer;    
            this.radarPlotCharacteristics.SAM = SAM + '';
        } else if (subfield === 3) {
            var PRL = buffer;   
            this.radarPlotCharacteristics.PRL = parseInt(PRL, 2)*(360 / Math.pow(2, 13)) + ' dg';
        } else if (subfield === 4) {
            var PAM = buffer;    
            this.radarPlotCharacteristics.PAM = parseInt(PAM, 2) + ' dBm';
        } else if (subfield === 5) {
            var RPD = buffer;    
            this.radarPlotCharacteristics.RPD = parseInt(RPD, 2)/256 + ' nmi';
        } else if (subfield === 6) {
            var APD = buffer;    
            this.radarPlotCharacteristics.APD = parseInt(APD, 2)*(360 / Math.pow(2, 14)) + ' dg';
        }
    }
    

    async setTimeOfDay(buffer: Buffer) {
        var binaryBuffer1 = buffer[0].toString(2).padStart(8, '0');
        var binaryBuffer2 = buffer[1].toString(2).padStart(8, '0');
        var binaryBuffer3 = buffer[2].toString(2).padStart(8, '0');

        var timeDay = binaryBuffer1 + binaryBuffer2 + binaryBuffer3;

        const decimalTimeDay = parseInt(timeDay, 2);
    
        this.timeOfDay = decimalTimeDay/128 + ' s';
    }
    

    async setTrackNumber(buffer: Buffer) {
        let trackNumberBits=''; 
        for(let i=0; i<buffer.length; i+=1){
            trackNumberBits = trackNumberBits + buffer[i].toString(2).padStart(8, '0');
        }
        const trackNumber=parseInt(trackNumberBits, 2);
        this.trackNumber=trackNumber;
    }

    async setTrackStatus(buffer: Buffer) {
        const bitsTrackStatus= buffer[0].toString(2).padStart(8,'0');
        const charBitsTrackStatus=bitsTrackStatus.split('');
        charBitsTrackStatus[0]==='0' ? this.trackStatus.CNF="Confirmed track" : this.trackStatus.CNF="Tentative track";
        if(charBitsTrackStatus[1]==='0' && charBitsTrackStatus[2]==='0'){
            this.trackStatus.RAD="Combined";
        } 
        if(charBitsTrackStatus[1]==='0' && charBitsTrackStatus[2]==='1'){
            this.trackStatus.RAD="PSR Track";
        } 
        if(charBitsTrackStatus[1]==='1' && charBitsTrackStatus[2]==='0'){
            this.trackStatus.RAD="SSR/Mode S Track";
        } 
        if(charBitsTrackStatus[1]==='1' && charBitsTrackStatus[2]==='1'){
            this.trackStatus.RAD="Invalid";
        } 
        charBitsTrackStatus[3]==='0' ? this.trackStatus.DOU="Normal confidence" : this.trackStatus.DOU="Low confidence in plot to track association";
        charBitsTrackStatus[4]==='0' ? this.trackStatus.MAH="No horizontal man.sensed" : this.trackStatus.MAH="Horizontal man. sensed";
        if(charBitsTrackStatus[5]==='0' && charBitsTrackStatus[6]==='0'){
            this.trackStatus.CDM="Maintaining";
        }
        if(charBitsTrackStatus[5]==='0' && charBitsTrackStatus[6]==='1'){
            this.trackStatus.CDM="Climbing";
        }
        if(charBitsTrackStatus[5]==='1' && charBitsTrackStatus[6]==='0'){
            this.trackStatus.CDM="Descending";
        }
        if(charBitsTrackStatus[5]==='1' && charBitsTrackStatus[6]==='1'){
            this.trackStatus.CDM="Unknown";
        } 
    }
    async setTrackStatus2(buffer:Buffer){
        const bitsTrackStatus= buffer[0].toString(2).padStart(8,'0');
        const charBitsTrackStatus=bitsTrackStatus.split('');
        charBitsTrackStatus[0]==='0' ? this.trackStatus.TRE="Track still alive" : this.trackStatus.TRE="End of track lifetime";
        charBitsTrackStatus[0]==='0' ? this.trackStatus.GHO="True target track" : this.trackStatus.GHO="Ghost target track";
        charBitsTrackStatus[0]==='0' ? this.trackStatus.SUP="no" : this.trackStatus.SUP="yes";
        charBitsTrackStatus[0]==='0' ? this.trackStatus.TCC="Tracking performed in so-called 'Radar Plane', i.e. neither slant range correction nor stereographical projection was applied" : this.trackStatus.TCC="Slant range correction and a suitable projection technique are used to track in a 2D.reference plane, tangential to the earth model at the Radar Site co-ordinates";
    }

    async setCalculatedTrackVelocityPolarCoordinates(buffer: Buffer) {
        var RHO = parseInt(buffer[0].toString(2).padStart(8, '0') + buffer[1].toString(2).padStart(8, '0'), 2);
        this.calculatedTrackVelocityPolarCoordinates.rho = RHO*0.22;
        console.log("Calculated groundspeed: ", this.calculatedTrackVelocityPolarCoordinates.rho);

        var THETA = parseInt(buffer[2].toString(2).padStart(8, '0') + buffer[3].toString(2).padStart(8, '0'), 2);
        this.calculatedTrackVelocityPolarCoordinates.theta  = THETA * (360 / Math.pow(2, 16));
        console.log("Calculated groundspeed: ", this.calculatedTrackVelocityPolarCoordinates.theta);
    }

    async setAircraftAddress(buffer: Buffer) {
        const firstByte= buffer[0];
        this.binaryToHex(firstByte.toString(2).padStart(8,'0'));
        const secondByte= buffer[1];
        this.binaryToHex(secondByte.toString(2).padStart(8,'0'));
        const thirdByte= buffer[2];
        this.binaryToHex(thirdByte.toString(2).padStart(8,'0'));
    }

    async binaryToHex(binaryString:string){
        const binToHexTable: { [key: string]: string } = {
            '0000': '0',
            '0001': '1',
            '0010': '2',
            '0011': '3',
            '0100': '4',
            '0101': '5',
            '0110': '6',
            '0111': '7',
            '1000': '8',
            '1001': '9',
            '1010': 'A',
            '1011': 'B',
            '1100': 'C',
            '1101': 'D',
            '1110': 'E',
            '1111': 'F',
          };
          for(let i=0; i<binaryString.length; i+=4){
            const fourBits=binaryString.substring(i,i+4);
            const hexValue=binToHexTable[fourBits];
            this.aircraftAddress=this.aircraftAddress+hexValue;
          }

    }

    async setCommunicationsACASCapabilityFlightStatus(buffer: Buffer) {
        var octet1 = buffer[0].toString(2).padStart(8, '0');
        var octet2 = buffer[1].toString(2).padStart(8, '0');

        var COM = octet1.slice(0, 3);
        var COM_int = parseInt(COM, 2);
        switch(COM_int) {
            case 0:
                this.communicationsACASCapabilityFlightStatus.COM = 'No communications capability (surveillance only)';
                break;
            case 1:
                this.communicationsACASCapabilityFlightStatus.COM = 'Comm. A and Comm. B capability';
                break;
            case 2:
                this.communicationsACASCapabilityFlightStatus.COM = 'Comm. A, Comm. B and Uplink ELM';
                break;
            case 3:
                this.communicationsACASCapabilityFlightStatus.COM = 'Comm. A, Comm. B, Uplink ELM and Downlink ELM';
                break;
            case 4:
                this.communicationsACASCapabilityFlightStatus.COM = 'Level 5 Transponder capability';
                break;
            case 5:
            case 6:
            case 7:
                this.communicationsACASCapabilityFlightStatus.COM = 'Not assigned';
                break;
        }

        var STAT = octet1.slice(3, 6);
        var STAT_int = parseInt(STAT, 2);
        switch(STAT_int) {
            case 0:
                this.communicationsACASCapabilityFlightStatus.STAT = 'No alert, no SPI, aircraft airborne';
                break;
            case 1:
                this.communicationsACASCapabilityFlightStatus.STAT = 'No alert, no SPI, aircraft on ground';
                break;
            case 2:
                this.communicationsACASCapabilityFlightStatus.STAT = 'Alert, no SPI, aircraft airborne';
                break;
            case 3:
                this.communicationsACASCapabilityFlightStatus.STAT = 'Alert, no SPI, aircraft on ground';
                break;
            case 4:
                this.communicationsACASCapabilityFlightStatus.STAT = 'Alert, SPI, aircraft airborne or on ground';
                break;
            case 5:
                this.communicationsACASCapabilityFlightStatus.STAT = 'No alert, SPI, aircraft airborne or on ground';
                break;
            case 6:
                this.communicationsACASCapabilityFlightStatus.STAT = 'Not assigned';
                break;
            case 7:
                this.communicationsACASCapabilityFlightStatus.STAT = 'Unknown';
                break;
        }
        
        this.communicationsACASCapabilityFlightStatus.SI = octet1[7] === '1' ? 'II-Code Capable' : 'SI-Code Capable';
        this.communicationsACASCapabilityFlightStatus.MSSC = octet2[0] === '1' ? 'Yes' : 'No';
        this.communicationsACASCapabilityFlightStatus.ARC = octet2[1] === '1' ? '25 ft resolution' : '100 ft resolution';
        this.communicationsACASCapabilityFlightStatus.AIC = octet2[2] === '1' ? 'Yes' : 'No';
        this.communicationsACASCapabilityFlightStatus.B1A = octet2[3];
        this.communicationsACASCapabilityFlightStatus.B1B = octet2.slice(4, 8);
    }

    async setAircraftIdentification(buffer: Buffer) {
        
        let aircraftIdentificationBytes=''; 
        for(let i=0; i<buffer.length; i+=1){
            aircraftIdentificationBytes = aircraftIdentificationBytes + buffer[i].toString(2).padStart(8, '0');
        }
        this.decodeAircraftIdentification(aircraftIdentificationBytes);

    }
    async decodeAircraftIdentification(chainBits: string) {
        const binToIDTable: { [key: string]: string } = {
            '000000': '',
            '000010': 'P',
            '000001': '',
            '000011': '0',
            '100000': 'A',
            '100010': 'Q',
            '100001': '',
            '100011': '1',
            '010000': 'B',
            '010010': 'R',
            '010001': '',
            '010011': '2',
            '110000': 'C',
            '110010': 'S',
            '110001': '',
            '110011': '3',
            '001000': 'D',
            '001010': 'T',
            '001001': '',
            '001011': '4',
            '101000': 'E',
            '101010': 'U',
            '101001': '',
            '101011': '5',
            '011000': 'F',
            '011010': 'V',
            '011001': '',
            '011011': '6',
            '111000': 'G',
            '111010': 'W',
            '111001': '',
            '111011': '7',
            '000100': 'H',
            '000110': 'X',
            '000101': '',
            '000111': '8',
            '100100': 'I',
            '100110': 'Y',
            '100101': '',
            '100111': '9',
            '010100': 'J',
            '010110': 'Z',
            '010101': '',
            '010111': '',
            '110100': 'K',
            '110110': '',
            '110101': '',
            '110111': '',
            '001100': 'L',
            '001110': '',
            '001101': '',
            '001111': '',
            '101100': 'M',
            '101110': '',
            '101101': '',
            '101111': '',
            '011100': 'N',
            '011110': '',
            '011101': '',
            '011111': '',
            '111100': 'O',
            '111110': '',
            '111101': '',
            '111111': '', 
          };
          for(let i=0; i<chainBits.length; i+=6){
            const sixBits=chainBits.substring(i,i+6);
            const sixBitsReversed=sixBits.split('').reverse().join('');
            const sixBitsDecoded=binToIDTable[sixBitsReversed];
            this.aircraftIdentification=this.aircraftIdentification+sixBitsDecoded;
          }
          console.log(this.aircraftIdentification);
    }

    async setBDSRegisterData(buffer: Buffer) {
        const chainBitsBDS=buffer[0].toString(2).padStart(8, '0');
        //console.log(chainBitsBDSID);
    }
    
    async setModeBDS(bufferRegister:Buffer, chainBitsData: string){
        const chainBitsBDSRegister=bufferRegister[0].toString(2).padStart(8, '0');
        const registerBDS1=chainBitsBDSRegister.substring(0,4);
        const registerBDS2=chainBitsBDSRegister.substring(4,8);
        
        const hexBDS1 = binaryToHex(registerBDS1);
        const hexBDS2 = binaryToHex(registerBDS2);
        
        const decimalBDS1 =hexToDecimal(hexBDS1);
        const decimalBDS2 =hexToDecimal(hexBDS2);
        
        this.BDSRegisterData.modeS=this.BDSRegisterData.modeS+"BDS: "+decimalBDS1+","+decimalBDS2;
        const decodeModeBDS4 = (chainBits: string) =>{
            console.log(chainBits);
            const MCPStatus = chainBits.substring(0,1);
            this.BDSRegisterData.bdsCode4.MCPstatus=parseInt(MCPStatus,2);
            if(this.BDSRegisterData.bdsCode4.MCPstatus===1){
                const MCPaltitudeBits=chainBits.substring(1,13).split('').reverse().join().replace(/,/g, '');
                console.log(MCPaltitudeBits);
                const MCPaltitude=parseInt(MCPaltitudeBits,2);
                this.BDSRegisterData.bdsCode4.MCPaltitude=MCPaltitude*16;
            }
            const FMSstatus=chainBits.substring(13,14);
            this.BDSRegisterData.bdsCode4.FMSstatus=parseInt(FMSstatus,2);
            if(this.BDSRegisterData.bdsCode4.FMSstatus===1){
                const FMSaltitudeBits=chainBits.substring(14,26).split('').reverse().join().replace(/,/g, '');
                const FMSaltitude=parseInt(FMSaltitudeBits,2);
                this.BDSRegisterData.bdsCode4.FMSaltitude=FMSaltitude*16;
            }
            const BPSstatus=chainBits.substring(26,27);
            this.BDSRegisterData.bdsCode4.BPSstatus=parseInt(BPSstatus,2);
            if(this.BDSRegisterData.bdsCode4.BPSstatus===1){
                const BPpressureBits=chainBits.substring(27,38).split('').reverse().join().replace(/,/g, '');
                const BPSpressure=parseInt(BPpressureBits,2);
                this.BDSRegisterData.bdsCode4.BPSpressure=BPSpressure*0.1+800;
            }
            const modeStatus=chainBits.substring(47,48);
            this.BDSRegisterData.bdsCode4.modeStatus=parseInt(modeStatus,2);
            const VNAVBits=chainBits.substring(48,49);
            this.BDSRegisterData.bdsCode4.VNAV=parseInt(VNAVBits,2);
            const ALTHold=chainBits.substring(49,50);
            this.BDSRegisterData.bdsCode4.ALTHold=parseInt(ALTHold,2);
            const approach=chainBits.substring(50,51);
            this.BDSRegisterData.bdsCode4.approach=parseInt(approach,2);
            const targetAltStatus=chainBits.substring(53,54);
            if(parseInt(targetAltStatus,2)===1){
                this.BDSRegisterData.bdsCode4.targetAltStatus="Source information deliberately provided";
            }
            else{
                this.BDSRegisterData.bdsCode4.targetAltStatus="No source information provided.";
            }
            const targetAltSource=chainBits.substring(53,55);
            if(targetAltSource==="00"){
                this.BDSRegisterData.bdsCode4.targetAltSource="Unknown";
               
            }
            else if(targetAltSource==="01"){
                this.BDSRegisterData.bdsCode4.targetAltSource="FCU/MCP selected altitude";
            }
            else if(targetAltSource==="10"){
                this.BDSRegisterData.bdsCode4.targetAltSource="FMS selected altitude";
            }
            else{
                this.BDSRegisterData.bdsCode4.targetAltSource="FMS selected altitude";
            }



           
          
            
        }
        const decodeModeBDS5 = (chainBits: string) => {

        }
        const decodeModeBDS6 =(chainBits: string) => {

        }
        if(decimalBDS1===4){
            decodeModeBDS4(chainBitsData); 
        }
        else if(decimalBDS1===5){
            decodeModeBDS5(chainBitsData);
        }
        else{
            decodeModeBDS6(chainBitsData);
        }
        
        function binaryToHex(binary: string): string {
            
            while (binary.length % 4 !== 0) {
              binary = '0' + binary;
            }
          
            let hex = '';
            for (let i = 0; i < binary.length; i += 4) {
              const chunk = binary.substr(i, 4);
              const decimalValue = parseInt(chunk, 2);
              const hexValue = decimalValue.toString(16).toUpperCase();
              hex += hexValue;
            }
          
            return hex;
          }
          function hexToDecimal(hex: string): number {
            const decimalValue = parseInt(hex, 16);
            return decimalValue;
          }
        
          
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
    ADSB_EP?: string;
    ADSB_VAL?: string;
    SCN_EP?: string;
    SCN_VAL?: string;
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
    flightLevel: number;
}

interface HeightMeasuredBy3DRadar {
    Height: number;
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
    modeS: string;
    bdsCode4: BDSCode4;
    bdsCode5: BDSCode5;
    bdsCode6: BDSCode6;
}
interface BDSCode4{
    MCPstatus: number; //1 
    MCPaltitude: number; //2-13
    FMSstatus: number; //14
    FMSaltitude: number; //15-26
    BPSstatus: number; //27
    BPSpressure: number; //28-39
    modeStatus: number; //48
    VNAV: number; //49
    ALTHold: number; //50
    approach: number; //51
    targetAltStatus: string; //54
    targetAltSource:  string; //55-56
}
interface BDSCode5{
    RASstatus: number; 
    RollAngle: number; 
    TTAstatus: number; 
    TrueTrackAngle: number; 
    GSstatus: number; 
    GroundSpeed: number;
    TARstatus:number;  
    TrackAngleRate: number; 
    TAstatus: number; 
    TrueAirspeed: number;
}
interface BDSCode6{
    HDGstatus: number; 
    HDG: number; 
    IASstatus: number; 
    IAS: number; 
    MACHstatus: number; 
    MACH: number; 
    BARstatus: number; 
    BAR: number; 
    IVVstatus: number; 
    IVV: number; 
}
