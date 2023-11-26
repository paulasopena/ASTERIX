import { loadModules } from 'esri-loader';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBytes, getAircrafts } from "../../asterix/file_manager";
import { Message } from '../../domain/Message';
import { FolderOpenOutline, FileTrayOutline, DownloadOutline, TabletLandscapeOutline } from 'react-ionicons';
import './HomeStyle.css';
import { Aircraft } from '../../domain/Aircraft';

const MapComponent: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<any>(null);
  const graphicsLayerRef = useRef<any>(null); // Referencia a la capa de gráficos
  const navigation = useNavigate();

  const openFile = () => {
    navigation('/picker');
  };

  const seeTableDecoder = () => {
    navigation('/home2');
  };

  const [fileData, setFileData] = useState<Aircraft[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const aircrafts =await getAircrafts('230502-est-080001_BCN_60MN_08_09.csv');
        if (aircrafts != undefined) {
          console.log(aircrafts)
          setFileData(JSON.parse(aircrafts));
        }
        
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/symbols/SimpleMarkerSymbol']).then(
      ([Map, MapView, GraphicsLayer, Graphic, SimpleMarkerSymbol]) => {
        const map = new Map({ basemap: 'streets' });
        const view = new MapView({
          container: mapDivRef.current!,
          map,
          center: [2.1020575, 41.3007024],
          zoom: 8,
        });

        mapViewRef.current = view;

  
        graphicsLayerRef.current = new GraphicsLayer();
        map.add(graphicsLayerRef.current);

        fileData.map((message, index)=>{
          console.log("HEY")
          // const initialLocation = message.route[0];
          const markerGraphic = new Graphic({
            // geometry: { type: 'point', longitude: initialLocation.lng, latitude: initialLocation.lat },
            geometry: { type: 'point', longitude: 1.048, latitude: 41.18 },
            symbol: new SimpleMarkerSymbol({ color: 'red' }),
          });
          graphicsLayerRef.current.add(markerGraphic);

        })
      

        return () => {
          if (mapViewRef.current) {
            mapViewRef.current.destroy();
          }
        };
      }
    );
  }, []);

  const downloadFile = () => {
    const filePath = '230502-est-080001_BCN_60MN_08_09.csv';
  
    const fileUrl = process.env.PUBLIC_URL + '/' + filePath;
  
    window.location.href = fileUrl;
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div ref={mapDivRef} style={{ flex: 1 }}></div>
      <div style={{ width: '75px', padding: '16px', backgroundColor: '#000000', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={openFile}>
          <FolderOpenOutline color={'#ffffff'} title={'Open file'} height="50px" width="50px" />
        </button>
        <button onClick={() => downloadFile()}>
          <FileTrayOutline color={'#ffffff'} title={'Export to CSV'} height="50px" width="50px" />
        </button>
        <button onClick={() => console.log('Botón 2')}>
          <DownloadOutline color={'#ffffff'} title={'Export to KML'} height="50px" width="50px" />
        </button>
        <button onClick={seeTableDecoder}>
          <TabletLandscapeOutline color={'#ffffff'} title={'Open the table'} height="50px" width="50px" />
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
