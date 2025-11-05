import React from 'react';
import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleViewCourse = () => {
    navigate(`/course/${course.id}`);
  };

  if (!course) {
    return null;
  }

  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {course.title || 'Untitled Course'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {course.description || 'No description available'}
        </Typography>
        <Typography variant="h6" color="primary">
          ₹{course.price || 0}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Instructor: {course.instructor?.firstName || 'Unknown'} {course.instructor?.lastName || ''}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary" onClick={handleViewCourse}>
          View Course
        </Button>
      </CardActions>
    </Card>
  );
};

export default CourseCard;
