// I048/010 Data Source Identifier
//      Two-octet fixed length Data Item
//      It shall be present in every ASTERIX record


// I048/020 Target Report Descriptor
//      Variable length Data Item comprising a first part of one-octet, followed by one-octet extents as necessary.


// I048/040 Measured Position in Polar Co-ordinates
//      Four-octet fixed length Data Item
//      This item shall be sent when there is a detection.


// I048/042 Calculated Position in Cartesian Co-ordinates
//      Four-octet fixed length Data Item in Two’s Complement
//      This item is optional


// I048/070 Mode-3/A Code in Octal Representation
//      Two-octet fixed length Data Item


// I048/090 Flight Level in Binary Representation
//      Two-octet fixed length Data Item


// I048/110 Height Measured by a 3D Radar
//      Two-octet fixed length Data Item
//      This item is optional


// I048/130 Radar Plot Characteristics
//      Compound Data Item


// I048/140 Time of Day
//      Three-octet fixed length Data Item


// I048/161 Track Number
//      Two-octet fixed length Data Item
//      This data item shall be sent when the radar station outputs tracks


// I048/170 Track Status
//      Variable length Data Item comprising a first part of one-octet, followed by one-octet extents as necessary
//      This data item shall be sent when the radar station outputs tracks


// I048/200 Calculated Track Velocity in Polar Co-ordinates
//      Four-octet fixed length Data Item


// I048/220 Aircraft Address
//      Three-octet fixed length Data Item


// I048/230 Communications/ACAS Capability and Flight Status
//      Two-octet fixed length Data Item


// I048/240 Aircraft Identification
//      Six-octet fixed length Data Item


// I048/250 BDS Register Data
//      Repetitive Data Item starting with a one-octet Field Repetition Indicator (REP) followed by at least one BDS Register comprising one seven octet BDS Register Data and one octet BDS Register code




export {};