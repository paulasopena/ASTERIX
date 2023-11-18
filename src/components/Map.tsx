import { loadModules } from 'esri-loader';
import React, { useEffect } from 'react';

const MapComponent: React.FC = () => {
  useEffect(() => {
    loadModules(['esri/Map', 'esri/views/MapView']).then(([Map, MapView]) => {
      const map = new Map({ basemap: 'streets' });
      const view = new MapView({
        container: 'mapDiv',
        map,
        center: [-118, 34],
        zoom: 8,
      });
    });
  }, []);

  return <div id="mapDiv" style={{ height: '100vh' }} />;
};

export default MapComponent;
