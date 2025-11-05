import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Grid, Card, CardContent,
  List, ListItem, ListItemText, Chip, Box
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getRole, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';

    // Handle different YouTube URL formats
    let videoId = '';

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^#\&\?]*)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }

    // Format: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^#\&\?]*)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    // Format: https://www.youtube.com/embed/VIDEO_ID (already embed)
    const embedMatch = url.match(/youtube\.com\/embed\/([^#\&\?]*)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }

    // If we found a video ID, return the embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // If no video ID found, return empty string
    return '';
  };

  // --- THIS FUNCTION IS NOW FIXED ---
  const fetchCourseDetailsAndLessons = useCallback(async () => {
    setLoading(true); 
    setError('');
    try {
      // Step 1: Fetch the main course details. This is public and should always work.
      const courseResponse = await axios.get(`/api/courses/${id}`);
      setCourse(courseResponse.data); // Set the course immediately

      // Step 2: Now, in a *separate* try/catch, attempt to fetch the protected lessons.
      try {
        const lessonsResponse = await axios.get(`/api/courses/${id}/lessons`);
        setLessons(lessonsResponse.data); // If successful, set lessons
      } catch (lessonError) {
        // This is the "Student not enrolled" error. This is OK.
        console.warn('Could not fetch lessons (user may not be enrolled):', lessonError.message);
        setLessons([]); // Set lessons to an empty array so the page can render
      }

    } catch (courseError) {
      // This will only catch errors from the *main* course fetch
      console.error('Error fetching main course details:', courseError);
      setError('Could not load course details.');
    } finally {
      setLoading(false);
    }
  }, [id]); // This function only re-runs if 'id' changes

  const checkEnrollment = useCallback(async () => {
    try {
      const response = await axios.get(`/api/enrollments/check/${id}`);
      setEnrolled(response.data.enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  }, [id]); 
  
  const handleEnroll = useCallback(async () => {
    setError('');
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await axios.post(`/api/enrollments/${id}`);
      setEnrolled(true);
      // After enrolling, fetch the lessons again so they appear
      const lessonsResponse = await axios.get(`/api/courses/${id}/lessons`);
      setLessons(lessonsResponse.data);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setError('Failed to enroll. Please try again.');
    }
  }, [id, user, navigate]);

  const handleUnenroll = useCallback(async () => {
    setError('');
    try {
      await axios.delete(`/api/enrollments/${id}`);
      setEnrolled(false);
      // After unenrolling, clear the lessons
      setLessons([]);
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      setError('Failed to unenroll. Please try again.');
    }
  }, [id]);

  const handleLessonClick = useCallback(() => {
    setError('');
    if (enrolled || getRole() === 'INSTRUCTOR' || getRole() === 'ADMIN') {
      navigate(`/course/${id}/lessons`);
    } else {
      setError('You must be enrolled in this course to view videos.');
    }
  }, [enrolled, getRole, navigate, id]);

  useEffect(() => {
    if (authLoading) {
      return; 
    }
    // Renamed the function call
    fetchCourseDetailsAndLessons(); 

    if (user) {
      checkEnrollment();
    }
  }, [id, user, authLoading, fetchCourseDetailsAndLessons, checkEnrollment]); // Added new function to dependencies

  if (authLoading || loading) {
     return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading course details...</Typography>
      </Container>
    );
  }

  if (!course) {
     return (
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography>Course not found.</Typography>
      </Container>
    );
  }

  const canAccessLessons = enrolled || getRole() === 'INSTRUCTOR' || getRole() === 'ADMIN';
  const canManageCourse = getRole() === 'INSTRUCTOR' && course.instructor?.email === user?.email;
  console.log(canManageCourse);
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom>
            {course.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {course.description}
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Instructor: {course.instructor?.firstName} {course.instructor?.lastName}
          </Typography>

          {/* YouTube Video Player (if youtubeUrl exists and user is enrolled) */}
          {course.youtubeUrl && enrolled && (
            <Box sx={{ my: 2, position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
              <iframe
                src={getYouTubeEmbedUrl(course.youtubeUrl)} // Use the proper embed URL conversion
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={course.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%'
                }}
              />
            </Box>
          )}

          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
            Course Content
          </Typography>
          <List>
            {lessons.map((lesson) => (
              <ListItem
                key={lesson.id}
                button
                onClick={() => handleLessonClick(lesson.id)}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: canAccessLessons ? '#f5f5f5' : 'inherit',
                    cursor: canAccessLessons ? 'pointer' : 'not-allowed'
                  }
                }}
              >
                <ListItemText
                  primary={lesson.title}
                  secondary={`Lesson ${lesson.orderIndex}`}
                />
                {!canAccessLessons && (
                  <Chip label="Enroll to Access" color="secondary" size="small" />
                )}
              </ListItem>
            ))}
            {/* Show a message if lessons are hidden */}
            {lessons.length === 0 && !canAccessLessons && (
              <Typography>Enroll to see the list of lessons.</Typography>
            )}
          </List>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary" gutterBottom>
                ${course.price}
              </Typography>
              {error && (
                <Typography color="error" gutterBottom sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}
              {!enrolled && user && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleEnroll}
                  sx={{ mb: 2 }}
                >
                  Enroll Now
                </Button>
              )}
              {!user && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleEnroll}
                  sx={{ mb: 2 }}
                >
                  Enroll Now
                </Button>
              )}
              {enrolled && (
                <>
                  <Chip label="Enrolled" color="success" sx={{ mb: 2 }} />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/course/${id}/lessons`)}
                    sx={{ mb: 2 }}
                  >
                    Take Lessons
                  </Button>
                  {/* <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/course/${id}/videos`)}
                    sx={{ mb: 2 }}
                  >
                    Watch Videos
                  </Button> */}
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={handleUnenroll}
                    sx={{ mb: 2 }}
                  >
                    Unenroll
                  </Button>
                </>
              )}
              {canManageCourse && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/course/${id}/manage`)}
                    sx={{ mb: 2 }}
                  >
                    Manage Course
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/course/${id}/edit`)}
                    sx={{ mb: 2 }}
                  >
                    Edit Details
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CourseDetail;

