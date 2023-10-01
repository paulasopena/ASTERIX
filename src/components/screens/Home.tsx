import React from "react";
import { useEffect, useState } from 'react';
import { fetchBytes } from "../../asterix/file_manager";

const Home = () => {
  const [fileData, setFileData] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBytes()
        setFileData(data|| '');
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