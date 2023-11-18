import { loadModules } from 'esri-loader';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpenOutline, FileTrayOutline, DownloadOutline } from 'react-ionicons';

const MapComponent: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<any>(null);
  const navigation = useNavigate();
  const openFile=()=>{
    navigation('/picker'); 
  }
  useEffect(() => {
    loadModules(['esri/Map', 'esri/views/MapView']).then(([Map, MapView]) => {
      const map = new Map({ basemap: 'streets' });
      const view = new MapView({
        container: mapDivRef.current!,
        map,
        center: [2.1020575, 41.3007024],
        zoom: 8,
      });

      mapViewRef.current = view;

      return () => {
        if (mapViewRef.current) {
          mapViewRef.current.destroy();
        }
      };
    });
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div ref={mapDivRef} style={{ flex: 1 }}></div>
      <div style={{ width: '75px', padding: '16px', backgroundColor: '#00000', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
        <button onClick={openFile}>
          <FolderOpenOutline
              color={'#00000'} 
              title={'Open file'}
              height="50px"
              width="50px"
            /></button>
        <button onClick={() => console.log('Botón 2')}>
          <FileTrayOutline
              color={'#00000'} 
              title={'Open file'}
              height="50px"
              width="50px"
            /></button>
        <button onClick={() => console.log('Botón 2')}>
          <DownloadOutline
              color={'#00000'} 
              title={'Download to kml'}
              height="50px"
              width="50px"
            /></button>
        
      </div>
    </div>
  );
};

export default MapComponent;
