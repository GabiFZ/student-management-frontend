import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { Search, Plus, Edit2, Trash2, X, Check } from "lucide-react";

const Professors = () => {
    const [professors, setProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingProfessor, setEditingProfessor] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = {
        firstName: "", lastName: "", username: "",
        password: "", email: "", phone: "",
        bio: "", avatarUrl: "", department: { id: "" }
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadProfessors();
        loadDepartments();
    }, []);

    const loadProfessors = async () => {
        try {
            const res = await api.get("/professors");
            setProfessors(res.data);
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
            if (editingProfessor) {
                await api.put(`/professors/${editingProfessor.id}`, form);
            } else {
                await api.post("/professors", form);
            }
            setShowModal(false);
            setForm(emptyForm);
            setErrorMessage("");
            setEditingProfessor(null);
            loadProfessors();
        } catch (err) {
            console.error(err);

            if (err.response?.data) {
                setErrorMessage(err.response.data.message);
            } else {
                setErrorMessage("A apărut o eroare.");
            }
        }
    };

    const handleEdit = (professor) => {
        setEditingProfessor(professor);
        setForm({
            firstName: professor.firstName,
            lastName: professor.lastName,
            username: professor.username,
            password: "",
            email: professor.email,
            phone: professor.phone || "",
            bio: professor.bio || "",
            avatarUrl: professor.avatarUrl || "",
            department: { id: professor.department?.id || "" },
            isActive: professor.isActive
        });
        setErrorMessage("");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Ești sigur că vrei să ștergi acest profesor?")) {
            try {
                await api.delete(`/professors/${id}`);
                loadProfessors();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = professors.filter(p =>
        p.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase())
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
                        Professors
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {professors.length} profesori înregistrați
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingProfessor(null);
                        setForm({ ...emptyForm, isActive: true });
                        setErrorMessage("");
                        setShowModal(true);
                    }}>
                    <Plus size={16}/> Add Professor
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
                            {["#", "Nume", "Username", "Email", "Telefon",
                                "Department", "Status", "Acțiuni"].map(h => (
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
                                <td colSpan={8} style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#8aaa85",
                                    fontSize: "14px"
                                }}>
                                    Nu s-au găsit profesori
                                </td>
                            </tr>
                        ) : (
                            filtered.map((professor, index) => (
                                <tr key={professor.id}
                                    style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8aaa85" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a2e18" }}>
                                            {professor.firstName} {professor.lastName}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {professor.username}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {professor.email}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645", whiteSpace: "nowrap" }}>
                                        {professor.phone || "-"}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {professor.department?.name || "-"}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={styles.badge(professor.isActive)}>
                                            {professor.isActive ? "✓ Active" : "✗ Inactive"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                style={styles.iconBtn("#3d7a35")}
                                                onClick={() => handleEdit(professor)}
                                                title="Edit">
                                                <Edit2 size={14}/>
                                            </button>
                                            <button
                                                style={styles.iconBtn("#e05252")}
                                                onClick={() => handleDelete(professor.id)}
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
                Afișare {filtered.length} din {professors.length} profesori
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
                            marginBottom: "12px"
                        }}>


                            <h2 style={{
                                fontSize: "18px", fontWeight: 700,
                                color: "#1a2e18", margin: 0,
                                fontFamily: "Georgia, serif"
                            }}>
                                {editingProfessor ? "Edit Professor" : "Add Professor"}
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
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            {[
                                { label: "First Name", name: "firstName", type: "text" },
                                { label: "Last Name", name: "lastName", type: "text" },
                                { label: "Username", name: "username", type: "text" },
                                { label: "Password", name: "password", type: "password" },
                                { label: "Email", name: "email", type: "email" },
                                { label: "Phone", name: "phone", type: "tel" },
                                { label: "Bio", name: "bio", type: "textarea" },
                                { label: "Avatar URL", name: "avatarUrl", type: "text" },
                            ].map(field => (
                                <div key={field.name} style={{ marginBottom: "16px" }}>
                                    <label htmlFor={field.name} style={{
                                        display: "block",
                                        fontSize: "12px", fontWeight: 600,
                                        color: "#4a6645", marginBottom: "6px"
                                    }}>
                                        {field.label}
                                    </label>
                                    {field.type === "textarea" ? (
                                        <textarea
                                            id={field.name}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleInputChange}
                                            rows="4"
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
                                                fontFamily: "inherit"
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleInputChange}
                                            required={field.name !== "phone" && field.name !== "bio" && field.name !== "avatarUrl"}
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
                                    )}
                                </div>
                            ))}

                            {/* Department Dropdown */}
                            <div style={{ marginBottom: "20px" }}>
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
                            </div>

                            {/* Status Checkbox */}
                            <div style={{ marginBottom: "20px" }}>
                                <label htmlFor="isActive" style={{
                                    display: "block",
                                    fontSize: "12px", fontWeight: 600,
                                    color: "#4a6645", marginBottom: "6px"
                                }}>
                                    Status
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        name="isActive"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        style={{ cursor: "pointer" }}
                                    />
                                    <span style={{ fontSize: "13px", color: "#4a6645" }}>Active</span>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
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
                                <button
                                    type="submit"
                                    style={styles.btn("#3d7a35")}>
                                    <Check size={16}/>
                                    {editingProfessor ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Professors;

