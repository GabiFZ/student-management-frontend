import React, { useState, useEffect } from "react";
import axiosConfig from "../../api/axiosConfig";
import { Check, Edit2, Plus, Search, Trash2, X } from "lucide-react";

const ENROLLMENT_STATUS_OPTIONS = ["ACTIVE", "COMPLETED", "DROPPED"];

export default function Enrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        status: "ACTIVE",
        progressPercentage: 0,
        completedAt: "",
        student: { id: "" },
        course: { id: "" }
    });
    const [editingId, setEditingId] = useState(null);

    // Compute filtered enrollments
    const filteredEnrollments = enrollments.filter((enrollment) => {
        const searchLower = searchValue.toLowerCase();
        const studentMatch = 
            enrollment.student?.firstName?.toLowerCase().includes(searchLower) ||
            enrollment.student?.lastName?.toLowerCase().includes(searchLower);
        const courseMatch = enrollment.course?.title?.toLowerCase().includes(searchLower);
        const statusMatch = enrollment.status?.toLowerCase().includes(searchLower);

        return studentMatch || courseMatch || statusMatch;
    });

    const emptyForm = {
        status: "ACTIVE",
        progressPercentage: 0,
        completedAt: "",
        student: { id: "" },
        course: { id: "" }
    };

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
                    axiosConfig.get("/enrollments"),
                    axiosConfig.get("/students"),
                    axiosConfig.get("/courses")
                ]);
                setEnrollments(enrollmentsRes.data);
                setStudents(studentsRes.data);
                setCourses(coursesRes.data);
            } catch (err) {
                console.error("Error fetching data:", err.response?.data || err.message);
            }
        };
        fetchData();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
    };

    const handleOpenModal = () => {
        setForm(emptyForm);
        setIsEditing(false);
        setEditingId(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setForm(emptyForm);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        setForm((prev) => ({
            ...prev,
            student: { id: studentId }
        }));
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setForm((prev) => ({
            ...prev,
            course: { id: courseId }
        }));
    };

    const handleEdit = (enrollment) => {
        setForm({
            status: enrollment.status,
            progressPercentage: enrollment.progressPercentage,
            completedAt: enrollment.completedAt ? enrollment.completedAt.slice(0, 16) : "",
            student: { id: enrollment.student.id },
            course: { id: enrollment.course.id }
        });
        setEditingId(enrollment.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.student.id || !form.course.id || !form.status) {
            alert("Please fill all required fields");
            return;
        }

        const payload = {
            status: form.status,
            progressPercentage: Number.parseInt(form.progressPercentage, 10),
            completedAt: form.completedAt ? form.completedAt : null,
            student: { id: Number.parseInt(form.student.id, 10) },
            course: { id: Number.parseInt(form.course.id, 10) }
        };

        try {
            if (isEditing) {
                await axiosConfig.put(`/enrollments/${editingId}`, payload);
            } else {
                await axiosConfig.post("/enrollments", payload);
            }
            // Refetch enrollments
            const response = await axiosConfig.get("/enrollments");
            setEnrollments(response.data);
            handleCloseModal();
        } catch (err) {
            console.error("Error saving enrollment:", err.response?.data || err.message);
            alert("Failed to save enrollment");
        }
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Are you sure you want to delete this enrollment?")) {
            try {
                await axiosConfig.delete(`/enrollments/${id}`);
                // Refetch enrollments
                const response = await axiosConfig.get("/enrollments");
                setEnrollments(response.data);
            } catch (err) {
                console.error("Error deleting enrollment:", err.response?.data || err.message);
                alert("Failed to delete enrollment");
            }
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("ro-RO");
    };

    const getStudentName = (student) => {
        if (!student) return "N/A";
        return `${student.firstName} ${student.lastName}`;
    };

    const getCourseTitle = (course) => {
        if (!course) return "N/A";
        return course.title || "N/A";
    };

    const styles = {
        btn: (color) => ({
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: color,
            color: "white",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
        }),
        iconBtn: (color) => ({
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            border: "none",
            background: color,
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }),
        badge: (colorBg, colorText) => ({
            padding: "3px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            background: colorBg,
            color: colorText,
            display: "inline-block"
        }),
        statusBadge: (status) => {
            const colors = {
                ACTIVE: { bg: "#dcf5d8", color: "#2d7a27" },
                COMPLETED: { bg: "#d4edff", color: "#004d99" },
                DROPPED: { bg: "#fddcdc", color: "#c23030" }
            };
            const c = colors[status] || { bg: "#f1f3f5", color: "#5c677d" };
            return {
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                background: c.bg,
                color: c.color,
                display: "inline-block"
            };
        },
        progressBar: (percentage) => ({
            width: "100%",
            height: "6px",
            background: "#e0e0e0",
            borderRadius: "3px",
            overflow: "hidden",
            marginTop: "4px"
        }),
        progressFill: (percentage) => ({
            height: "100%",
            width: `${percentage}%`,
            background: percentage === 100 ? "#2d7a27" : "#3d7a35",
            transition: "width 0.3s ease"
        })
    };

    return (
        <div style={{ width: "100%", margin: "0 auto" }}>
            {/* PAGE HEADER */}
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
                        Enrollments
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {enrollments.length} înregistrări de înrolare
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={handleOpenModal}>
                    <Plus size={16} /> Add Enrollment
                </button>
            </div>

            {/* SEARCH */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "16px",
                boxShadow: "0 2px 12px rgba(45,90,39,0.08)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid rgba(45,90,39,0.06)"
            }}>
                <Search size={16} color="#8aaa85" />
                <input
                    type="text"
                    placeholder="Caută după student, curs sau status..."
                    value={searchValue}
                    onChange={handleSearch}
                    style={{
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        flex: 1,
                        color: "#1a2e18",
                        background: "transparent"
                    }}
                />
                {searchValue && (
                    <button
                        onClick={() => setSearchValue("")}
                        style={{ border: "none", background: "none", cursor: "pointer" }}>
                        <X size={16} color="#8aaa85" />
                    </button>
                )}
            </div>

            {/* TABLE */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 12px rgba(45,90,39,0.08)",
                border: "1px solid rgba(45,90,39,0.06)",
                overflow: "hidden"
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <colgroup>
                        <col style={{ width: "4%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "12%" }} />
                    </colgroup>
                    <thead>
                    <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                        {[
                            "#",
                            "Student",
                            "Course",
                            "Progress",
                            "Status",
                            "Enrolled At",
                            "Completed At",
                            "Actions"
                        ].map((col) => (
                            <th key={col} style={{
                                padding: "14px 18px",
                                fontSize: "11px",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                color: "#8aaa85",
                                textAlign: "left",
                                borderBottom: "1.5px solid rgba(45,90,39,0.08)"
                            }}>
                                {col}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {filteredEnrollments.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#8aaa85",
                                fontSize: "14px"
                            }}>
                                Nu s-au găsit înregistrări de înrolare
                            </td>
                        </tr>
                    ) : (
                        filteredEnrollments.map((enrollment, index) => (
                            <tr
                                key={enrollment.id}
                                style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#8aaa85" }}>
                                    {index + 1}
                                </td>
                                <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", color: "#1a2e18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {getStudentName(enrollment.student)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", color: "#1a2e18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {getCourseTitle(enrollment.course)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <div style={{ fontSize: "12px", color: "#4a6645" }}>
                                        {enrollment.progressPercentage}%
                                    </div>
                                    <div style={styles.progressBar(enrollment.progressPercentage)}>
                                        <div style={styles.progressFill(enrollment.progressPercentage)} />
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <span style={styles.statusBadge(enrollment.status)}>
                                        {enrollment.status || "-"}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {formatDateTime(enrollment.enrolledAt)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {formatDateTime(enrollment.completedAt)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            style={styles.iconBtn("#3d7a35")}
                                            onClick={() => handleEdit(enrollment)}
                                            title="Edit">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            style={styles.iconBtn("#e05252")}
                                            onClick={() => handleDelete(enrollment.id)}
                                            title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* FOOTER TABLE */}
            <div style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#8aaa85",
                textAlign: "right"
            }}>
                Afișare {filteredEnrollments.length} din {enrollments.length} înregistrări
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "28px",
                        width: "800px",
                        maxWidth: "96vw",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px"
                        }}>
                            <h2 style={{
                                fontSize: "18px",
                                fontWeight: 700,
                                color: "#1a2e18",
                                margin: 0,
                                fontFamily: "Georgia, serif"
                            }}>
                                {isEditing ? "Edit Enrollment" : "Add Enrollment"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#8aaa85" }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                                <div>
                                    <label htmlFor="student" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Student *
                                    </label>
                                    <select
                                        id="student"
                                        value={form.student.id}
                                        onChange={handleStudentChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            cursor: "pointer",
                                            boxSizing: "border-box"
                                        }}>
                                        <option value="">Selectează student</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.firstName} {student.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="course" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Course *
                                    </label>
                                    <select
                                        id="course"
                                        value={form.course.id}
                                        onChange={handleCourseChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            cursor: "pointer",
                                            boxSizing: "border-box"
                                        }}>
                                        <option value="">Selectează curs</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Status *
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.status}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            cursor: "pointer",
                                            boxSizing: "border-box"
                                        }}>
                                        <option value="">Selectează status</option>
                                        {ENROLLMENT_STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="progressPercentage" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Progress (%) *
                                    </label>
                                    <input
                                        id="progressPercentage"
                                        type="number"
                                        name="progressPercentage"
                                        value={form.progressPercentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <label htmlFor="completedAt" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Completed At
                                    </label>
                                    <input
                                        id="completedAt"
                                        type="datetime-local"
                                        name="completedAt"
                                        value={form.completedAt}
                                        onChange={handleInputChange}
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{
                                        padding: "9px 18px",
                                        borderRadius: "8px",
                                        border: "1.5px solid rgba(45,90,39,0.2)",
                                        background: "transparent",
                                        color: "#4a6645",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        cursor: "pointer"
                                    }}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.btn("#3d7a35")}>
                                    <Check size={16} />
                                    {isEditing ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
