import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <div style={{
            display: "flex",
            minHeight: "100vh",
            background: "#faf6ee"
        }}>

            {/* SIDEBAR */}
            <Sidebar/>

            {/* MAIN CONTENT */}
            <div style={{
                marginLeft: "220px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh"
            }}>

                {/* HEADER */}
                <Header/>

                {/* PAGE CONTENT */}
                <main style={{
                    marginTop: "60px",
                    padding: "24px 28px",
                    flex: 1,
                    overflowY: "auto"
                }}>
                    <Outlet/>
                </main>
            </div>
        </div>
    );
};

export default Layout;