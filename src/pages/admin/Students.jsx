import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { Search, Plus, Edit2, Trash2, Eye, X, Check } from "lucide-react";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = {
        firstName: "", lastName: "", username: "",
        password: "", email: "", age: "",
        studentNumber: "", department: { id: "" }

    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadStudents();
        loadDepartments();
    }, []);

    const loadStudents = async () => {
        try {
            const res = await api.get("/students");
            setStudents(res.data);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "department") {
            setForm({
                ...form,
                department: { id: Number(value) }
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        try {
            if (editingStudent) {
                await api.put(`/students/${editingStudent.id}`, form);
            } else {
                await api.post("/students", form);
            }
            setShowModal(false);
            setForm(emptyForm);
            setErrorMessage("");
            setEditingStudent(null);
            loadStudents();
        } catch (err) {
            console.error(err);



            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.message);
            } else {
                setErrorMessage("A apărut o eroare.");
            }
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setForm({
            firstName: student.firstName,
            lastName: student.lastName,
            username: student.username,
            password: "",
            email: student.email,
            age: student.age,
            studentNumber: student.studentNumber,
            department: { id: student.department?.id || "" },
            isActive: student.isActive
        });
        setErrorMessage("");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi acest student?")) {
            try {
                await api.delete(`/students/${id}`);
                loadStudents();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = students.filter(s =>
        s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    // ── STYLES ──────────────────────────────────────
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
            width: "32px", height: "32px",
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
        })
    };

    return (
        <div>
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
                        Students
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {students.length} studenți înregistrați
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingStudent(null);
                        setForm({ ...emptyForm, isActive: true });
                        setErrorMessage("");
                        setShowModal(true);
                    }}>
                    <Plus size={16}/> Add Student
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
                <Search size={16} color="#8aaa85"/>
                <input
                    type="text"
                    placeholder="Caută după nume sau email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        border: "none", outline: "none",
                        fontSize: "13px", flex: 1,
                        color: "#1a2e18", background: "transparent"
                    }}
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        style={{ border: "none", background: "none", cursor: "pointer" }}>
                        <X size={16} color="#8aaa85"/>
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
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                        <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                            {["#", "Nume", "Username", "Email", "Vârstă",
                                "Nr. Student", "Department", "Status", "Acțiuni"].map(h => (
                                <th key={h} style={{
                                    padding: "12px 16px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    color: "#8aaa85",
                                    textAlign: "left",
                                    borderBottom: "1.5px solid rgba(45,90,39,0.08)"
                                }}>
                                    {h}
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
                                    Nu s-au găsit studenți
                                </td>
                            </tr>
                        ) : (
                            filtered.map((student, index) => (
                                <tr key={student.id}
                                    style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8aaa85" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a2e18" }}>
                                            {student.firstName} {student.lastName}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {student.username}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {student.email}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {student.age}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {student.studentNumber}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {student.department?.name || "-"}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={styles.badge(student.isActive)}>
                                            {student.isActive ? "✓ Active" : "✗ Inactive"}
                                        </span>

                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                style={styles.iconBtn("#3d7a35")}
                                                onClick={() => handleEdit(student)}
                                                title="Edit">
                                                <Edit2 size={14}/>
                                            </button>
                                            <button
                                                style={styles.iconBtn("#e05252")}
                                                onClick={() => handleDelete(student.id)}
                                                title="Delete">
                                                <Trash2 size={14}/>
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
                Afișare {filtered.length} din {students.length} studenți
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
                        width: "500px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px"
                        }}>
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

                            <h2 style={{
                                fontSize: "18px", fontWeight: 700,
                                color: "#1a2e18", margin: 0,
                                fontFamily: "Georgia, serif"
                            }}>
                                {editingStudent ? "Edit Student" : "Add Student"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    border: "none", background: "none",
                                    cursor: "pointer", color: "#8aaa85"
                                }}>
                                <X size={20}/>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            {[
                                { label: "First Name", name: "firstName", type: "text" },
                                { label: "Last Name", name: "lastName", type: "text" },
                                { label: "Username", name: "username", type: "text" },
                                { label: "Password", name: "password", type: "password" },
                                { label: "Email", name: "email", type: "email" },
                                { label: "Age", name: "age", type: "number" },
                                { label: "Student Number", name: "studentNumber", type: "text" },
                            ].map(field => (
                                <div key={field.name} style={{ marginBottom: "16px" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        value={form[field.name]}
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
                            ))}

                            {/* Department Dropdown */}
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px", fontWeight: 600,
                                    color: "#4a6645", marginBottom: "6px"
                                }}>
                                    Department
                                </label>
                                <select
                                    name="department"
                                    value={form.department.id}
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
                                        cursor: "pointer"
                                    }}>
                                    <option value="">Selectează departamentul</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        Status
                                    </label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        style={{ marginRight: "8px", cursor: "pointer" }}
                                    />
                                    Active
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setErrorMessage(""); // <-- resetează aici
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
                                <button
                                    type="submit"
                                    style={styles.btn("#3d7a35")}>
                                    <Check size={16}/>
                                    {editingStudent ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;