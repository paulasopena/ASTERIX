import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { SERVER_URL } from '../../environments/environments';
import { fetchBytes } from "../../asterix/file_manager";
//import CircularProgress from '@mui/material/CircularProgress';

interface PickerProps {
    onClose: () => void;
  }
  
const Picker: React.FC<PickerProps> = ({ onClose }) => {

    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: any) => {
        const file = acceptedFiles[0]; 

        if (file) {
            setIsUploading(true);
            const fileName = file.name;
            localStorage.setItem('nombreArchivo', fileName);
            console.log('Nombre del archivo guardado en localStorage:', fileName);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(SERVER_URL + '/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    console.log('Archivo subido con éxito');
                    const file = localStorage.getItem('nombreArchivo');
                    if (file) {
                        await fetchBytes(file).then(() => {
                            onClose();
                            setIsUploading(false); 
                        });
                    }
                } else {
                    console.error('Error al subir el archivo');
                    setIsUploading(false);
                }
            } catch (error) {
                console.error('Error de red:', error);
                setIsUploading(false);
            }
        }
    }, [onClose]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const dropzoneStyle: React.CSSProperties = {
        border: '2px dashed #cccccc',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        cursor: 'pointer',
    };

    return (
        <div>
            {isUploading ? (
            <p>Cargando ...</p>
            ) : (
            <div {...getRootProps()} style={dropzoneStyle}>
                <input {...getInputProps()} />
                <p>Arrastra y suelta un documento aquí o haz clic para seleccionar un archivo</p>
            </div>
            )}
        </div>
    )
}


export default Picker;