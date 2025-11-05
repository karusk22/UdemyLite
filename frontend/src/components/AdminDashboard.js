import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent,
  List, ListItem, ListItemText, Button, Chip,
  Paper, Box
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { getRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getRole() === 'ADMIN') {
      fetchAdminData();
    }
  }, [getRole]);

  const fetchAdminData = async () => {
    try {
      const [usersResponse, coursesResponse, statsResponse] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/courses'),
        axios.get('/api/admin/stats')
      ]);
      setUsers(usersResponse.data);
      setCourses(coursesResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      // Refresh users list
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/courses/${courseId}`);
        // Refresh courses list
        const response = await axios.get('/api/admin/courses');
        setCourses(response.data);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  if (getRole() !== 'ADMIN') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" color="error">
          Access Denied: Admin privileges required
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return <Typography>Loading admin dashboard...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Courses
              </Typography>
              <Typography variant="h4">
                {stats.totalCourses || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Enrollments
              </Typography>
              <Typography variant="h4">
                {stats.totalEnrollments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${stats.totalRevenue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Users Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              User Management
            </Typography>
            <List>
              {users.slice(0, 10).map((user) => (
                <ListItem key={user.id} divider>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.email}
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'error' : user.role === 'INSTRUCTOR' ? 'primary' : 'default'}
                      size="small"
                    />
                    {user.role !== 'ADMIN' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleRoleChange(user.id, user.role === 'INSTRUCTOR' ? 'STUDENT' : 'INSTRUCTOR')}
                      >
                        {user.role === 'INSTRUCTOR' ? 'Demote' : 'Promote'}
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Courses Management */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Course Management
            </Typography>
            <List>
              {courses.slice(0, 10).map((course) => (
                <ListItem key={course.id} divider>
                  <ListItemText
                    primary={course.title}
                    secondary={`Instructor: ${course.instructor?.firstName} ${course.instructor?.lastName}`}
                  />
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
