import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Box, Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LessonForm = () => {
  const { courseId, lessonId } = useParams(); // lessonId is optional for create
  const navigate = useNavigate();
  const { user, getRole } = useAuth();
  const [lesson, setLesson] = useState({
    title: '',
    content: '',
    videoUrl: '',
    youtubeUrl: '',
    orderIndex: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEdit = !!lessonId;

  useEffect(() => {
    if (isEdit) {
      const fetchLesson = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/courses/${courseId}/lessons/${lessonId}`);
          setLesson(response.data);
        } catch (error) {
          console.error('Error fetching lesson:', error);
          setError('Failed to load lesson data.');
        } finally {
          setLoading(false);
        }
      };
      fetchLesson();
    }
  }, [courseId, lessonId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLesson(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (isEdit) {
        await axios.put(`/api/courses/${courseId}/lessons/${lessonId}`, lesson);
        setSuccess('Lesson updated successfully!');
      } else {
        await axios.post(`/api/courses/${courseId}/lessons`, lesson);
        setSuccess('Lesson created successfully!');
      }
      setTimeout(() => navigate(`/course/${courseId}/lessons`), 2000);
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (getRole() !== 'INSTRUCTOR') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">Access denied. Only instructors can manage lessons.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Edit Lesson' : 'Create New Lesson'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={lesson.title}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Content"
          name="content"
          value={lesson.content}
          onChange={handleChange}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Video URL (optional)"
          name="videoUrl"
          value={lesson.videoUrl}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="YouTube URL (optional)"
          name="youtubeUrl"
          value={lesson.youtubeUrl}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Order Index"
          name="orderIndex"
          type="number"
          value={lesson.orderIndex}
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
          {loading ? 'Saving...' : (isEdit ? 'Update Lesson' : 'Create Lesson')}
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/course/${courseId}/lessons`)}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
};

export default LessonForm;
