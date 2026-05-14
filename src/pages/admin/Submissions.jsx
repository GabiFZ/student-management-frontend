import React, { useState, useEffect } from "react";
import axiosConfig from "../../api/axiosConfig";
import { Check, Edit2, Plus, Search, Trash2, X, Star } from "lucide-react";

const SUBMISSION_STATUS_OPTIONS = ["PENDING", "GRADED"];

export default function Submissions() {
    const [submissions, setSubmissions] = useState([]);
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        score: "",
        feedback: "",
        status: "PENDING",
        fileUrl: "",
        textContent: "",
        student: { id: "" },
        assignment: { id: "" }
    });
    const [editingId, setEditingId] = useState(null);

    // Compute filtered submissions
    const filteredSubmissions = submissions.filter((submission) => {
        const searchLower = searchValue.toLowerCase();
        const studentMatch = 
            submission.student?.firstName?.toLowerCase().includes(searchLower) ||
            submission.student?.lastName?.toLowerCase().includes(searchLower);
        const assignmentMatch = submission.assignment?.title?.toLowerCase().includes(searchLower);
        const statusMatch = submission.status?.toLowerCase().includes(searchLower);

        return studentMatch || assignmentMatch || statusMatch;
    });

    const emptyForm = {
        score: "",
        feedback: "",
        status: "PENDING",
        fileUrl: "",
        textContent: "",
        student: { id: "" },
        assignment: { id: "" }
    };

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [submissionsRes, studentsRes, assignmentsRes] = await Promise.all([
                    axiosConfig.get("/submissions"),
                    axiosConfig.get("/students"),
                    axiosConfig.get("/assignments")
                ]);
                setSubmissions(submissionsRes.data);
                setStudents(studentsRes.data);
                setAssignments(assignmentsRes.data);
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

    const handleAssignmentChange = (e) => {
        const assignmentId = e.target.value;
        setForm((prev) => ({
            ...prev,
            assignment: { id: assignmentId }
        }));
    };

    const handleEdit = (submission) => {
        setForm({
            score: submission.score ?? "",
            feedback: submission.feedback || "",
            status: submission.status,
            fileUrl: submission.fileUrl || "",
            textContent: submission.textContent || "",
            student: { id: submission.student.id },
            assignment: { id: submission.assignment.id }
        });
        setEditingId(submission.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.student.id || !form.assignment.id) {
            alert("Please fill all required fields");
            return;
        }

        const payload = {
            score: form.score ? Number.parseInt(form.score, 10) : null,
            feedback: form.feedback || null,
            status: form.status,
            fileUrl: form.fileUrl || null,
            textContent: form.textContent || null,
            student: { id: Number.parseInt(form.student.id, 10) },
            assignment: { id: Number.parseInt(form.assignment.id, 10) }
        };

        try {
            if (isEditing) {
                await axiosConfig.put(`/submissions/${editingId}`, payload);
            } else {
                await axiosConfig.post("/submissions", payload);
            }
            // Refetch submissions
            const response = await axiosConfig.get("/submissions");
            setSubmissions(response.data);
            alert("✅ Submission saved successfully!");
            handleCloseModal();
        } catch (err) {
            console.error("Error saving submission:", err.response?.data || err.message);
            alert("❌ Failed to save submission");
        }
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Are you sure you want to delete this submission?")) {
            try {
                await axiosConfig.delete(`/submissions/${id}`);
                // Refetch submissions
                const response = await axiosConfig.get("/submissions");
                setSubmissions(response.data);
                alert("✅ Submission deleted successfully!");
            } catch (err) {
                console.error("Error deleting submission:", err.response?.data || err.message);
                alert("❌ Failed to delete submission");
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

    const getAssignmentTitle = (assignment) => {
        if (!assignment) return "N/A";
        return assignment.title || "N/A";
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
                PENDING: { bg: "#fff3cd", color: "#856404" },
                GRADED: { bg: "#dcf5d8", color: "#2d7a27" }
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
        scoreDisplay: (score, maxScore = 100) => ({
            fontSize: "14px",
            fontWeight: 600,
            color: score === null ? "#8aaa85" : score >= 80 ? "#2d7a27" : score >= 60 ? "#ff9800" : "#c23030",
            display: "flex",
            alignItems: "center",
            gap: "4px"
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
                        Submissions
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {submissions.length} submisii trimise
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={handleOpenModal}>
                    <Plus size={16} /> Add Submission
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
                    placeholder="Caută după student, temă sau status..."
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
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "14%" }} />
                        <col style={{ width: "12%" }} />
                    </colgroup>
                    <thead>
                    <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                        {[
                            "#",
                            "Student",
                            "Assignment",
                            "Score",
                            "Status",
                            "Submitted At",
                            "Feedback",
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
                    {filteredSubmissions.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#8aaa85",
                                fontSize: "14px"
                            }}>
                                Nu s-au găsit submisii
                            </td>
                        </tr>
                    ) : (
                        filteredSubmissions.map((submission, index) => (
                            <tr
                                key={submission.id}
                                style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#8aaa85" }}>
                                    {index + 1}
                                </td>
                                <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", color: "#1a2e18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {getStudentName(submission.student)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", color: "#1a2e18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {getAssignmentTitle(submission.assignment)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <div style={styles.scoreDisplay(submission.score)}>
                                        {submission.score !== null ? `${submission.score}/100` : "-"}
                                        {submission.score !== null && submission.score >= 80 && <Star size={14} fill="currentColor" />}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <span style={styles.statusBadge(submission.status)}>
                                        {submission.status || "-"}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {formatDateTime(submission.submittedAt)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {submission.feedback ? submission.feedback.substring(0, 30) + "..." : "-"}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            style={styles.iconBtn("#3d7a35")}
                                            onClick={() => handleEdit(submission)}
                                            title="Grade">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            style={styles.iconBtn("#e05252")}
                                            onClick={() => handleDelete(submission.id)}
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
                Afișare {filteredSubmissions.length} din {submissions.length} submisii
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
                        width: "850px",
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
                                {isEditing ? "Grade Submission" : "Add Submission"}
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
                                        disabled={isEditing}
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: isEditing ? "#f0f0f0" : "#faf6ee",
                                            color: "#1a2e18",
                                            cursor: isEditing ? "not-allowed" : "pointer",
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
                                    <label htmlFor="assignment" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Assignment *
                                    </label>
                                    <select
                                        id="assignment"
                                        value={form.assignment.id}
                                        onChange={handleAssignmentChange}
                                        required
                                        disabled={isEditing}
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: isEditing ? "#f0f0f0" : "#faf6ee",
                                            color: "#1a2e18",
                                            cursor: isEditing ? "not-allowed" : "pointer",
                                            boxSizing: "border-box"
                                        }}>
                                        <option value="">Selectează temă</option>
                                        {assignments.map((assignment) => (
                                            <option key={assignment.id} value={assignment.id}>
                                                {assignment.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="score" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Score (0-100)
                                    </label>
                                    <input
                                        id="score"
                                        type="number"
                                        name="score"
                                        value={form.score}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
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

                                <div>
                                    <label htmlFor="status" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.status}
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
                                            cursor: "pointer",
                                            boxSizing: "border-box"
                                        }}>
                                        <option value="">Selectează status</option>
                                        {SUBMISSION_STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="fileUrl" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        File URL
                                    </label>
                                    <input
                                        id="fileUrl"
                                        type="text"
                                        name="fileUrl"
                                        value={form.fileUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/file.pdf"
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
                                    <label htmlFor="textContent" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Text Content (Submission)
                                    </label>
                                    <textarea
                                        id="textContent"
                                        name="textContent"
                                        value={form.textContent}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Student submission text content..."
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                <div style={{ gridColumn: "span 2" }}>
                                    <label htmlFor="feedback" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Feedback (Teacher)
                                    </label>
                                    <textarea
                                        id="feedback"
                                        name="feedback"
                                        value={form.feedback}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="Write your feedback here..."
                                        style={{
                                            width: "100%",
                                            padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px",
                                            fontSize: "13px",
                                            outline: "none",
                                            background: "#faf6ee",
                                            color: "#1a2e18",
                                            boxSizing: "border-box",
                                            fontFamily: "inherit",
                                            resize: "vertical"
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
                                    {isEditing ? "Grade" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
