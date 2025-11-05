import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import CourseCard from './CourseCard';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Typography>Loading courses...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to UdemyLite
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Discover and learn from the best courses online
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      <Typography variant="h4" component="h2" gutterBottom>
        Available Courses
      </Typography>

      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item key={course.id} xs={12} sm={6} md={4}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>

      {filteredCourses.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
          No courses found matching your search.
        </Typography>
      )}
    </Container>
  );
};

export default Home;
