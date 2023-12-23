import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import linegraph from '../../statistics/linegraph.png';
import radar1 from '../../statistics/radar1.png';
import radar2 from '../../statistics/radar2.png';
import radar3 from '../../statistics/radar3.png';

const RadarStatistics: React.FC = () => {
    const navigation = useNavigate();
    return (
        <div>
            <button onClick={() => navigation('/chooseStatistic')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>
            <div style={{flexDirection: 'column'}}>
                {linegraph && <img src={linegraph} style={{ maxWidth: '50%', maxHeight: '50%' }} />} 
                {radar1 && <img src={radar1} style={{ maxWidth: '50%', maxHeight: '50%' }} />}   
                {radar2 && <img src={radar2} style={{ maxWidth: '50%', maxHeight: '50%' }} />} 
                {radar3 && <img src={radar3} style={{ maxWidth: '50%', maxHeight: '50%' }} />}    
            </div>        
        </div>
    );
};

export default RadarStatistics;
