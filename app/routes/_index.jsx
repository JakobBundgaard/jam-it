import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useRef } from "react";
import { authenticator } from "../services/auth.server";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const entries = await mongoose.models.Entry.find({});
  return json({ entries });
}

export default function Index() {
  const { entries } = useLoaderData();
  const fetcher = useFetcher();
  const textareaRef = useRef(null);

  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 text-center bg-slate-500 rounded-lg shadow-md">
      <h1 className="text-5xl text-center p-3">Welcome To Jam-It</h1>
      <h2 className="text-3xl italic text-center">
        Your Portal For Jam Events
      </h2>

      {entries.map((entry) => (
        <Link key={entry._id} to={`/jam/${entry._id}`} className="entry-link">
          <div
            key={entry._id}
            className="bg-slate-300 mt-4 rounded-lg shadow-md"
          >
            <p className="text-2xl p-1">{entry.title}</p>
            <p className="text-xl italic text-gray-900 p-1">
              {entry.location.name}
            </p>
            <p className="p-1">{new Date(entry.date).toLocaleString()}</p>

            <p className=" text-gray-500 p-1">{entry.text}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
