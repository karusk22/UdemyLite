import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CourseDetail from './components/CourseDetail';
import CourseLessons from './components/CourseLessons';
import LessonPlayer from './components/LessonPlayer';
import CreateCourseForm from './components/CreateCourseForm';
import LessonForm from './components/LessonForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/lesson/:id" element={<LessonPlayer />} />
            <Route path="/create-course" element={<CreateCourseForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/course/:id/lessons" element={<CourseLessons />} />
            <Route path="/course/:courseId/lesson/new" element={<LessonForm />} />
            <Route path="/course/:courseId/lesson/:lessonId/edit" element={<LessonForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
