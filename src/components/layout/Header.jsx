import { Bell, Search, User } from "lucide-react";
import { useState } from "react";

const Header = ({ title }) => {
    const [searchValue, setSearchValue] = useState("");

    return (
        <header style={{
            height: "60px",
            background: "#f0e8d8",
            borderBottom: "1px solid rgba(45,90,39,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "fixed",
            top: 0,
            left: "220px",
            right: 0,
            zIndex: 99,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}>

            {/* LEFT — Title */}
            <div>
                <span style={{ color: "#4a6645", fontSize: "13px" }}>
                    Welcome to{" "}
                </span>
                <span style={{
                    color: "#2d5a27",
                    fontWeight: 700,
                    fontSize: "15px"
                }}>
                    EduPlatform
                </span>
                <span style={{ color: "#4a6645", fontSize: "13px" }}>
                    {" "}Management
                </span>
            </div>

            {/* RIGHT */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "14px"
            }}>

                {/* Search */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "white",
                    border: "1px solid rgba(45,90,39,0.15)",
                    borderRadius: "8px",
                    padding: "6px 14px",
                }}>
                    <Search size={14} color="#8aaa85"/>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        style={{
                            border: "none",
                            outline: "none",
                            fontSize: "13px",
                            color: "#1a2e18",
                            background: "transparent",
                            width: "160px"
                        }}
                    />
                </div>

                {/* Bell */}
                <div style={{
                    width: "36px", height: "36px",
                    background: "white",
                    border: "1px solid rgba(45,90,39,0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative"
                }}>
                    <Bell size={16} color="#4a6645"/>
                    <div style={{
                        position: "absolute",
                        top: "6px", right: "6px",
                        width: "8px", height: "8px",
                        background: "#e8824a",
                        borderRadius: "50%",
                        border: "2px solid #f0e8d8"
                    }}/>
                </div>

                {/* Avatar */}
                <div style={{
                    width: "36px", height: "36px",
                    background: "#3d7a35",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}>
                    <User size={18} color="white"/>
                </div>
            </div>
        </header>
    );
};

export default Header;