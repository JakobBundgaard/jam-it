import { Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const hostedJams = await mongoose.models.Entry.find({
    userID: user._id,
  })
    .sort({ date: 1 })
    .exec();
  const attendingJams = await mongoose.models.Entry.find({
    attendees: user._id,
  })
    .sort({ date: 1 })
    .exec();

  return { user, hostedJams, attendingJams };
}

export default function Profile() {
  const { user, hostedJams, attendingJams } = useLoaderData();

  return (
    <div>
      <div className="max-w-2xl mx-auto my-10 p-6 text-center bg-slate-500 rounded-lg shadow-md">
        <h1 className="text-5xl text-center p-3">Welcome {user.username}</h1>
        <div className="entries-list">
          <h2 className="text-3xl italic text-center">Your Jams</h2>
          {hostedJams.length > 0 ? (
            hostedJams.map((jam) => (
              <Link key={jam._id} to={`/jam/${jam._id}`} className="entry-link">
                <div className="entry mt-4 bg-slate-300 rounded-lg">
                  <p className="text-2xl p-1">{jam.title}</p>
                  <p className="text-xl italic text-gray-900 p-1">
                    {jam.location.name}
                  </p>
                  <p className="p-1">{new Date(jam.date).toLocaleString()}</p>
                  <p className="text-gray-500 p-1">{jam.text}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-xl">
              You are not hosting any jams currently.
            </p>
          )}
        </div>

        {/* Jams the user is attending */}
        <div className="entries-list">
          <h2 className="text-3xl italic text-center p-2">
            Jams You Are Attending
          </h2>
          {attendingJams.length > 0 ? (
            attendingJams.map((jam) => (
              <Link key={jam._id} to={`/jam/${jam._id}`} className="entry-link">
                <div
                  key={jam._id}
                  className="bg-slate-300 mt-4 rounded-lg shadow-md"
                >
                  <p className="text-2xl p-1">{jam.title}</p>
                  <p className="text-xl italic text-gray-900 p-1">
                    {jam.location.name}
                  </p>
                  <p className="p-1">{new Date(jam.date).toLocaleString()}</p>
                  <p className="text-gray-500 p-1">{jam.text}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-xl">
              You are not attending any jams currently.
            </p>
          )}
        </div>

        {/* <Form
          method="post"
          className="flex items-center justify-center space-x-4"
        >
          <button className="w-40 bg-slate-600 hover:bg-slate-700 text-white font-bold m-2 py-2 px-4 rounded-md">
            Logout
          </button>
        </Form> */}
      </div>
    </div>
  );
}

export async function action({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  await authenticator.logout(request, { redirectTo: "/signin" });
}
