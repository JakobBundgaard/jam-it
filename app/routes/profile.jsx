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
            hostedJams.map((jam) => {
              const placesLeft = jam.maxAttendees - jam.attendees.length;
              return (
                <Link
                  key={jam._id}
                  to={`/jam/${jam._id}`}
                  className="entry-link"
                >
                  <div className="entry mt-4 bg-slate-300 rounded-lg">
                    <p className="text-2xl p-1">{jam.title}</p>
                    {placesLeft <= 0 ? (
                      <div className="full-badge bg-red-500 text-white p-2 rounded">
                        Event Full
                      </div>
                    ) : placesLeft <= 5 ? (
                      <div className="places-left-badge bg-yellow-500 text-white p-2 rounded">
                        Only {placesLeft} places left!
                      </div>
                    ) : null}
                    <p className="text-xl italic text-gray-900 p-1">
                      {jam.location.name}
                    </p>
                    <p className="p-1">{new Date(jam.date).toLocaleString()}</p>
                    <p className="text-gray-500 p-1">{jam.text}</p>
                  </div>
                </Link>
              );
            })
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
            attendingJams.map((jam) => {
              const placesLeft = jam.maxAttendees - jam.attendees.length;
              return (
                <Link
                  key={jam._id}
                  to={`/jam/${jam._id}`}
                  className="entry-link"
                >
                  <div
                    key={jam._id}
                    className="bg-slate-300 mt-4 rounded-lg shadow-md"
                  >
                    {placesLeft <= 0 ? (
                      <div className="full-badge bg-red-500 text-white p-2 rounded">
                        Event Full
                      </div>
                    ) : placesLeft <= 5 ? (
                      <div className="places-left-badge bg-yellow-500 text-white p-2 rounded">
                        Only {placesLeft} place{placesLeft === 1 ? "" : "s"}{" "}
                        left!
                      </div>
                    ) : null}
                    <p className="text-2xl p-1">{jam.title}</p>

                    <p className="text-xl italic text-gray-900 p-1">
                      {jam.location.name}
                    </p>
                    <p className="p-1">{new Date(jam.date).toLocaleString()}</p>
                    <p className="text-gray-500 p-1">{jam.text}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-center text-xl">
              You are not attending any jams currently.
            </p>
          )}
        </div>
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
