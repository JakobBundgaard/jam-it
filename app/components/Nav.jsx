import { NavLink } from "@remix-run/react";

export default function Nav() {
  return (
    <nav className="w-full mx-auto my-10 p-6 bg-slate-500 rounded-lg shadow-md flex justify-around items-center">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "text-slate-900 font-bold"
            : "text-slate-800 hover:text-slate-900"
        }
      >
        Jams
      </NavLink>
      <NavLink
        to="/add-jam"
        className={({ isActive }) =>
          isActive
            ? "text-slate-900 font-bold"
            : "text-slate-800 hover:text-slate-900"
        }
      >
        Add Jam
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive
            ? "text-slate-900 font-bold"
            : "text-slate-800 hover:text-slate-900"
        }
      >
        Profile
      </NavLink>
    </nav>
  );
}
