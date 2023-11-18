import React from "react";
import { useEffect, useState } from 'react';
import { fetchBytes } from "../../asterix/file_manager";
import { Message } from "../../domain/Message";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [fileData, setFileData] = useState<Message[]>([]);
  const navigation = useNavigate();
  const navigateToTrial = async () => {
      navigation('/home2');
  }
  const navigateToPicker = async () => {
    navigation('/picker');
  }
  const navigateToMap= async () => {
    navigation('/map');
  } 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fileName = localStorage.getItem('nombreArchivo');
        const data = await fetchBytes(fileName ?? '');
        if (data != undefined) {
          const parsedData = JSON.parse(data);
          setFileData(parsedData);
        }        
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <button onClick={navigateToTrial}>TABLE</button>
      <button onClick={navigateToPicker}>PICK DOCUMENT</button>
      <button onClick={navigateToMap}>MAP</button>
      

    </div>
  );
};

export default Home;