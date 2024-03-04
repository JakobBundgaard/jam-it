import { NavLink } from "@remix-run/react";

export default function Nav() {
  return (
    <nav className="w-full mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md flex justify-around items-center">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "text-slate-900 font-bold"
            : "text-slate-600 hover:text-slate-900"
        }
      >
        Jams
      </NavLink>
      <NavLink
        to="/add-post"
        className={({ isActive }) =>
          isActive
            ? "text-slate-900 font-bold"
            : "text-slate-600 hover:text-slate-900"
        }
      >
        Add Jam
      </NavLink>
      {/* Uncomment if you have a users route */}
      {/* <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
          }
        >
          Users
        </NavLink> */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive
            ? "text-slate-900 font-bold"
            : "text-slate-600 hover:text-slate-900"
        }
      >
        Profile
      </NavLink>
    </nav>
  );
}
