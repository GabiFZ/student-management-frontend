import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { Check, Edit2, Plus, Search, Trash2, X } from "lucide-react";

const QUIZ_STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = {
        title: "",
        description: "",
        timeLimit: "",
        status: "ACTIVE",
        course: { id: "" }
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadQuizzes();
        loadCourses();
    }, []);

    const loadQuizzes = async () => {
        try {
            const res = await api.get("/quizzes");
            setQuizzes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCourses = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "course") {
            setForm({
                ...form,
                course: { id: value === "" ? "" : Number(value) }
            });
            return;
        }

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const payload = {
            title: form.title.trim(),
            description: form.description.trim() || null,
            timeLimit: form.timeLimit ? Number(form.timeLimit) : null,
            status: form.status || "ACTIVE",
            course: form.course.id ? { id: Number(form.course.id) } : null
        };

        try {
            if (editingQuiz) {
                await api.put(`/quizzes/${editingQuiz.id}`, payload);
            } else {
                await api.post("/quizzes", payload);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingQuiz(null);
            loadQuizzes();
        } catch (err) {
            console.error(err);
            setErrorMessage(err?.response?.data?.message || "A apărut o eroare.");
        }
    };

    const handleEdit = (quiz) => {
        setEditingQuiz(quiz);
        setForm({
            title: quiz.title || "",
            description: quiz.description || "",
            timeLimit: quiz.timeLimit ?? "",
            status: quiz.status || "ACTIVE",
            course: { id: quiz.course?.id || "" }
        });
        setErrorMessage("");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Ești sigur că vrei să ștergi acest quiz?")) {
            try {
                await api.delete(`/quizzes/${id}`);
                loadQuizzes();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = [...quizzes]
        .filter((quiz) => {
            const haystack = [
                quiz.title,
                quiz.description,
                quiz.timeLimit,
                quiz.status,
                quiz.course?.title,
                quiz.course?.name
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(search.toLowerCase());
        })
        .sort((a, b) => {
            const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bd - ad;
        });

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
                INACTIVE: { bg: "#fddcdc", color: "#c23030" }
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
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("ro-RO");
    };

    const courseLabel = (course) => {
        if (!course) return "-";
        return course.title || course.name || `Course #${course.id}`;
    };

    const truncate = (text, max = 80) => {
        if (!text) return "-";
        return text.length > max ? `${text.slice(0, max).trim()}...` : text;
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
                        Quizzes
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {quizzes.length} quizuri înregistrate
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingQuiz(null);
                        setForm({ ...emptyForm, status: "ACTIVE" });
                        setErrorMessage("");
                        setShowModal(true);
                    }}>
                    <Plus size={16} /> Add Quiz
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
                    placeholder="Caută după titlu, descriere sau curs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        border: "none",
                        outline: "none",
                        fontSize: "13px",
                        flex: 1,
                        color: "#1a2e18",
                        background: "transparent"
                    }}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
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
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#8aaa85" }}>
                        Loading...
                    </div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <colgroup>
                            <col style={{ width: "4%" }} />
                            <col style={{ width: "28%" }} />
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "12%" }} />
                            <col style={{ width: "14%" }} />
                            <col style={{ width: "12%" }} />
                        </colgroup>
                        <thead>
                        <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                            {[
                                "#",
                                "Quiz",
                                "Course",
                                "Time Limit",
                                "Status",
                                "Created",
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
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#8aaa85",
                                    fontSize: "14px"
                                }}>
                                    Nu s-au găsit quizuri
                                </td>
                            </tr>
                        ) : (
                            filtered.map((quiz, index) => (
                                <tr
                                    key={quiz.id}
                                    style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#8aaa85" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a2e18", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {quiz.title}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#4a6645", lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {truncate(quiz.description, 92)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {courseLabel(quiz.course)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645" }}>
                                        {quiz.timeLimit ? `${quiz.timeLimit} min` : "-"}
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <span style={styles.statusBadge(quiz.status)}>
                                            {quiz.status || "-"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {formatDateTime(quiz.createdAt)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                style={styles.iconBtn("#3d7a35")}
                                                onClick={() => handleEdit(quiz)}
                                                title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                style={styles.iconBtn("#e05252")}
                                                onClick={() => handleDelete(quiz.id)}
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
                )}
            </div>

            {/* FOOTER TABLE */}
            <div style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#8aaa85",
                textAlign: "right"
            }}>
                Afișare {filtered.length} din {quizzes.length} quizuri
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
                        width: "980px",
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
                                {editingQuiz ? "Edit Quiz" : "Add Quiz"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#8aaa85" }}>
                                <X size={20} />
                            </button>
                        </div>

                        {errorMessage && (
                            <div style={{
                                background: "#fdecea",
                                color: "#c23030",
                                padding: "10px 12px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                                fontSize: "13px",
                                border: "1px solid #f5c2c2"
                            }}>
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                                <div>
                                    <label htmlFor="title" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={form.title}
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
                                            boxSizing: "border-box"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="timeLimit" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Time Limit (minutes)
                                    </label>
                                    <input
                                        id="timeLimit"
                                        type="number"
                                        name="timeLimit"
                                        value={form.timeLimit}
                                        onChange={handleInputChange}
                                        min="1"
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
                                        <option value="">Selectează statusul</option>
                                        {QUIZ_STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
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
                                        Course
                                    </label>
                                    <select
                                        id="course"
                                        name="course"
                                        value={form.course.id}
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
                                        <option value="">Selectează cursul</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: "16px" }}>
                                <label htmlFor="description" style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#4a6645",
                                    marginBottom: "6px"
                                }}>
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    rows="6"
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

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setErrorMessage("");
                                    }}
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
                                    {editingQuiz ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quizzes;