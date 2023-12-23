import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
import loa1 from '../../statistics/loa1.png';
import loa2 from '../../statistics/loa2.png';
import loa3 from '../../statistics/loa3.png';
import loa4 from '../../statistics/loa4.png';

const LoAStatistics: React.FC = () => {
    const navigation = useNavigate();


    return (
        <div>
            <button onClick={() => navigation('/chooseStatistic')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>
            <div style={{flexDirection: 'column'}}>
                {loa1 && <img src={loa1} style={{ maxWidth: '50%', maxHeight: '50%' }} />}
                {loa2 && <img src={loa2} style={{ maxWidth: '50%', maxHeight: '50%' }} />}
                {loa3 && <img src={loa3} style={{ maxWidth: '50%', maxHeight: '50%' }} />}
                {loa4 && <img src={loa4} style={{ maxWidth: '50%', maxHeight: '50%' }} />}  
            </div>  

        </div>
    )
    
}



export default LoAStatistics;