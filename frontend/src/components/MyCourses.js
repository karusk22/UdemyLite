import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CourseCard from './CourseCard';

const MyCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;

      try {
        const response = await axios.get('/api/enrollments');
        setEnrollments(response.data);
      } catch (error) {
        console.error('Error fetching enrollments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4">Please log in to view your courses.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Courses
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : enrollments.length === 0 ? (
        <Typography>You have not enrolled in any courses yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {enrollments.map((enrollment) => (
            <Grid item xs={12} sm={6} md={4} key={enrollment.id}>
              <CourseCard course={enrollment.course} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyCourses;
