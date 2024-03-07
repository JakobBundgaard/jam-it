import { NavLink, useFetcher } from "@remix-run/react";

export default function Nav({ isAuthenticated }) {
  const fetcher = useFetcher();

  const handleLogout = async () => {
    fetcher.submit({}, { method: "post", action: "/logout" });
  };

  return (
    <nav className="w-full mx-auto my-10 p-6 bg-gradient-to-r from-gray-700 to-black shadow-md flex justify-around items-center">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "text-slate-400 font-bold"
            : "text-slate-200 hover:text-slate-400"
        }
      >
        Jams
      </NavLink>

      {isAuthenticated ? (
        <>
          <NavLink
            to="/add-jam"
            className={({ isActive }) =>
              isActive
                ? "text-slate-400 font-bold"
                : "text-slate-200 hover:text-slate-400"
            }
          >
            Add Jam
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "text-slate-400 font-bold"
                : "text-slate-200 hover:text-slate-400"
            }
          >
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-slate-200 hover:text-slate-400"
          >
            Logout
          </button>
        </>
      ) : (
        <NavLink
          to="/signin"
          className={({ isActive }) =>
            isActive
              ? "text-slate-400 font-bold"
              : "text-slate-200 hover:text-slate-400"
          }
        >
          Sign In
        </NavLink>
      )}
    </nav>
  );
}
