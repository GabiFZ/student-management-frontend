import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { BookOpen, Check, Edit2, Plus, Search, Trash2, X } from "lucide-react";

const LEVEL_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = {
        title: "",
        description: "",
        thumbnailUrl: "",
        price: "",
        duration: "",
        level: "BEGINNER",
        status: "DRAFT",
        department: { id: "" },
        category: { id: "" },
        professor: { id: "" },
        active: true
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadCourses();
        loadDepartments();
        loadCategories();
        loadProfessors();
    }, []);

    const loadCourses = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = async () => {
        try {
            const res = await api.get("/departments");
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadProfessors = async () => {
        try {
            const res = await api.get("/professors");
            setProfessors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (["department", "category", "professor"].includes(name)) {
            setForm({
                ...form,
                [name]: { id: value === "" ? "" : Number(value) }
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
            description: form.description.trim(),
            thumbnailUrl: form.thumbnailUrl.trim() || null,
            price: form.price === "" ? null : Number(form.price),
            duration: form.duration === "" ? null : Number(form.duration),
            level: form.level || "BEGINNER",
            status: form.status || "DRAFT",
            department: form.department.id ? { id: Number(form.department.id) } : null,
            category: form.category.id ? { id: Number(form.category.id) } : null,
            professor: form.professor.id ? { id: Number(form.professor.id) } : null,
            active: !!form.active
        };

        try {
            if (editingCourse) {
                await api.put(`/courses/${editingCourse.id}`, payload);
            } else {
                await api.post("/courses", payload);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingCourse(null);
            loadCourses();
        } catch (err) {
            console.error(err);
            setErrorMessage(err?.response?.data?.message || "A apărut o eroare.");
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setForm({
            title: course.title || "",
            description: course.description || "",
            thumbnailUrl: course.thumbnailUrl || "",
            price: course.price ?? "",
            duration: course.duration ?? "",
            level: course.level || "BEGINNER",
            status: course.status || "DRAFT",
            department: { id: course.department?.id || "" },
            category: { id: course.category?.id || "" },
            professor: { id: course.professor?.id || "" },
            active: course.active ?? true
        });
        setErrorMessage("");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Ești sigur că vrei să ștergi acest curs?")) {
            try {
                await api.delete(`/courses/${id}`);
                loadCourses();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = courses.filter((course) => {
        const haystack = [
            course.title,
            course.description,
            course.department?.name,
            course.category?.name,
            course.professor?.firstName,
            course.professor?.lastName,
            course.level,
            course.status
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return haystack.includes(search.toLowerCase());
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
        badge: (active) => ({
            padding: "3px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: 600,
            background: active ? "#dcf5d8" : "#fddcdc",
            color: active ? "#2d7a27" : "#c23030"
        }),
        levelBadge: (level) => {
            const colors = {
                BEGINNER: { bg: "#e8f5e3", color: "#2d7a27" },
                INTERMEDIATE: { bg: "#e6f1fb", color: "#2b7ab8" },
                ADVANCED: { bg: "#f3e8fb", color: "#7d3fb2" },
                EXPERT: { bg: "#fff1db", color: "#b77412" }
            };
            const c = colors[level] || { bg: "#f1f3f5", color: "#5c677d" };
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
        statusBadge: (status) => {
            const colors = {
                DRAFT: { bg: "#fff1db", color: "#b77412" },
                PUBLISHED: { bg: "#dcf5d8", color: "#2d7a27" },
                ARCHIVED: { bg: "#eef1f4", color: "#5c677d" }
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

    const formatDate = (value) => {
        if (!value) return "-";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ro-RO");
    };

    const formatMoney = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        const num = Number(value);
        if (Number.isNaN(num)) return String(value);
        return new Intl.NumberFormat("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    const professorLabel = (professor) => {
        if (!professor) return "-";
        return `${professor.firstName || ""} ${professor.lastName || ""}`.trim() || professor.username || "-";
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
                        fontSize: "22px", fontWeight: 700,
                        color: "#1a2e18", fontFamily: "Georgia, serif", margin: 0
                    }}>
                        Courses
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {courses.length} cursuri înregistrate
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingCourse(null);
                        setForm({ ...emptyForm, active: true });
                        setErrorMessage("");
                        setShowModal(true);
                    }}>
                    <Plus size={16} /> Add Course
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
                    placeholder="Caută după titlu, profesor sau descriere..."
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
                            <col style={{ width: "3%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "28%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "8%" }} />
                            <col style={{ width: "7%" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "7%" }} />
                        </colgroup>
                        <thead>
                        <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                            {[
                                "#",
                                "Thumbnail",
                                "Course",
                                "Price",
                                "Duration",
                                "Level",
                                "Status",
                                "Active",
                                "Professor",
                                "Acțiuni"
                            ].map((col) => (
                                <th key={col.label} style={{
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
                                <td colSpan={10} style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#8aaa85",
                                    fontSize: "14px"
                                }}>
                                    Nu s-au găsit cursuri
                                </td>
                            </tr>
                        ) : (
                            filtered.map((course, index) => (
                                <tr
                                    key={course.id}
                                    style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#8aaa85" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "12px 18px" }}>
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                style={{
                                                    width: "54px",
                                                    height: "36px",
                                                    borderRadius: "8px",
                                                    objectFit: "cover",
                                                    border: "2px solid rgba(61,122,53,0.15)"
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: "54px",
                                                height: "36px",
                                                borderRadius: "8px",
                                                background: "#e8f5e3",
                                                color: "#3d7a35",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}>
                                                <BookOpen size={18} />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a2e18", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {course.title}
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#4a6645", lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {truncate(course.description, 92)}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#8aaa85", marginTop: "6px", lineHeight: 1.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            <span>Dept: {course.department?.name || "-"}</span>
                                            <span style={{ margin: "0 6px" }}>•</span>
                                            <span>Cat: {course.category?.name || "-"}</span>
                                            <span style={{ margin: "0 6px" }}>•</span>
                                            <span>Creat: {formatDate(course.dateCreated)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645" }}>
                                        {formatMoney(course.price)}
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645" }}>
                                        {course.duration == null ? "-" : `${course.duration} h`}
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <span style={styles.levelBadge(course.level)}>
                                            {course.level || "-"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <span style={styles.statusBadge(course.status)}>
                                            {course.status || "-"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <span style={styles.badge(course.active)}>
                                            {course.active ? "✓ Active" : "✗ Inactive"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {professorLabel(course.professor)}
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 18px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                style={styles.iconBtn("#3d7a35")}
                                                onClick={() => handleEdit(course)}
                                                title="Edit">
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                style={styles.iconBtn("#e05252")}
                                                onClick={() => handleDelete(course.id)}
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
                Afișare {filtered.length} din {courses.length} cursuri
            </div>

            {/* MODAL */}
            {showModal && (
                <div style={{
                    position: "fixed", inset: 0,
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
                                fontSize: "18px", fontWeight: 700,
                                color: "#1a2e18", margin: 0,
                                fontFamily: "Georgia, serif"
                            }}>
                                {editingCourse ? "Edit Course" : "Add Course"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    border: "none", background: "none",
                                    cursor: "pointer", color: "#8aaa85"
                                }}>
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
                                {[
                                    { label: "Title", name: "title", type: "text", required: true },
                                    { label: "Price", name: "price", type: "number", required: true, step: "0.01", min: "0" },
                                    { label: "Duration (hours)", name: "duration", type: "number", required: true, step: "1", min: "1" },
                                    { label: "Thumbnail URL", name: "thumbnailUrl", type: "url", required: false }
                                ].map((field) => (
                                    <div key={field.name} style={{ gridColumn: field.name === "thumbnailUrl" ? "1 / -1" : "auto" }}>
                                        <label htmlFor={field.name} style={{
                                            display: "block",
                                            fontSize: "12px", fontWeight: 600,
                                            color: "#4a6645", marginBottom: "6px"
                                        }}>
                                            {field.label}
                                        </label>
                                        <input
                                            id={field.name}
                                            type={field.type}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            min={field.min}
                                            step={field.step}
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
                                ))}

                                <div>
                                    <label htmlFor="level" style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        Level
                                    </label>
                                    <select
                                        id="level"
                                        name="level"
                                        value={form.level}
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
                                        <option value="">Selectează nivelul</option>
                                        {LEVEL_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="status" style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
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
                                        {STATUS_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: "16px" }}>
                                <label htmlFor="description" style={{
                                    display: "block",
                                    fontSize: "12px", fontWeight: 600,
                                    color: "#4a6645", marginBottom: "6px"
                                }}>
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    rows="4"
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

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "16px",
                                marginTop: "16px"
                            }}>
                                <div>
                                    <label htmlFor="department" style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={form.department.id}
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
                                            cursor: "pointer"
                                        }}>
                                        <option value="">Selectează departamentul</option>
                                        {departments.map((department) => (
                                            <option key={department.id} value={department.id}>
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="category" style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category.id}
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
                                            cursor: "pointer"
                                        }}>
                                        <option value="">Selectează categoria</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="professor" style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        Professor
                                    </label>
                                    <select
                                        id="professor"
                                        name="professor"
                                        value={form.professor.id}
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
                                            cursor: "pointer"
                                        }}>
                                        <option value="">Selectează profesorul</option>
                                        {professors.map((professor) => (
                                            <option key={professor.id} value={professor.id}>
                                                {professor.firstName} {professor.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="active" style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        Active
                                    </label>
                                    <div style={{
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "0 2px"
                                    }}>
                                        <input
                                            id="active"
                                            type="checkbox"
                                            name="active"
                                            checked={form.active}
                                            onChange={handleInputChange}
                                            style={{ marginRight: "8px", cursor: "pointer" }}
                                        />
                                        <span style={{ fontSize: "13px", color: "#4a6645" }}>Active course</span>
                                    </div>
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
                                    {editingCourse ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses;