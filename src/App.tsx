import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import LoadingSpinner from "./components/LoadingSpinner";
import TapPage from "./pages/TapPage";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import FriendsPage from "./pages/FriendsPage"; // ایمپورت صفحه جدید
import { init } from "@telegram-apps/sdk-react";

import "./index.css";
import ProfilePage from "./pages/ProfilePage";
import MiningPage from "./pages/MiningPage";
import ExchangePage from "./pages/ExchangePage";
import TasksPage from "./pages/TasksPage";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import LanguageSelector from "./components/LanguageSelector";

function App() {
  const { i18n } = useTranslation();

  // چک می‌کنیم آیا زبانی قبلاً انتخاب شده یا نه
  const [showLanguageSelector, setShowLanguageSelector] = useState(
    !localStorage.getItem("userHasSelectedLanguage")
  );

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  const handleLanguageSelected = () => {
    setShowLanguageSelector(false);
  };

  useEffect(() => {
    init(); // SDK ready میشه
  }, []);

  const { isLoading, token, errorText } = useAppContext();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (errorText != null) {
    return <div className="text-center mt-20 text-red-500">{errorText}</div>;
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
      {showLanguageSelector && (
        <LanguageSelector onLanguageSelect={handleLanguageSelected} />
      )}
      <div className="h-screen w-screen flex flex-col">
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<TapPage />} />
            <Route path="/mine" element={<MiningPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change" element={<ExchangePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
