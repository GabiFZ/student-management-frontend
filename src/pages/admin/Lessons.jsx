import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { Check, Edit2, Plus, Search, Trash2, X } from "lucide-react";

const Lessons = () => {
    const [lessons, setLessons] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = {
        title: "",
        content: "",
        videoUrl: "",
        orderIndex: "",
        durationMinutes: "",
        isFree: false,
        course: { id: "" }
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadLessons();
        loadCourses();
    }, []);

    const loadLessons = async () => {
        try {
            const res = await api.get("/lessons");
            setLessons(res.data);
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
        const { name, value, type, checked } = e.target;

        if (name === "course") {
            setForm({
                ...form,
                course: { id: value === "" ? "" : Number(value) }
            });
            return;
        }

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const payload = {
            title: form.title.trim(),
            content: form.content.trim(),
            videoUrl: form.videoUrl.trim() || null,
            orderIndex: form.orderIndex === "" ? null : Number(form.orderIndex),
            durationMinutes: form.durationMinutes === "" ? null : Number(form.durationMinutes),
            isFree: !!form.isFree,
            course: form.course.id ? { id: Number(form.course.id) } : null
        };

        try {
            if (editingLesson) {
                await api.put(`/lessons/${editingLesson.id}`, payload);
            } else {
                await api.post("/lessons", payload);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingLesson(null);
            loadLessons();
        } catch (err) {
            console.error(err);
            setErrorMessage(err?.response?.data?.message || "A apărut o eroare.");
        }
    };

    const handleEdit = (lesson) => {
        setEditingLesson(lesson);
        setForm({
            title: lesson.title || "",
            content: lesson.content || "",
            videoUrl: lesson.videoUrl || "",
            orderIndex: lesson.orderIndex ?? "",
            durationMinutes: lesson.durationMinutes ?? "",
            isFree: lesson.isFree ?? false,
            course: { id: lesson.course?.id || "" }
        });
        setErrorMessage("");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Ești sigur că vrei să ștergi această lecție?")) {
            try {
                await api.delete(`/lessons/${id}`);
                loadLessons();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = [...lessons]
        .filter((lesson) => {
            const haystack = [
                lesson.title,
                lesson.content,
                lesson.videoUrl,
                lesson.course?.title,
                lesson.orderIndex,
                lesson.durationMinutes,
                lesson.isFree ? "free" : "paid"
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(search.toLowerCase());
        })
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

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
        badge: (active) => ({
            padding: "3px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            background: active ? "#dcf5d8" : "#fddcdc",
            color: active ? "#2d7a27" : "#c23030",
            display: "inline-block"
        })
    };

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("ro-RO");
    };

    const formatCourse = (course) => {
        if (!course) return "-";
        return course.title || course.name || `Course #${course.id}`;
    };

    const truncate = (text, max = 70) => {
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
                        Lessons
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {lessons.length} lecții înregistrate
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingLesson(null);
                        setForm({ ...emptyForm, isFree: false });
                        setErrorMessage("");
                        setShowModal(true);
                    }}>
                    <Plus size={16} /> Add Lesson
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
                    placeholder="Caută după titlu, conținut sau curs..."
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
                            <col style={{ width: "24%" }} />
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "18%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "6%" }} />
                        </colgroup>
                        <thead>
                        <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                            {[
                                "#",
                                "Lesson",
                                "Course",
                                "Order",
                                "Duration",
                                "Free",
                                "Video URL",
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
                                <td colSpan={9} style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#8aaa85",
                                    fontSize: "14px"
                                }}>
                                    Nu s-au găsit lecții
                                </td>
                            </tr>
                        ) : (
                            filtered.map((lesson, index) => (
                                <tr
                                    key={lesson.id}
                                    style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#8aaa85" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a2e18", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {lesson.title}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#4a6645", lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {truncate(lesson.content, 90)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {formatCourse(lesson.course)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645" }}>
                                        {lesson.orderIndex ?? "-"}
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645" }}>
                                        {lesson.durationMinutes == null ? "-" : `${lesson.durationMinutes} min`}
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <span style={styles.badge(lesson.isFree)}>
                                            {lesson.isFree ? "✓ Free" : "✗ Paid"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {lesson.videoUrl ? (
                                                <a href={lesson.videoUrl} target="_blank" rel="noreferrer" style={{ color: "#3d7a35", textDecoration: "none" }}>
                                                    {truncate(lesson.videoUrl, 36)}
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {formatDate(lesson.createdAt)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                style={styles.iconBtn("#3d7a35")}
                                                onClick={() => handleEdit(lesson)}
                                                title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                style={styles.iconBtn("#e05252")}
                                                onClick={() => handleDelete(lesson.id)}
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
                Afișare {filtered.length} din {lessons.length} lecții
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
                                {editingLesson ? "Edit Lesson" : "Add Lesson"}
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
                                    <label htmlFor="orderIndex" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Order Index
                                    </label>
                                    <input
                                        id="orderIndex"
                                        type="number"
                                        name="orderIndex"
                                        value={form.orderIndex}
                                        onChange={handleInputChange}
                                        min="0"
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
                                    <label htmlFor="durationMinutes" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Duration (minutes)
                                    </label>
                                    <input
                                        id="durationMinutes"
                                        type="number"
                                        name="durationMinutes"
                                        value={form.durationMinutes}
                                        onChange={handleInputChange}
                                        min="0"
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

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label htmlFor="videoUrl" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Video URL
                                    </label>
                                    <input
                                        id="videoUrl"
                                        type="url"
                                        name="videoUrl"
                                        value={form.videoUrl}
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

                            <div style={{ marginTop: "16px" }}>
                                <label htmlFor="content" style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#4a6645",
                                    marginBottom: "6px"
                                }}>
                                    Content
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={form.content}
                                    onChange={handleInputChange}
                                    rows="6"
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
                                        boxSizing: "border-box",
                                        fontFamily: "inherit",
                                        resize: "vertical"
                                    }}
                                />
                            </div>

                            <div style={{ marginTop: "16px" }}>
                                <label htmlFor="isFree" style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#4a6645",
                                    marginBottom: "6px"
                                }}>
                                    Access
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", minHeight: "40px" }}>
                                    <input
                                        id="isFree"
                                        type="checkbox"
                                        name="isFree"
                                        checked={form.isFree}
                                        onChange={handleInputChange}
                                        style={{ cursor: "pointer" }}
                                    />
                                    <span style={{ fontSize: "13px", color: "#4a6645" }}>Free lesson</span>
                                </div>
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
                                    {editingLesson ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lessons;