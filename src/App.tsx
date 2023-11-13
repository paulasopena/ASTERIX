import React from 'react';
import { Route, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home from './components/screens/Home';
import Home2 from './components/screens/Home2';
import Picker from './components/screens/PickerScreen';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home2' element={<Home2/>}></Route>
        <Route path='/picker' element={<Picker/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
