import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import {
    GraduationCap, BookOpen, Users,
    Building2, UserCheck, ClipboardList,
    HelpCircle, BookMarked
} from "lucide-react";

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(45,90,39,0.10)",
        border: "1px solid rgba(45,90,39,0.06)",
        position: "relative",
        overflow: "hidden",
        borderBottom: `3px solid ${color}`
    }}>
        <div style={{
            position: "absolute",
            top: "16px", right: "16px",
            fontSize: "28px", opacity: 0.15
        }}>
            {icon}
        </div>
        <div style={{
            fontSize: "11px",
            color: "#8aaa85",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.5px"
        }}>
            {title}
        </div>
        <div style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#1a2e18",
            margin: "8px 0 4px",
            fontFamily: "Georgia, serif"
        }}>
            {value ?? "..."}
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/stats");
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
            color: "#4a6645",
            fontSize: "16px"
        }}>
            Loading dashboard...
        </div>
    );

    const statCards = [
        {
            title: "Total Students",
            value: stats?.totalStudents,
            icon: <GraduationCap size={28}/>,
            color: "#3d7a35"
        },
        {
            title: "Total Professors",
            value: stats?.totalProfessors,
            icon: <Users size={28}/>,
            color: "#4a7fb5"
        },
        {
            title: "Total Courses",
            value: stats?.totalCourses,
            icon: <BookOpen size={28}/>,
            color: "#e8824a"
        },
        {
            title: "Total Categories",
            value: stats?.totalCategories,
            icon: <BookOpen size={28}/>,
            color: "#6c5ce7"
        },

        {
            title: "Departments",
            value: stats?.totalDepartments,
            icon: <Building2 size={28}/>,
            color: "#9b59b6"
        },
        {
            title: "Active Enrollments",
            value: stats?.activeEnrollments,
            icon: <UserCheck size={28}/>,
            color: "#2ecc71"
        },
        {
            title: "Completed Enrollments",
            value: stats?.completedEnrollments,
            icon: <UserCheck size={28}/>,
            color: "#3d7a35"
        },
        {
            title: "Total Assignments",
            value: stats?.totalAssignments,
            icon: <ClipboardList size={28}/>,
            color: "#e74c3c"
        },

        {   title: "Total Questions",
            value: stats?.totalQuestions,
            icon: <HelpCircle size={28}/>,
            color: "#e74c3c"

        },
        {
            title: "Total Quizzes",
            value: stats?.totalQuizzes,
            icon: <HelpCircle size={28}/>,
            color: "#d4a017"
        },
        {
            title: "Total Lessons",
            value: stats?.totalLessons,
            icon: <BookMarked size={28}/>,
            color: "#4a7fb5"
        },
        {
            title: "Published Courses",
            value: stats?.publishedCourses,
            icon: <BookOpen size={28}/>,
            color: "#2ecc71"
        },
        {
            title: "Draft Courses",
            value: stats?.draftCourses,
            icon: <BookOpen size={28}/>,
            color: "#e8824a"
        },
        {
            title: "Total Enrollments",
            value: stats?.totalEnrollments,
            icon: <UserCheck size={28}/>,
            color: "#9b59b6"
        },
    ];

    return (
        <div>
            {/* Page Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
            }}>
                <div>
                    <h1 style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#1a2e18",
                        fontFamily: "Georgia, serif",
                        margin: 0
                    }}>
                        Dashboard Overview
                    </h1>
                    <p style={{
                        fontSize: "13px",
                        color: "#8aaa85",
                        margin: "4px 0 0"
                    }}>
                        Welcome back! Here's what's happening today.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "24px"
            }}>
                {statCards.map((card, index) => (
                    <StatCard key={index} {...card}/>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;