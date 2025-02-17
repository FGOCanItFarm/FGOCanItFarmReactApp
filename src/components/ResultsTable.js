import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

function ResultsTable() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    axios.get('/api/data')
      .then(response => {
        setResults(response.data.results);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tokens</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Log</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.tokens.join(', ')}</TableCell>
              <TableCell>{result.status}</TableCell>
              <TableCell>
                <details>
                  <summary>View Log</summary>
                  <pre>{result.log}</pre>
                </details>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ResultsTable;