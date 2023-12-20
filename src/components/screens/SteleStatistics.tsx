import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const SteleStatistics: React.FC = () => {
    const navigation = useNavigate();

    


    return (
        <div>
            <button onClick={() => navigation('/chooseStatistic')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>

        </div>
    )
    
}



export default SteleStatistics;