import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Box, Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VideoForm = () => {
  const { courseId, videoId } = useParams(); // videoId is optional for create
  const navigate = useNavigate();
  const { user, getRole } = useAuth();
  const [video, setVideo] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    orderIndex: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEdit = !!videoId;

  useEffect(() => {
    if (isEdit) {
      const fetchVideo = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/courses/${courseId}/videos/${videoId}`);
          setVideo(response.data);
        } catch (error) {
          console.error('Error fetching video:', error);
          setError('Failed to load video data.');
        } finally {
          setLoading(false);
        }
      };
      fetchVideo();
    }
  }, [courseId, videoId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isEdit) {
        await axios.put(`/api/courses/${courseId}/videos/${videoId}`, video);
        setSuccess('Video updated successfully!');
      } else {
        await axios.post(`/api/courses/${courseId}/videos`, video);
        setSuccess('Video created successfully!');
      }
      setTimeout(() => navigate(`/course/${courseId}/videos`), 2000);
    } catch (error) {
      console.error('Error saving video:', error);
      setError('Failed to save video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (getRole() !== 'INSTRUCTOR') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">Access denied. Only instructors can manage videos.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Edit Video' : 'Add New Video'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={video.title}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={video.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="YouTube URL"
          name="youtubeUrl"
          value={video.youtubeUrl}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Order Index"
          name="orderIndex"
          type="number"
          value={video.orderIndex}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update Video' : 'Add Video')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/course/${courseId}/videos`)}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
};

export default VideoForm;
