// import { useState } from 'react'
// import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
// import "../node_modules/bootstrap/dist/js/bootstrap.min.js"
//
// import './App.css'
// import Home from "./Home.jsx";
// import StudentsView from "./components/student/StudentsView.jsx";
// import NavBar from "./components/common/NavBar.jsx";
// import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import AddStudent from "./components/student/AddStudent.jsx";
// import EditStudent from "./components/student/EditStudent.jsx";
// import StudentProfile from "./components/student/StudentProfile.jsx";
//
// function App() {
//
//   return(
//         <main className="container mt-5">
//             <Router>
//                 <NavBar/>
//                 <Routes>
//                     <Route
//                         exact
//                         path="/"
//                         element={<Home/>}></Route>
//                     <Route
//                         exact
//                         path="/view-students"
//                         element={<StudentsView/>}></Route>
//                     <Route
//                         exact
//                         path="/add-students"
//                         element={<AddStudent/>}></Route>
//                     <Route
//                         exact
//                         path="/edit-student/:id"
//                         element={<EditStudent/>}></Route>
//                     <Route
//                         exact
//                         path="/student-profile/:id"
//                         element={<StudentProfile/>}></Route>
//
//                 </Routes>
//             </Router>
//
//
//         </main>
//     );
// }
//
// export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard.jsx";
import Students from "./pages/admin/Students.jsx";
import Professors from "./pages/admin/Professors.jsx";
import Courses from "./pages/admin/Courses.jsx";
import Lessons from "./pages/admin/Lessons.jsx";
import Departments from "./pages/admin/Departments.jsx";
import Categories from "./pages/admin/Categories.jsx";
import Assignments from "./pages/admin/Assignments.jsx";
import Quizzes from "./pages/admin/Quizzes.jsx";
import Enrollments from "./pages/admin/Enrollments.jsx";
import Reports from "./pages/admin/Reports.jsx";
import Settings from "./pages/admin/Settings.jsx";
import Submissions from "./pages/admin/Submissions.jsx";
import Questions from "./pages/admin/Questions.jsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* Redirect / to /admin/dashboard */}
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Admin Layout */}
                <Route path="/admin" element={<Layout />}>
                    <Route path="dashboard"   element={<Dashboard />} />
                    <Route path="students"    element={<Students />} />
                    <Route path="professors"  element={<Professors />} />
                    <Route path="courses"     element={<Courses />} />
                    <Route path="lessons"     element={<Lessons />} />
                    <Route path="departments" element={<Departments />} />
                    <Route path="categories"  element={<Categories />} />
                    <Route path="assignments" element={<Assignments />} />
                    <Route path="submissions" element={<Submissions />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="quizzes"     element={<Quizzes />} />
                    <Route path="enrollments" element={<Enrollments />} />
                    <Route path="reports"     element={<Reports />} />
                    <Route path="settings"    element={<Settings />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;