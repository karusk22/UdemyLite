import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, List, ListItem, ListItemText, Button,
  Box, Card, CardContent, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CourseVideos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCourseAndVideos = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch course details
        const courseResponse = await axios.get(`/api/courses/${id}`);
        setCourse(courseResponse.data);

        // Fetch videos (only if enrolled or instructor/admin)
        const videosResponse = await axios.get(`/api/courses/${id}/videos`);
        setVideos(videosResponse.data);
      } catch (error) {
        console.error('Error fetching course or videos:', error);
        setError('Could not load course videos. You may not be enrolled.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourseAndVideos();
    } else {
      setLoading(false);
      setError('Please log in to view videos.');
    }
  }, [id, user]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVideo(null);
  };

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
        {course.title} - Videos
      </Typography>
      <Typography variant="body1" paragraph>
        {course.description}
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Course Videos
        </Typography>
        <List>
          {videos.map((video) => (
            <Card key={video.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {video.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {video.description}
                </Typography>
                {getRole() === 'INSTRUCTOR' && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate(`/course/${id}/video/${video.id}/edit`)}
                    sx={{ mt: 1 }}
                  >
                    Edit Video
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </List>
        {videos.length === 0 && (
          <Typography variant="body1" color="text.secondary">
            No videos available for this course.
          </Typography>
        )}
        {getRole() === 'INSTRUCTOR' && (
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/course/${id}/video/new`)}
            >
              Add New Video
            </Button>
          </Box>
        )}
      </Box>

      {/* Video Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedVideo?.title}
        </DialogTitle>
        <DialogContent>
          {selectedVideo && (
            <Box>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', mb: 2 }}>
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedVideo.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                />
              </Box>
              <Typography variant="body1">
                {selectedVideo.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseVideos;
