import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #ddd",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 10,
        }}
      >
        <strong>My Convex App</strong>
      </header>

      <NavBar />

      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}