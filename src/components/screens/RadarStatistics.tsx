import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getDistances, getFilteredAircrafts } from '../../asterix/file_manager';
import { AircraftFiltered, RouteCoordinates } from '../../domain/AircraftFiltered';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-annotation';

const RadarStatistics: React.FC = () => {
    const navigation = useNavigate();
    const [fileData, setFileData] = useState<AircraftFiltered[]>([]);
    const [distances, setDistances] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const filePathCSV = localStorage.getItem('nombreArchivo');
                if (filePathCSV) {
                    const filePath = filePathCSV.replace('.ast', '.csv');
                    const distances = await getDistances(filePath);
                    if (distances !== undefined) {
                        setFileData(distances);
                        setDistances(distances.filter((distance: any) => distance !== null));
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching file data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Renderizar el gráfico cuando distances se actualiza
        renderChart();
    }, [distances]);

    const renderChart = () => {
        const chartData = {
            labels: Array.from({ length: distances.length }, (_, index) => index + 1),
            datasets: [
                {
                    label: 'Distances',
                    data: distances,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };

        const ctx = document.getElementById('lineChart') as HTMLCanvasElement | null;
        if (ctx) {
            // Destruir el gráfico existente si hay uno
            const existingChart = Chart.getChart(ctx);
            if (existingChart) {
                existingChart.destroy();
            }

            // Renderizar el nuevo gráfico con el complemento de anotación
            new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: {
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                        },
                    },
                    plugins: {
                        annotation: {
                            annotations: [
                                {
                                    type: 'line',
                                    scaleID: 'y',
                                    value: 3,
                                    borderColor: 'red',
                                    borderWidth: 2,
                                },
                            ],
                        },
                    },
                },
            });
        }
    };

    return (
        <div>
            <button onClick={() => navigation('/chooseStatistic')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon />
            </button>

            {loading && <p>Loading...</p>}

            {!loading && <canvas id="lineChart" width={400} height={200}></canvas>}
            
        </div>
    );
};

export default RadarStatistics;
