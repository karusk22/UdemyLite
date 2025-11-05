import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, List, ListItem, ListItemText, Button,
  Box, Card, CardContent, CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;

  // Extract video ID from various YouTube URL formats
  let videoId = null;

  // Standard watch URL
  const watchMatch = url.match(/[?&]v=([^#\&\?]*)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }

  // Shortened youtu.be URL
  const shortMatch = url.match(/youtu\.be\/([^#\&\?]*)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }

  // Embed URL already
  const embedMatch = url.match(/embed\/([^#\&\?]*)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }

  // If video ID found, return embed URL
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return null;
};

const CourseLessons = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isCourseOwner = getRole() === 'INSTRUCTOR' && course?.instructor?.email === user?.email;

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
                  <Box sx={{ mt: 2, position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                    <iframe
                      src={getYouTubeEmbedUrl(lesson.youtubeUrl)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
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

                {/* <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleLessonClick(lesson.id)}
                  sx={{ mt: 2, mr: 1 }}
                >
                  View Lesson
                </Button> */}
                {isCourseOwner && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate(`/course/${id}/lesson/${lesson.id}/edit`)}
                    sx={{ mt: 2 }}
                  >
                    Edit Lesson
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </List>
        {lessons.length === 0 && (
          <Typography variant="body1" color="text.secondary">
            No lessons available for this course.
          </Typography>
        )}
        {isCourseOwner && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/course/${id}/lesson/new`)}
            >
              Add New Lesson
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CourseLessons;
