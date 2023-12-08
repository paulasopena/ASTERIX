
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Splash.css';

const Splash = () => {
    const navigate = useNavigate();
    const seeMainPage = () => {
        navigate('/map');
    }
  return (
    <div className="main-container-general">
      <img alt="logo-round" className="logo" src="./icon.png" />
      <h1 className="heading-contact">asterix decoder & flight simulator</h1>
      <button className="microsoft-button" onClick={seeMainPage}>START</button>
    </div>
  );
};
export default Splash;