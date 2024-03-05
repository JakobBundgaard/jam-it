import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  // const entries = await mongoose.models.Entry.find({ userID: user._id }).exec();

  // return { user, entries };
  const hostedJams = await mongoose.models.Entry.find({
    userID: user._id,
  }).exec();
  const attendingJams = await mongoose.models.Entry.find({
    attendees: user._id,
  }).exec();

  return { user, hostedJams, attendingJams };
}

export default function Profile() {
  const { user, hostedJams, attendingJams } = useLoaderData();

  return (
    <div>
      <div className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md">
        <h1 className="text-5xl text-center">Welcome {user.username}</h1>
        <div className="entries-list">
          <h2 className="text-3xl text-center m-2">Your Jams</h2>
          {hostedJams.length > 0 ? (
            hostedJams.map((jam) => (
              <div
                key={jam._id}
                className="entry p-4 my-2 bg-slate-200 rounded-lg"
              >
                <h3 className="text-2xl">{jam.title}</h3>
                <p className="date">
                  Date: {new Date(jam.date).toLocaleString()}
                </p>
                <p className="text">Details: {jam.text}</p>
                <p className="location">
                  Location: {jam.location.name}, {jam.location.city}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-xl">
              You are not hosting any jams currently.
            </p>
          )}
        </div>

        {/* Jams the user is attending */}
        <div className="entries-list">
          <h2 className="text-3xl text-center m-2">Jams You Are Attending</h2>
          {attendingJams.length > 0 ? (
            attendingJams.map((jam) => (
              <div
                key={jam._id}
                className="entry p-4 my-2 bg-slate-200 rounded-lg"
              >
                <h3 className="text-2xl">{jam.title}</h3>
                <p className="date">
                  Date: {new Date(jam.date).toLocaleString()}
                </p>
                <p className="text">Details: {jam.text}</p>
                <p className="location">
                  Location: {jam.location.name}, {jam.location.city}
                </p>
              </div>
            ))
          ) : (
            <p className="text-center text-xl">
              You are not attending any jams currently.
            </p>
          )}
        </div>

        <Form method="post">
          <button className="w-40 bg-slate-500 hover:bg-slate-600 text-white font-bold m-2 py-2 px-4 rounded-md">
            Logout
          </button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }) {
  await authenticator.logout(request, { redirectTo: "/signin" });
}
