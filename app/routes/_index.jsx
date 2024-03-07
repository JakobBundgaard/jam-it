import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useRef, useState } from "react";
// import { authenticator } from "../services/auth.server";
import { useSearchParams } from "@remix-run/react";

export async function loader({ request }) {
  // await authenticator.isAuthenticated(request, {
  //   failureRedirect: "/signin",
  // });

  const url = new URL(request.url);
  const eventName = url.searchParams.get("eventName");
  const locationName = url.searchParams.get("location");
  const date = url.searchParams.get("date");

  let query = {};
  if (eventName) query.title = new RegExp(eventName, "i");
  if (locationName) query["location.name"] = new RegExp(locationName, "i");

  if (date) {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    query.date = {
      $gte: startDate,
    };
  }

  const entries = await mongoose.models.Entry.find(query).exec();
  return json({ entries });
}

export default function Index() {
  const { entries } = useLoaderData();
  const fetcher = useFetcher();
  const textareaRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [eventName, setEventName] = useState(
    searchParams.get("eventName") || "",
  );
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");

  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const eventName = formData.get("eventName");
    const location = formData.get("location");
    const date = formData.get("date");

    const searchParams = new URLSearchParams();

    if (eventName) searchParams.append("eventName", eventName);
    if (location) searchParams.append("location", location);
    if (date) searchParams.append("date", date);

    // Redirect to the current page with the search parameters
    setSearchParams(searchParams, { replace: true });
  }

  function handleReset() {
    setEventName("");
    setLocation("");
    setDate("");
    setSearchParams({});
  }

  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 text-center bg-slate-500 rounded-lg shadow-md">
      <h1 className="text-5xl text-center p-3">Welcome To Jam-It</h1>
      <h2 className="text-3xl italic text-center pb-1">
        Your Portal For Jam Events
      </h2>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          name="eventName"
          placeholder="Search by event name"
          className="m-2 p-1 rounded"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <input
          type="text"
          name="location"
          placeholder="Search by location"
          className="m-2 p-1 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="date"
          name="date"
          placeholder="Search by date"
          className="m-2 p-1 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          type="submit"
          className="w-40 bg-slate-600 hover:bg-slate-700 text-white font-bold m-2 py-2 px-4 rounded-md"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="w-40 bg-slate-600 hover:bg-slate-700 text-white font-bold m-2 py-2 px-4 rounded-md"
        >
          Reset
        </button>
      </form>

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
