export interface Message {
    message: {
        messages: {
            type: string;
            data: number[];
        };
        dataSourceIdentifier: DataSourceIdentifier;                                            //010
        targetReportDescriptor: TargetReportDescriptor;                                        //020
        measuredPositionPolarCoordinates: PolarCoordinates;                                    //040
        calculatedPositionCartesianCoordinates: CartesianCoordinates;                          //042
        mode3ACodeOctalRepresentation: Mode3ACodeOctalRepresentation;                          //070
        flightLevelBinaryRepresentation: FlightLevelBinaryRepresentation;                      //090
        heightMeasuredBy3DRadar: HeightMeasuredBy3DRadar;                                      //110
        radarPlotCharacteristics: RadarPlotCharacteristics;                                    //130
        timeOfDay: string;   //(s)                                                             //140
        trackNumber: number;                                                                   //161
        trackStatus: TrackStatus;                                                              //170
        calculatedTrackVelocityPolarCoordinates: PolarCoordinates;                             //200
        aircraftAddress: string;                                                               //220
        communicationsACASCapabilityFlightStatus: CommunicationsACASCapabilityFlightStatus;    //230
        aircraftIdentification: string[];   //(8 characters)                                   //240
        bDSRegisterData: BDSRegisterData;                                                             
    };
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

  