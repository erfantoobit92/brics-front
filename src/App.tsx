import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import LoadingSpinner from "./components/LoadingSpinner";
import TapPage from "./pages/TapPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import FriendsPage from "./pages/FriendsPage"; // ایمپورت صفحه جدید

import "./index.css";
import ProfilePage from "./pages/ProfilePage";
import MiningPage from "./pages/MiningPage";

function App() {
  const { isLoading, token } = useAppContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    // This could be a more user-friendly error page
    return (
      <div className="text-center mt-20">
        Authentication failed. Please restart the app.
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen w-screen flex flex-col">
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<TapPage />} />
            <Route path="/mine" element={<MiningPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
