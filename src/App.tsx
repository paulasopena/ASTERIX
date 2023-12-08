import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home2 from './components/screens/Home2';
import Picker from './components/screens/PickerScreen';
import MapComponent from './components/screens/Map';
import Splash from './components/screens/SplashScreen';

function App() {
  useEffect(() => {
    localStorage.removeItem('nombreArchivo');
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Splash />} />
        <Route path='/map' element={<MapComponent />} />
        <Route path='/home2' element={<Home2/>}></Route>
        <Route path='/picker' element={<Picker onClose={function (): void {
          throw new Error('Function not implemented.');
        } }/>}></Route>
        <Route path='/map' element={<MapComponent/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
