import { NavLink } from "@remix-run/react";

export default function Nav() {
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
    </nav>
  );
}
