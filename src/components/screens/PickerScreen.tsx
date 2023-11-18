import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { SERVER_URL } from '../../environments/environments';
import { useNavigate } from "react-router-dom";

const Picker = () => {
    const navigation = useNavigate();

    const onDrop = useCallback(async (acceptedFiles: any) => {
        const file = acceptedFiles[0]; 

        if (file) {
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
                    navigation('/map');
                } else {
                    console.error('Error al subir el archivo');
                }
            } catch (error) {
                console.error('Error de red:', error);
            }
        }
    }, []);

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
            <div {...getRootProps()} style={dropzoneStyle}>
                <input {...getInputProps()} />
                <p>Arrastra y suelta un documento aquí o haz clic para seleccionar un archivo</p>
            </div>
        </div>
    )
}


export default Picker;