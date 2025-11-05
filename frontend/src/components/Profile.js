import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Avatar, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [instructorEnrollments, setInstructorEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const [profileRes, studentRes, instructorRes] = await Promise.all([
          axios.get('/api/users/profile'),
          axios.get('/api/enrollments'),
          axios.get('/api/enrollments/instructor')
        ]);

        setProfile(profileRes.data);
        setEnrollments(studentRes.data);
        setInstructorEnrollments(instructorRes.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4">Please log in to view your profile.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
            {user.email.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account information
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Details
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {profile?.email || user.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Name:</strong> {profile?.firstName || ''} {profile?.lastName || ''}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Role:</strong> {profile?.role || user.role}
          </Typography>
        </Box>

        {profile?.role === 'INSTRUCTOR' && profile?.courses && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Courses
            </Typography>
            {profile.courses.length === 0 ? (
              <Typography>No courses created yet.</Typography>
            ) : (
              <List>
                {profile.courses.map((course) => (
                  <ListItem key={course.id} button onClick={() => navigate(`/course/${course.id}/edit`)}>
                    <ListItemText
                      primary={course.title}
                      secondary={`Price: ₹${course.price} - ${course.description}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {user.role === 'STUDENT' && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              My Enrollments
            </Typography>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : enrollments.length === 0 ? (
              <Typography>No enrollments found.</Typography>
            ) : (
              <List>
                {enrollments.map((enrollment) => (
                  <ListItem key={enrollment.id}>
                    <ListItemText
                      primary={enrollment.course?.title || 'Unknown Course'}
                      secondary={`Enrolled on: ${new Date(enrollment.enrollmentDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {user.role === 'INSTRUCTOR' && (
          <>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                My Enrollments
              </Typography>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : enrollments.length === 0 ? (
                <Typography>No enrollments found.</Typography>
              ) : (
                <List>
                  {enrollments.map((enrollment) => (
                    <ListItem key={enrollment.id}>
                      <ListItemText
                        primary={enrollment.course?.title || 'Unknown Course'}
                        secondary={`Enrolled on: ${new Date(enrollment.enrollmentDate).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Student Enrollments in My Courses
              </Typography>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : instructorEnrollments.length === 0 ? (
                <Typography>No student enrollments found.</Typography>
              ) : (
                <List>
                  {instructorEnrollments.map((enrollment) => (
                    <ListItem key={enrollment.id}>
                      <ListItemText
                        primary={`${enrollment.student?.firstName || 'Unknown'} ${enrollment.student?.lastName || 'Student'} - ${enrollment.course?.title || 'Unknown Course'}`}
                        secondary={`Enrolled on: ${new Date(enrollment.enrollmentDate).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
