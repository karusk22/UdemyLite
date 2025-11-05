import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Avatar, CircularProgress, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/users/profile');
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      await axios.put('/api/users/profile', profileData);
      setSuccess('Profile updated successfully');
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
      setSuccess(null);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4">Please log in to view your profile.</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            {profileData?.firstName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account information
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <TextField
            fullWidth
            label="First Name"
            value={profileData?.firstName || ''}
            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            value={profileData?.lastName || ''}
            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            value={profileData?.email || ''}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            sx={{ mb: 2 }}
            disabled
          />
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Role:</strong> {profileData?.role}
          </Typography>
          <Button variant="contained" onClick={handleUpdate}>
            Update Profile
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
