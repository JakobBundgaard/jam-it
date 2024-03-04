import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
// import { format } from "date-fns";
// import Nav from "../components/Nav";

// export async function loader({ request }) {
//   return await authenticator.isAuthenticated(request, {
//     failureRedirect: "/signin",
//   });
// }

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  // Fetch user's entries
  //   const entries = await mongoose
  //     .model("Entry")
  //     .find({ userID: user._id })
  //     .exec(); // Replace with your actual Mongoose query

  const entries = await mongoose.models.Entry.find({ userID: user._id }).exec();
  // Return both the user and their entries
  return { user, entries };
}

export default function Profile() {
  const { user, entries } = useLoaderData();

  return (
    <div>
      <div className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md">
        <h1 className="text-5xl text-center">Welcome {user.username}</h1>
        <div className="entries-list">
          <h2 className="text-3xl text-center m-2">Your Jams</h2>
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="entry p-4 my-2 bg-slate-200 rounded-lg"
            >
              <h3 className="text-2xl">{entry.title}</h3>
              <p className="date">{new Date(entry.date).toLocaleString()}</p>
              <p className="text">{entry.text}</p>
              <p className="location">
                {entry.location.name}, {entry.location.city}
              </p>
            </div>
          ))}
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
