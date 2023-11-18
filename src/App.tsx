import React from 'react';
import { Route, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home2 from './components/screens/Home2';
import Picker from './components/screens/PickerScreen';
import MapComponent from './components/screens/Map';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<MapComponent />} />
        <Route path='/home2' element={<Home2/>}></Route>
        <Route path='/picker' element={<Picker/>}></Route>
        <Route path='/map' element={<MapComponent/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
