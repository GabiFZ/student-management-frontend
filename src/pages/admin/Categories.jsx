import { useEffect, useState } from "react";
import api from "../../api/axiosConfig.js";
import { Plus, Edit2, Trash2, X, Check, Search, Tag } from "lucide-react";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const emptyForm = { name: "", description: "", iconUrl: "" };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await api.get("/categories");
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, form);
            } else {
                await api.post("/categories", form);
            }
            setShowModal(false);
            setForm(emptyForm);
            setEditingCategory(null);
            loadCategories();
        } catch (err) {
            console.error(err);

            setErrorMessage(
                err?.response?.data?.message || "A apărut o eroare."
            );
        }

    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            description: category.description || "",
            iconUrl: category.iconUrl || ""
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi această categorie?")) {
            try {
                await api.delete(`/categories/${id}`);
                loadCategories();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const filtered = categories.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase())
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
                        Categories
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {categories.length} categorii înregistrate
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setEditingCategory(null);
                        setForm(emptyForm);
                        setShowModal(true);
                    }}>
                    <Plus size={16}/> Add Category
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
                    placeholder="Caută categorie..."
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

            {/* CARDS GRID */}
            {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#8aaa85" }}>
                    Loading...
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginBottom: "16px"
                }}>
                    {filtered.length === 0 ? (
                        <div style={{
                            gridColumn: "1/-1",
                            padding: "40px",
                            textAlign: "center",
                            color: "#8aaa85",
                            background: "white",
                            borderRadius: "12px"
                        }}>
                            Nu s-au găsit categorii
                        </div>
                    ) : (
                        filtered.map((category) => (
                            <div key={category.id} style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0 2px 12px rgba(45,90,39,0.08)",
                                border: "1px solid rgba(45,90,39,0.06)",
                                borderTop: "3px solid #3d7a35"
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "10px"
                                }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px"
                                    }}>
                                        <div style={{
                                            width: "36px", height: "36px",
                                            background: "#e8f5e3",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            {category.iconUrl ? (
                                                <img
                                                    src={category.iconUrl}
                                                    alt={category.name}
                                                    style={{
                                                        width: "20px",
                                                        height: "20px",
                                                        objectFit: "contain"
                                                    }}
                                                />
                                            ) : (
                                                <Tag size={18} color="#3d7a35"/>
                                            )}
                                            {/*<Tag size={18} color="#3d7a35"/>*/}
                                        </div>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: "14px",
                                            color: "#1a2e18"
                                        }}>
                                            {category.name}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            style={styles.iconBtn("#3d7a35")}
                                            onClick={() => handleEdit(category)}>
                                            <Edit2 size={14}/>
                                        </button>
                                        <button
                                            style={styles.iconBtn("#e05252")}
                                            onClick={() => handleDelete(category.id)}>
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                </div>
                                <p style={{
                                    fontSize: "12px",
                                    color: "#8aaa85",
                                    margin: "0 0 10px"
                                }}>
                                    {category.description || "Fără descriere"}
                                </p>
                                <div style={{
                                    fontSize: "11px",
                                    color: "#8aaa85"
                                }}>
                                    Creat: {category.createdAt
                                    ? new Date(category.createdAt)
                                        .toLocaleDateString("ro-RO")
                                    : "-"}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* FOOTER */}
            <div style={{
                fontSize: "12px",
                color: "#8aaa85",
                textAlign: "right"
            }}>
                Afișare {filtered.length} din {categories.length} categorii
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
                            <h2 style={{
                                fontSize: "18px", fontWeight: 700,
                                color: "#1a2e18", margin: 0,
                                fontFamily: "Georgia, serif"
                            }}>
                                {editingCategory ? "Edit Category" : "Add Category"}
                            </h2>
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
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    border: "none", background: "none",
                                    cursor: "pointer"
                                }}>
                                <X size={20} color="#8aaa85"/>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {[
                                { label: "Name", key: "name", type: "text" },
                                { label: "Icon URL", key: "iconUrl", type: "text" },
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: "16px" }}>
                                    <label style={{
                                        display: "block", fontSize: "12px",
                                        fontWeight: 600, color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        value={form[field.key]}
                                        onChange={(e) => setForm({
                                            ...form,
                                            [field.key]: e.target.value
                                        })}
                                        required={field.key === "name"}
                                        style={{
                                            width: "100%", padding: "9px 12px",
                                            border: "1.5px solid rgba(45,90,39,0.15)",
                                            borderRadius: "8px", fontSize: "13px",
                                            outline: "none", background: "#faf6ee",
                                            color: "#1a2e18", boxSizing: "border-box"
                                        }}
                                    />
                                </div>
                            ))}

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    display: "block", fontSize: "12px",
                                    fontWeight: 600, color: "#4a6645",
                                    marginBottom: "6px"
                                }}>
                                    Description
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({
                                        ...form,
                                        description: e.target.value
                                    })}
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

                            <div style={{
                                display: "flex", gap: "10px",
                                justifyContent: "flex-end"
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: "9px 18px", borderRadius: "8px",
                                        border: "1.5px solid rgba(45,90,39,0.2)",
                                        background: "transparent", color: "#4a6645",
                                        fontSize: "13px", fontWeight: 600,
                                        cursor: "pointer"
                                    }}>
                                    Cancel
                                </button>
                                <button type="submit" style={styles.btn("#3d7a35")}>
                                    <Check size={16}/>
                                    {editingCategory ? "Update" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;