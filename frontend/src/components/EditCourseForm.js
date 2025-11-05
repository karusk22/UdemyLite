import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Box, Paper
} from '@mui/material';
import axios from 'axios';

const EditCourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        setCourse({
          title: response.data.title,
          description: response.data.description,
          price: response.data.price
        });
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.put(`/api/courses/${id}`, course);
      navigate(`/course/${id}`);
    } catch (error) {
      console.error('Error updating course:', error);
      setError('Failed to update course. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Course
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={course.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={course.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={course.price}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button type="submit" variant="contained" color="primary">
              Update Course
            </Button>
            <Button variant="outlined" onClick={() => navigate(`/course/${id}`)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditCourseForm;
