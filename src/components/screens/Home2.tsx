import React from "react";
import { useEffect, useState } from 'react';
import { fetchBytes, getAircrafts } from "../../asterix/file_manager";
import { Message } from "../../domain/Message";
import Papa from 'papaparse';
import { useTable, usePagination, Column } from 'react-table';
import { useNavigate } from "react-router-dom";
import './HomeStyle.css';
import { JSX } from "react/jsx-runtime";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const Home2 = () => {
  const [fileData, setFileData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const filePathCSV = localStorage.getItem('nombreArchivo');
        if (filePathCSV) {
          const filePath = filePathCSV.replace('.ast', '.csv');

          const response = await fetch(filePath);
          const blob = await response.blob();
        
          const fileReader = new FileReader();
          fileReader.onloadend = () => {
            const csvString = fileReader.result as string;
            Papa.parse(csvString, {
              header: true,
              dynamicTyping: false,
              complete: (result) => {
                setFileData(result.data);
                setIsLoading(false);
              },
            });
          };
      
          // Read the file as text
          fileReader.readAsText(blob);

        }
        
        
      } catch (error) {
        console.error('Error fetching file data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = React.useMemo(() => {
    if (fileData.length === 0) return [];
    return Object.keys(fileData[0]).map(column => ({
      Header: column,
      accessor: column,
    }));
    
  }, [fileData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: fileData,
      initialState: { pageIndex: 0, pageSize: 10 } as any,
    },
    usePagination
  ) as any;


  return (
    <div>
      <button onClick={() => navigation('/map')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
        <ArrowBackIcon />
      </button>
      {isLoading ? (
        <p>Cargando ...</p>
      ) : (
      <table {...getTableProps()} style={{ border: 'solid 0px white' }}>
        <thead>
          {headerGroups.map((headerGroup: { getHeaderGroupProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLTableRowElement> & React.HTMLAttributes<HTMLTableRowElement>; headers: any[]; }) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} style={{ border: 'solid 0px white' }}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
        {page.map((row: { getRowProps: () => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLTableRowElement> & React.HTMLAttributes<HTMLTableRowElement>; cells: any[]; }) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray', color: 'black'}}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      )}
      <div>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} style={{ color: 'white' }}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage} style={{ color: 'white' }}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage} style={{ color: 'white' }}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} style={{ color: 'white' }}>
          {'>>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '50px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Home2;

