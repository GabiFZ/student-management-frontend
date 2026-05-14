import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { Plus, Edit2, Trash2, X, Check, Search } from "lucide-react";

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = { name: "", description: "" };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const res = await api.get("/departments");
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(""); // resetează eroarea la submit
        try {
            if (editingDept) {
                await api.put(`/departments/${editingDept.id}`, form);
            } else {
                await api.post("/departments", form);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingDept(null);
            loadDepartments();
        } catch (err) {
            console.error("Eroare API Departments:", err);
            // afișează și în modal
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.message || "A apărut o eroare.");
            } else {
                setErrorMessage("A apărut o eroare.");
            }
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setForm({ name: dept.name, description: dept.description });
        setErrorMessage("");
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi acest departament?")) {
            try {
                await api.delete(`/departments/${id}`);
                loadDepartments();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = departments.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase())
    );

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
                        Departments
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {departments.length} departamente înregistrate
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingDept(null);
                        setForm(emptyForm);
                        setShowModal(true);
                    }}>
                    <Plus size={16}/> Add Department
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
                    placeholder="Caută departament..."
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
                            {["#", "Nume", "Descriere", "Creat la", "Acțiuni"].map(h => (
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
                                <td colSpan={5} style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#8aaa85"
                                }}>
                                    Nu s-au găsit departamente
                                </td>
                            </tr>
                        ) : (
                            filtered.map((dept, index) => (
                                <tr key={dept.id}
                                    style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#8aaa85" }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a2e18" }}>
                                            {dept.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {dept.description || "-"}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#4a6645" }}>
                                        {dept.createdAt
                                            ? new Date(dept.createdAt).toLocaleDateString("ro-RO")
                                            : "-"}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button
                                                style={styles.iconBtn("#3d7a35")}
                                                onClick={() => handleEdit(dept)}
                                                title="Edit">
                                                <Edit2 size={14}/>
                                            </button>
                                            <button
                                                style={styles.iconBtn("#e05252")}
                                                onClick={() => handleDelete(dept.id)}
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

            {/* FOOTER */}
            <div style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#8aaa85",
                textAlign: "right"
            }}>
                Afișare {filtered.length} din {departments.length} departamente
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
                        width: "460px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
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
                                {editingDept ? "Edit Department" : "Add Department"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ border: "none", background: "none", cursor: "pointer" }}>
                                <X size={20} color="#8aaa85"/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block", fontSize: "12px",
                                    fontWeight: 600, color: "#4a6645", marginBottom: "6px"
                                }}>
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    style={{
                                        width: "100%", padding: "9px 12px",
                                        border: "1.5px solid rgba(45,90,39,0.15)",
                                        borderRadius: "8px", fontSize: "13px",
                                        outline: "none", background: "#faf6ee",
                                        color: "#1a2e18", boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    display: "block", fontSize: "12px",
                                    fontWeight: 600, color: "#4a6645", marginBottom: "6px"
                                }}>
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    style={{
                                        width: "100%", padding: "9px 12px",
                                        border: "1.5px solid rgba(45,90,39,0.15)",
                                        borderRadius: "8px", fontSize: "13px",
                                        outline: "none", background: "#faf6ee",
                                        color: "#1a2e18", resize: "vertical",
                                        boxSizing: "border-box"
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setErrorMessage(""); // resetează eroarea la cancel
                                    }}
                                    style={{
                                        padding: "9px 18px", borderRadius: "8px",
                                        border: "1.5px solid rgba(45,90,39,0.2)",
                                        background: "transparent", color: "#4a6645",
                                        fontSize: "13px", fontWeight: 600, cursor: "pointer"
                                    }}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.btn("#3d7a35")}>
                                    <Check size={16}/>
                                    {editingDept ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;