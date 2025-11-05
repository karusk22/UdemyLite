import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Paper, Button, Grid,
  Card, CardContent, CardActions, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert,
  Accordion, AccordionSummary, AccordionDetails,
  IconButton, Chip, Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  ExpandMore as ExpandMoreIcon,
  VideoLibrary as VideoIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CourseManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRole, getUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog states
  const [lessonDialog, setLessonDialog] = useState({ open: false, lesson: null });
  const [videoDialog, setVideoDialog] = useState({ open: false, lessonId: null, video: null });

  // Form states
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', orderIndex: 0, youtubeUrl: '' });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', youtubeUrl: '', orderIndex: 0 });

  useEffect(() => {
    if (getRole() !== 'INSTRUCTOR' && getRole() !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, lessonsRes, videosRes] = await Promise.all([
        axios.get(`/api/courses/${id}`),
        axios.get(`/api/courses/${id}/lessons`),
        axios.get(`/api/courses/${id}/videos`)
      ]);

      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setVideos(videosRes.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      if (lessonDialog.lesson) {
        await axios.put(`/api/courses/${id}/lessons/${lessonDialog.lesson.id}`, lessonForm);
      } else {
        await axios.post(`/api/courses/${id}/lessons`, lessonForm);
      }
      setLessonDialog({ open: false, lesson: null });
      setLessonForm({ title: '', description: '', orderIndex: 0, youtubeUrl: '' });
      fetchCourseData();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Failed to save lesson');
    }
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (videoDialog.video) {
        await axios.put(`/api/courses/${id}/videos/${videoDialog.video.id}`, videoForm);
      } else {
        await axios.post(`/api/courses/${id}/videos`, videoForm);
      }
      setVideoDialog({ open: false, lessonId: null, video: null });
      setVideoForm({ title: '', description: '', youtubeUrl: '', orderIndex: 0 });
      fetchCourseData();
    } catch (error) {
      console.error('Error saving video:', error);
      setError('Failed to save video');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await axios.delete(`/api/courses/${id}/lessons/${lessonId}`);
        fetchCourseData();
      } catch (error) {
        console.error('Error deleting lesson:', error);
        setError('Failed to delete lesson');
      }
    }
  };

  const deleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await axios.delete(`/api/courses/${id}/videos/${videoId}`);
        fetchCourseData();
      } catch (error) {
        console.error('Error deleting video:', error);
        setError('Failed to delete video');
      }
    }
  };

  const deleteCourse = async () => {
    try {
      await axios.delete(`/api/courses/${id}`);
      navigate('/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      setError('Failed to delete course');
    }
  };

  const openLessonDialog = (lesson = null) => {
    if (lesson) {
      setLessonForm({
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
        youtubeUrl: lesson.youtubeUrl || ''
      });
    } else {
      setLessonForm({ title: '', description: '', orderIndex: lessons.length, youtubeUrl: '' });
    }
    setLessonDialog({ open: true, lesson });
  };

  const openVideoDialog = (lessonId, video = null) => {
    if (video) {
      setVideoForm({
        title: video.title,
        description: video.description,
        youtubeUrl: video.youtubeUrl,
        orderIndex: video.orderIndex
      });
    } else {
      const lessonVideos = videos.filter(v => v.lesson && v.lesson.id === lessonId);
      setVideoForm({ title: '', description: '', youtubeUrl: '', orderIndex: lessonVideos.length });
    }
    setVideoDialog({ open: true, lessonId, video });
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading course management...</Typography>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Course not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manage Course: {course.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organize lessons and videos for your students
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openLessonDialog()}
          sx={{ mr: 2 }}
        >
          Add Lesson
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/course/${id}`)}
          sx={{ mr: 2 }}
        >
          View Course
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this entire course? This action cannot be undone.')) {
              deleteCourse();
            }
          }}
        >
          Delete Course
        </Button>
      </Box>

      <Grid container spacing={3}>
        {lessons.map((lesson) => {
          const lessonVideos = videos.filter(v => v.lesson && v.lesson.id === lesson.id);

          return (
            <Grid item xs={12} key={lesson.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2">
                        Lesson {lesson.orderIndex + 1}: {lesson.title}
                      </Typography>
                      {lesson.description && (
                        <Typography variant="body2" color="text.secondary">
                          {lesson.description}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton onClick={() => openLessonDialog(lesson)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => deleteLesson(lesson.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {lesson.youtubeUrl && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Lesson Video:
                      </Typography>
                      <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                          src={getYouTubeEmbedUrl(lesson.youtubeUrl)}
                          title={lesson.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '8px'
                          }}
                          allowFullScreen
                        />
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Additional Videos ({lessonVideos.length}):
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {lessonVideos.map((video) => (
                        <Chip
                          key={video.id}
                          label={video.title}
                          icon={<VideoIcon />}
                          onClick={() => openVideoDialog(lesson.id, video)}
                          onDelete={() => deleteVideo(video.id)}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => openVideoDialog(lesson.id)}
                  >
                    Add Video
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog.open} onClose={() => setLessonDialog({ open: false, lesson: null })} maxWidth="md" fullWidth>
        <form onSubmit={handleLessonSubmit}>
          <DialogTitle>
            {lessonDialog.lesson ? 'Edit Lesson' : 'Add New Lesson'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Lesson Title"
              value={lessonForm.title}
              onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={lessonForm.description}
              onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={lessonForm.orderIndex}
              onChange={(e) => setLessonForm(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="YouTube URL (optional)"
              value={lessonForm.youtubeUrl}
              onChange={(e) => setLessonForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              margin="normal"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLessonDialog({ open: false, lesson: null })}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {lessonDialog.lesson ? 'Update' : 'Add'} Lesson
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Video Dialog */}
      <Dialog open={videoDialog.open} onClose={() => setVideoDialog({ open: false, lessonId: null, video: null })} maxWidth="md" fullWidth>
        <form onSubmit={handleVideoSubmit}>
          <DialogTitle>
            {videoDialog.video ? 'Edit Video' : 'Add New Video'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Video Title"
              value={videoForm.title}
              onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={videoForm.description}
              onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="YouTube URL"
              value={videoForm.youtubeUrl}
              onChange={(e) => setVideoForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              margin="normal"
              required
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={videoForm.orderIndex}
              onChange={(e) => setVideoForm(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
              margin="normal"
              inputProps={{ min: 0 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVideoDialog({ open: false, lessonId: null, video: null })}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {videoDialog.video ? 'Update' : 'Add'} Video
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default CourseManagement;
