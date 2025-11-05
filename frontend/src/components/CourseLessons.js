import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, List, ListItem, ListItemText, Button,
  Box, Card, CardContent, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CourseLessons = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch course details
        const courseResponse = await axios.get(`/api/courses/${id}`);
        setCourse(courseResponse.data);

        // Fetch lessons (only if enrolled or instructor/admin)
        const lessonsResponse = await axios.get(`/api/courses/${id}/lessons`);
        setLessons(lessonsResponse.data);
      } catch (error) {
        console.error('Error fetching course or lessons:', error);
        setError('Could not load course lessons. You may not be enrolled.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourseAndLessons();
    } else {
      setLoading(false);
      setError('Please log in to view lessons.');
    }
  }, [id, user]);

  const handleLessonClick = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">Course not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {course.title} - Lessons
      </Typography>
      <Typography variant="body1" paragraph>
        {course.description}
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Course Lessons
        </Typography>
        <List>
          {lessons.map((lesson) => (
            <Card key={lesson.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {lesson.title}
                </Typography>
                {lesson.youtubeUrl && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      YouTube Link:
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      href={lesson.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mr: 2 }}
                    >
                      Watch on YouTube
                    </Button>
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleLessonClick(lesson.id)}
                  sx={{ mt: 2 }}
                >
                  View Lesson
                </Button>
              </CardContent>
            </Card>
          ))}
        </List>
        {lessons.length === 0 && (
          <Typography variant="body1" color="text.secondary">
            No lessons available for this course.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default CourseLessons;
