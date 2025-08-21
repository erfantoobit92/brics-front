import { NavLink } from "react-router-dom";

const BottomNav = () => {
  // Replace with actual icons later
  const navItems = [
    { path: "/", label: "Tap" },
    { path: "/mine", label: "Mine" }, // لینک جدید
    { path: "/tasks", label: "Tasks" },
    { path: "/friends", label: "Friends" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <nav className="w-full bg-gray-800 p-2">
      <ul className="flex justify-around items-center">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${
                  isActive ? "text-yellow-400" : "text-gray-400"
                }`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
