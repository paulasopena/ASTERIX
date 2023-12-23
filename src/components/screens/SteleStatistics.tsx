import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import comp1 from '../../statistics/comp1.png';
import comp2 from '../../statistics/comp2.png';

const SteleStatistics: React.FC = () => {
    const navigation = useNavigate();

    


    return (
        <div>
            <button onClick={() => navigation('/chooseStatistic')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>
            <div style={{flexDirection: 'column'}}>
                {comp1 && <img src={comp1} style={{ maxWidth: '50%', maxHeight: '50%' }} />} 
                {comp2 && <img src={comp2} style={{ maxWidth: '50%', maxHeight: '50%' }} />}     
            </div> 

        </div>
    )
    
}



export default SteleStatistics;