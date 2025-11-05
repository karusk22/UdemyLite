import React, { useState, useEffect, useCallback } from 'react'; // 1. Added useCallback
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box // <-- 1. Moved Box import here
  // 2. Removed unused 'Button'
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LessonPlayer = () => {
  const { lessonId } = useParams();
  // 3. Removed unused 'user' and 'getRole'
  const { loading: authLoading } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // 4. Wrapped fetchLesson in useCallback
  const fetchLesson = useCallback(async () => {
    setLoading(true);
    try {
      // We assume the URL is something like this, adjust if needed
      const response = await axios.get(`/api/lessons/${lessonId}`);
      setLesson(response.data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  }, [lessonId]); // The function depends on lessonId

  useEffect(() => {
    if (!authLoading) {
      fetchLesson();
    }
    // 5. Added 'fetchLesson' to the dependency array
  }, [lessonId, authLoading, fetchLesson]);

  if (authLoading || loading) {
    return <Typography>Loading lesson...</Typography>;
  }

  if (!lesson) {
    return <Typography>Lesson not found.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {lesson.title}
      </Typography>
      
      {/* Basic Video Player (if videoUrl exists) */}
      {lesson.videoUrl && (
        <Box sx={{ my: 2, position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
          <iframe
            src={lesson.videoUrl.replace("watch?v=", "embed/")} // Simple embed logic
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

      {/* YouTube Video Player (if youtubeUrl exists) */}
      {lesson.youtubeUrl && (
        <Box sx={{ my: 2, position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
          <iframe
            src={lesson.youtubeUrl.replace("watch?v=", "embed/")} // Convert YouTube watch URL to embed URL
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

      {/* Lesson Content */}
      <Typography variant="body1" paragraph>
        {lesson.content}
      </Typography>

      {/* You can add Next/Previous lesson buttons here */}
    </Container>
  );
};

// 2. Removed the bad import from the bottom of the file

export default LessonPlayer;

