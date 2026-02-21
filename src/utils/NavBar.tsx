import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: "8px 12px",
  textDecoration: "none",
  borderRadius: 6,
  color: isActive ? "white" : "#222",
  background: isActive ? "#222" : "#f2f2f2",
});

export default function NavBar() {
  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
      }}
    >
      <NavLink to="/home" style={linkStyle}>
        Home
      </NavLink>
      <NavLink to="/game" style={linkStyle}>
        Game
      </NavLink>
    </nav>
  );
}