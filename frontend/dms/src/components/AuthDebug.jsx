
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

const AuthDebug = () => {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [apiTest, setApiTest] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    // Read token and role from localStorage
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    setToken(storedToken || 'Not found');
    setRole(storedRole || 'Not found');
  }, []);

  const testApi = async () => {
    setApiTest({ status: 'loading', message: 'Testing API connection...' });
    
    try {
      const response = await fetch('http://localhost:8080/api/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiTest({ 
          status: 'success', 
          message: `API connection successful! Received ${data.length} items.` 
        });
      } else {
        setApiTest({ 
          status: 'error', 
          message: `API connection failed with status: ${response.status} ${response.statusText}` 
        });
      }
    } catch (error) {
      setApiTest({ 
        status: 'error', 
        message: `API connection error: ${error.message}` 
      });
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>Authentication Debug Info</Typography>
      
      <Box mb={2}>
        <Typography variant="subtitle1">Token:</Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            p: 1, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            wordBreak: 'break-all',
            color: token === 'Not found' ? 'error.main' : 'text.primary'
          }}
        >
          {token}
        </Typography>
      </Box>
      
      <Box mb={2}>
        <Typography variant="subtitle1">Role:</Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            p: 1, 
            bgcolor: 'grey.100', 
            borderRadius: 1,
            color: role === 'Not found' ? 'error.main' : (role === 'DOCTOR' ? 'success.main' : 'warning.main')
          }}
        >
          {role}
        </Typography>
      </Box>
      
      <Box mb={2}>
        <Button 
          variant="contained" 
          onClick={testApi}
          disabled={apiTest.status === 'loading'}
        >
          Test API Connection
        </Button>
      </Box>
      
      {apiTest.status !== 'idle' && (
        <Box mb={2}>
          <Typography variant="subtitle1">API Test Result:</Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              p: 1, 
              bgcolor: 'grey.100', 
              borderRadius: 1,
              color: apiTest.status === 'success' ? 'success.main' : (apiTest.status === 'loading' ? 'info.main' : 'error.main')
            }}
          >
            {apiTest.message}
          </Typography>
        </Box>
      )}
      
      <Box mt={3}>
        <Typography variant="h6">Debugging Steps:</Typography>
        <ol>
          <li>Make sure you're logged in as a doctor</li>
          <li>Verify the token and role are present</li>
          <li>Test API connection to ensure proper authentication</li>
          <li>If everything looks correct but still fails, you may need to check CORS settings on the backend</li>
        </ol>
      </Box>
    </Paper>
  );
};

export default AuthDebug;