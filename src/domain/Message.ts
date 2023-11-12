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
        BDSRegisterData: BDSRegisterData; 
        modeBDS4: BDSCode4;
        modeBDS5: BDSCode5;
        modeBDS6: BDSCode6;                                                             
    };
}

interface DataSourceIdentifier {
    SAC: number;
    SIC: number; 
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
    targetAltSource: string; //55-56
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
  