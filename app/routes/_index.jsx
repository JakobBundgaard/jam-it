import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useRef, useState } from "react";
import { authenticator } from "../services/auth.server";
import { useSearchParams } from "@remix-run/react";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);
  const eventName = url.searchParams.get("eventName");
  const locationName = url.searchParams.get("location");
  const date = url.searchParams.get("date");

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let query = {
    date: { $gte: today },
  };

  if (eventName) query.title = new RegExp(eventName, "i");
  if (locationName) query["location.name"] = new RegExp(locationName, "i");

  if (date) {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    if (startDate >= today) {
      query.date = {
        $gte: startDate,
      };
    }
  }

  if (user) {
    query.userID = { $ne: user._id }; // Make sure userID is the correct field name
  }

  // Exclude jams the user is attending
  if (user) {
    query.attendees = { $nin: [user._id] };
  }

  let entries = await mongoose.models.Entry.find(query)
    .sort({ date: 1 })
    .populate("attendees")
    .exec();

  entries = entries.filter(
    (entry) => entry.attendees.length < entry.maxAttendees,
  );

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
    <div
      className="flex flex-col max-w-4xl mx-auto my-10 p-6 text-center bg-slate-500 rounded-lg shadow-md"
      style={{ maxWidth: "768px" }}
    >
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
        Welcome To Jam-It
      </h1>
      <h2 className="text-2xl font-light text-center text-gray-700 mb-6">
        Your Portal For Jam Events
      </h2>

      <form
        className="flex flex-wrap justify-center gap-4 mb-8"
        onSubmit={handleSearch}
      >
        <div className="flex gap-4">
          <input
            type="text"
            name="eventName"
            placeholder="Search by event name"
            className="flex-1 min-w-[200px] p-2 border rounded border-gray-300"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <input
            type="text"
            name="location"
            placeholder="Search by location"
            className="flex-1 min-w-[200px] p-2 border rounded border-gray-300"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="date"
            name="date"
            placeholder="Search by date"
            className="flex-1 min-w-[200px] p-2 border rounded border-gray-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Reset
          </button>
        </div>
      </form>

      {entries.map((entry) => {
        const placesLeft = entry.maxAttendees - entry.attendees.length;
        return (
          <Link key={entry._id} to={`/jam/${entry._id}`} className="entry-link">
            <div
              key={entry._id}
              className="block bg-gray-50 hover:bg-blue-50 focus:bg-blue-100 transition-colors duration-150 rounded-lg shadow px-6 py-4 mb-4 max-w-xl mx-auto"
              style={{ minHeight: "160px" }}
            >
              {placesLeft <= 5 && placesLeft > 0 ? (
                <span className="inline-block px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-300 rounded-full mb-2">
                  Only {placesLeft} place{placesLeft === 1 ? "" : "s"} left!
                </span>
              ) : null}
              <h3 className="text-xl font-bold text-gray-800">{entry.title}</h3>

              <p className="text-md text-gray-600">{entry.location.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{entry.text}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
