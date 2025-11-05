# TODO: Implement Profile Feature

- [x] Create Profile.js component in frontend/src/components/ to display user information
- [x] Add /profile route in App.js
- [x] Update Navbar.js to navigate to /profile when Profile menu item is clicked
- [x] Create UserController.java with /api/users/profile endpoint
- [x] Update Profile.js to fetch and display firstName and lastName from backend
- [x] Add backend endpoint for profile update
- [x] Add save method in UserService

# TODO: Add Unenroll Functionality

- [x] Add Unenroll button in CourseDetail.js for enrolled students
- [x] Implement handleUnenroll function to call DELETE /api/enrollments/{courseId}
- [x] Update UI state after unenrollment (clear lessons, update enrolled status)

# TODO: Add Take Lessons Feature

- [x] Create CourseLessons.js component to display lessons for enrolled students
- [x] Add /course/:id/lessons route in App.js
- [x] Add "Take Lessons" button in CourseDetail.js for enrolled students
- [x] Add youtubeUrl field to Lesson model
- [x] Update CourseLessons.js to display lesson titles and YouTube links
