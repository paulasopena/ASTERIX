import React from "react";
import { useEffect, useState } from 'react';

const Home = () => {
  const [fileData, setFileData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/readFile');
        const data = await response.text();
        setFileData(data);
      } catch (error) {
        console.error('Error fetching file data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <p>This is the main Page</p>
      {fileData}
    </div>
  );
};

export default Home;