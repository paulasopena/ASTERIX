import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import BarChartIcon from '@material-ui/icons/BarChart';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import './HomeStyle.css';
import gen1 from '../../statistics/GENERAL1.png';
import gen2 from '../../statistics/GENERAL2.png';
import gen3 from '../../statistics/GENERAL3.png';

const ChooseStatistic: React.FC = () => {
    const navigation = useNavigate();

    const useStyles = makeStyles((theme) => ({
        button: {
            margin: theme.spacing(1),
            width: '180px',
            height: '70px'
        },
    }));
    const classes = useStyles();

    return (
        <div>
            <button onClick={() => navigation('/map_p3')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>
            <div style = {{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    startIcon={<BarChartIcon />}
                    onClick={() => navigation('/radar')}
                    >
                    RADAR STATISTICS
                </Button>
                <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    startIcon={<BarChartIcon />}
                    onClick={() => navigation('/loa')}
                    >
                    LoA STATISTICS
                </Button>
                <Button
                    variant="contained"
                    color="default"
                    className={classes.button}
                    startIcon={<BarChartIcon />}
                    onClick={() => navigation('/stele')}
                    >
                    CONTRAILS STATISTICS
                </Button>
            </div>
            <h5 style={{ fontSize: '40px' }}>GENERAL STATISTICS:</h5>
            <div style={{flexDirection: 'column'}}>
                {gen1 && <img src={gen1} style={{ maxWidth: '50%', maxHeight: '50%' }} />} 
                {gen2 && <img src={gen2} style={{ maxWidth: '50%', maxHeight: '50%' }} />}   
                {gen3 && <img src={gen3} style={{ maxWidth: '50%', maxHeight: '50%' }} />} 
            </div>   
        </div>
    )
    
}



export default ChooseStatistic;