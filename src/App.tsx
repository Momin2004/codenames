import { Route, Routes } from "react-router-dom";
import Layout from "./utils/Layout";
import HomeOverview from "./pages/HomeOverview";
import LobbyOverview from "./pages/LobbyOverview";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="" element={<HomeOverview />} />
        <Route path=":lobbyId" element={<LobbyOverview />} />
      </Route>
    </Routes>
  );
}