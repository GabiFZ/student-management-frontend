import { NavLink } from "react-router-dom";
import {
    LayoutDashboard, GraduationCap, BookOpen, Users,
    Building2, Tag, BookMarked, ClipboardList,
    HelpCircle, UserCheck, BarChart3, Settings, Leaf, FileText
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        icon: <LayoutDashboard size={18}/>,
        path: "/admin/dashboard"
    },
    {
        label: "Students",
        icon: <GraduationCap size={18}/>,
        path: "/admin/students"
    },
    {
        label: "Professors",
        icon: <Users size={18}/>,
        path: "/admin/professors"
    },
    {
        label: "Courses",
        icon: <BookOpen size={18}/>,
        path: "/admin/courses"
    },
    {
        label: "Lessons",
        icon: <BookMarked size={18}/>,
        path: "/admin/lessons"
    },
    {
        label: "Departments",
        icon: <Building2 size={18}/>,
        path: "/admin/departments"
    },
    {
        label: "Categories",
        icon: <Tag size={18}/>,
        path: "/admin/categories"
    },
    {
        label: "Assignments",
        icon: <ClipboardList size={18}/>,
        path: "/admin/assignments"
    },

    {
        label: "Submissions",
        icon: <FileText size={18}/>,
        path: "/admin/submissions"
    },

    {   label: "Questions",
        icon:  <HelpCircle size={18}/>,
        path: "/admin/questions"

    },

    {
        label: "Quizzes",
        icon: <HelpCircle size={18}/>,
        path: "/admin/quizzes"
    },
    {
        label: "Enrollments",
        icon: <UserCheck size={18}/>,
        path: "/admin/enrollments"
    },
    {
        label: "Reports",
        icon: <BarChart3 size={18}/>,
        path: "/admin/reports"
    },
    {
        label: "Settings",
        icon: <Settings size={18}/>,
        path: "/admin/settings"
    },
];

const Sidebar = () => {
    return (
        <aside style={{
            width: "220px",
            minHeight: "100vh",
            background: "linear-gradient(180deg, #1a3a1a 0%, #2d5a27 100%)",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            boxShadow: "3px 0 20px rgba(0,0,0,0.2)"
        }}>

            {/* LOGO */}
            <div style={{
                padding: "20px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "10px"
            }}>
                <div style={{
                    width: "36px", height: "36px",
                    background: "#5a9e50",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Leaf size={18} color="white"/>
                </div>
                <div>
                    <div style={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: "14px",
                        fontFamily: "Georgia, serif"
                    }}>
                        EduPlatform
                    </div>
                    <div style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "10px"
                    }}>
                        Management System
                    </div>
                </div>
            </div>

            {/* NAV ITEMS */}
            <nav style={{ padding: "12px 0", flex: 1, overflowY: "auto" }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 18px",
                            color: isActive ? "white" : "rgba(255,255,255,0.7)",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: isActive ? 600 : 400,
                            borderLeft: isActive
                                ? "3px solid #a8d5a2"
                                : "3px solid transparent",
                            background: isActive
                                ? "rgba(255,255,255,0.12)"
                                : "transparent",
                            transition: "all 0.2s",
                        })}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                            e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            const isActive = e.currentTarget.classList.contains("active");
                            if (!isActive) {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                            }
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* FOOTER */}
            <div style={{
                padding: "14px 18px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px"
            }}>
                © 2026 EduPlatform
            </div>
        </aside>
    );
};

export default Sidebar;