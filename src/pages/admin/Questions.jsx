import React, { useState, useEffect } from "react";
import axiosConfig from "../../api/axiosConfig";
import { Check, Edit2, Plus, Search, Trash2, X } from "lucide-react";

const ANSWER_OPTIONS = ["A", "B", "C", "D"];

export default function Questions() {
    const [questions, setQuestions] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswers: [],
        points: 1,
        quiz: { id: "" }
    });
    const [editingId, setEditingId] = useState(null);

    // Compute filtered questions without storing state
    const filteredQuestions = questions.filter((question) => {
        const searchLower = searchValue.toLowerCase();
        const textMatch = question.text?.toLowerCase().includes(searchLower);
        const quizMatch = question.quiz?.title?.toLowerCase().includes(searchLower);
        const optionsMatch =
            question.optionA?.toLowerCase().includes(searchLower) ||
            question.optionB?.toLowerCase().includes(searchLower) ||
            question.optionC?.toLowerCase().includes(searchLower) ||
            question.optionD?.toLowerCase().includes(searchLower);

        return textMatch || quizMatch || optionsMatch;
    });

    const emptyForm = {
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswers: [],
        points: 1,
        quiz: { id: "" }
    };

    // Fetch questions and quizzes on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [questionsRes, quizzesRes] = await Promise.all([
                    axiosConfig.get("/questions"),
                    axiosConfig.get("/quizzes")
                ]);
                setQuestions(questionsRes.data);
                setQuizzes(quizzesRes.data);
            } catch (err) {
                console.error("Error fetching data:", err.response?.data || err.message);
            }
        };
        fetchData();
    }, []);


    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        // Filtering will be handled by the useEffect that watches searchValue
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

    const handleQuizChange = (e) => {
        const quizId = e.target.value;
        setForm((prev) => ({
            ...prev,
            quiz: { id: quizId }
        }));
    };

    const handleCorrectAnswerChange = (answer) => {
        setForm((prev) => {
            const currentAnswers = prev.correctAnswers || [];
            if (currentAnswers.includes(answer)) {
                // Remove if already selected
                return {
                    ...prev,
                    correctAnswers: currentAnswers.filter((a) => a !== answer)
                };
            } else {
                // Add if not selected
                return {
                    ...prev,
                    correctAnswers: [...currentAnswers, answer]
                };
            }
        });
    };

    const handleEdit = (question) => {
        // Parse correctAnswers from backend (could be comma-separated string or array)
        let correctAnswersArray = [];
        if (typeof question.correctAnswers === 'string') {
            correctAnswersArray = question.correctAnswers.split(',').map((a) => a.trim());
        } else if (Array.isArray(question.correctAnswers)) {
            correctAnswersArray = question.correctAnswers;
        }

        setForm({
            text: question.text,
            optionA: question.optionA,
            optionB: question.optionB,
            optionC: question.optionC,
            optionD: question.optionD,
            correctAnswers: correctAnswersArray,
            points: question.points,
            quiz: { id: question.quiz.id }
        });
        setEditingId(question.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.text ||
            !form.optionA ||
            !form.optionB ||
            !form.optionC ||
            !form.optionD ||
            form.correctAnswers.length === 0 ||
            !form.points ||
            !form.quiz.id
        ) {
            alert("Please fill all fields and select at least one correct answer");
            return;
        }

        const payload = {
            text: form.text,
            optionA: form.optionA,
            optionB: form.optionB,
            optionC: form.optionC,
            optionD: form.optionD,
            correctAnswers: form.correctAnswers.join(","),
            points: Number.parseInt(form.points, 10),
            quiz: { id: Number.parseInt(form.quiz.id, 10) }
        };

        try {
            if (isEditing) {
                await axiosConfig.put(`/questions/${editingId}`, payload);
            } else {
                await axiosConfig.post("/questions", payload);
            }
            // Refetch questions
            const response = await axiosConfig.get("/questions");
            setQuestions(response.data);
            handleCloseModal();
        } catch (err) {
            console.error("Error saving question:", err.response?.data || err.message);
            alert("Failed to save question");
        }
    };

    const handleDelete = async (id) => {
        if (globalThis.confirm("Are you sure you want to delete this question?")) {
            try {
                await axiosConfig.delete(`/questions/${id}`);
                // Refetch questions
                const response = await axiosConfig.get("/questions");
                setQuestions(response.data);
            } catch (err) {
                console.error("Error deleting question:", err.response?.data || err.message);
                alert("Failed to delete question");
            }
        }
    };

    const formatCorrectAnswers = (correctAnswers) => {
        if (typeof correctAnswers === 'string') {
            return correctAnswers;
        }
        if (Array.isArray(correctAnswers)) {
            return correctAnswers.join(', ');
        }
        return 'N/A';
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
        })
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
                        Questions
                    </h1>
                    <p style={{ fontSize: "13px", color: "#8aaa85", margin: "4px 0 0" }}>
                        {questions.length} întrebări înregistrate
                    </p>
                </div>
                <button
                    style={styles.btn("#3d7a35")}
                    onClick={() => {
                        setForm(emptyForm);
                        setIsEditing(false);
                        setEditingId(null);
                        setShowModal(true);
                    }}>
                    <Plus size={16} /> Add Question
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
                    placeholder="Caută după text, opțiuni sau quiz..."
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
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "10%" }} />
                        <col style={{ width: "8%" }} />
                        <col style={{ width: "12%" }} />
                        <col style={{ width: "11%" }} />
                    </colgroup>
                    <thead>
                    <tr style={{ background: "rgba(232,245,227,0.4)" }}>
                        {[
                            "#",
                            "Question",
                            "A",
                            "B",
                            "C",
                            "D",
                            "Correct",
                            "Quiz",
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
                    {filteredQuestions.length === 0 ? (
                        <tr>
                            <td colSpan={9} style={{
                                padding: "40px",
                                textAlign: "center",
                                color: "#8aaa85",
                                fontSize: "14px"
                            }}>
                                Nu s-au găsit întrebări
                            </td>
                        </tr>
                    ) : (
                        filteredQuestions.map((question, index) => (
                            <tr
                                key={question.id}
                                style={{ borderBottom: "1px solid rgba(45,90,39,0.06)" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,245,227,0.3)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#8aaa85" }}>
                                    {index + 1}
                                </td>
                                <td style={{ padding: "14px 18px", overflow: "hidden" }}>
                                    <div style={{ fontSize: "13px", color: "#1a2e18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {truncate(question.text, 70)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {truncate(question.optionA, 20)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {truncate(question.optionB, 20)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {truncate(question.optionC, 20)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "12px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {truncate(question.optionD, 20)}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <span style={styles.badge("#dcf5d8", "#2d7a27")}>
                                        {formatCorrectAnswers(question.correctAnswers)}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 18px", fontSize: "13px", color: "#4a6645", overflow: "hidden" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {quizzes.find((q) => q.id === question.quiz.id)?.title || "N/A"}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 18px" }}>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                            style={styles.iconBtn("#3d7a35")}
                                            onClick={() => handleEdit(question)}
                                            title="Edit">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            style={styles.iconBtn("#e05252")}
                                            onClick={() => handleDelete(question.id)}
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
                Afișare {filteredQuestions.length} din {questions.length} întrebări
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
                        width: "900px",
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
                                {isEditing ? "Edit Question" : "Add Question"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                style={{ border: "none", background: "none", cursor: "pointer", color: "#8aaa85" }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                                <div style={{ gridColumn: "span 2" }}>
                                    <label htmlFor="text" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Question Text *
                                    </label>
                                    <textarea
                                        id="text"
                                        name="text"
                                        value={form.text}
                                        onChange={handleInputChange}
                                        required
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
                                            fontFamily: "inherit",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px", marginTop: "16px" }}>
                                <div>
                                    <label htmlFor="optionA" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Option A *
                                    </label>
                                    <input
                                        id="optionA"
                                        type="text"
                                        name="optionA"
                                        value={form.optionA}
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
                                    <label htmlFor="optionB" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Option B *
                                    </label>
                                    <input
                                        id="optionB"
                                        type="text"
                                        name="optionB"
                                        value={form.optionB}
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
                                    <label htmlFor="optionC" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Option C *
                                    </label>
                                    <input
                                        id="optionC"
                                        type="text"
                                        name="optionC"
                                        value={form.optionC}
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
                                    <label htmlFor="optionD" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Option D *
                                    </label>
                                    <input
                                        id="optionD"
                                        type="text"
                                        name="optionD"
                                        value={form.optionD}
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
                            </div>

                            <div style={{ marginTop: "16px" }}>
                                <label style={{
                                    display: "block",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    color: "#4a6645",
                                    marginBottom: "10px"
                                }}>
                                    Correct Answers * (Select one or more)
                                </label>
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "16px",
                                    padding: "12px",
                                    background: "rgba(45,90,39,0.05)",
                                    borderRadius: "8px",
                                    border: "1.5px solid rgba(45,90,39,0.15)"
                                }}>
                                    {ANSWER_OPTIONS.map((option) => (
                                        <div key={option} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <input
                                                type="checkbox"
                                                id={`correct-${option}`}
                                                checked={form.correctAnswers.includes(option)}
                                                onChange={() => handleCorrectAnswerChange(option)}
                                                style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                            />
                                            <label htmlFor={`correct-${option}`} style={{
                                                fontSize: "13px",
                                                fontWeight: 500,
                                                color: "#1a2e18",
                                                cursor: "pointer"
                                            }}>
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px", marginTop: "16px" }}>
                                <div>
                                    <label htmlFor="points" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Points *
                                    </label>
                                    <input
                                        id="points"
                                        type="number"
                                        name="points"
                                        value={form.points}
                                        onChange={handleInputChange}
                                        min="1"
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
                                    <label htmlFor="quiz" style={{
                                        display: "block",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "#4a6645",
                                        marginBottom: "6px"
                                    }}>
                                        Quiz *
                                    </label>
                                    <select
                                        id="quiz"
                                        value={form.quiz.id}
                                        onChange={handleQuizChange}
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
                                        <option value="">Selectează quizzul</option>
                                        {quizzes.map((quiz) => (
                                            <option key={quiz.id} value={quiz.id}>
                                                {quiz.title}
                                            </option>
                                        ))}
                                    </select>
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
