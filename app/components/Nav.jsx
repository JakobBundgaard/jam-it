import { NavLink, useFetcher } from "@remix-run/react";

export default function Nav({ isAuthenticated }) {
  const fetcher = useFetcher();

  const handleLogout = async () => {
    fetcher.submit({}, { method: "post", action: "/logout" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full text-xl  p-6 bg-[#050c24] shadow-md flex justify-center  items-center uppercase gap-4 sm:gap-8 md:gap-12 lg:gap-44">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "text-slate-400 " : "text-slate-200 hover:text-slate-400"
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
                ? "text-slate-400"
                : "text-slate-200 hover:text-slate-400"
            }
          >
            Add Jam
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive
                ? "text-slate-400"
                : "text-slate-200 hover:text-slate-400"
            }
          >
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-slate-200 hover:text-slate-400 uppercase"
          >
            Logout
          </button>
        </>
      ) : (
        <NavLink
          to="/signin"
          className={({ isActive }) =>
            isActive ? "text-slate-400 " : "text-slate-200 hover:text-slate-400"
          }
        >
          Sign In
        </NavLink>
      )}
    </nav>
  );
}
