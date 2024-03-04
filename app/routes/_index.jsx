import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useRef } from "react";
import { format } from "date-fns"; // Ensure you have date-fns installed for formatting dates

export async function loader() {
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
    <div className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md">
      <h1 className="text-5xl text-center">Jam It</h1>
      <p className="text-xl italic text-center">Create a new Jam It entry</p>

      <div className="my-8 border p-3">
        <fetcher.Form method="post" className="mt-2">
          <fieldset
            className="disabled:opacity-70"
            disabled={fetcher.state === "submitting"}
          >
            <div>
              <div>
                <input
                  type="datetime-local"
                  name="date"
                  required
                  className="text-gray-900 p-1"
                  defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <textarea
                  ref={textareaRef}
                  placeholder="Type your entry..."
                  name="text"
                  required
                  className="w-full text-gray-700 p-1"
                />
              </div>
              <p className="text-xl">Location</p>
              <div className="mt-4">
                <input
                  type="text"
                  name="location[name]"
                  placeholder="Location Name"
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  name="location[street]"
                  placeholder="Street"
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <input
                  type="number"
                  name="location[zip]"
                  placeholder="ZIP Code"
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  name="location[city]"
                  placeholder="City"
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
            </div>

            <div className="mt-2 text-right">
              <button
                type="submit"
                className="bg-slate-500 px-4 py-1 font-semibold text-white"
              >
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>

      {entries.map((entry) => (
        <div key={entry._id} className="mt-4">
          <p className="font-bold p-1">{entry.title}</p>
          <p className="p-1">{new Date(entry.date).toLocaleString()}</p>

          <p className=" text-gray-500 p-1">{entry.text}</p>
          <p className="text-xl italic text-gray-900 p-1">
            {entry.location.name}
          </p>
          <p className=" text-gray-700 p-1">{entry.location.street}</p>
          <p className=" text-gray-700 p-1">
            {entry.location.zip} , {entry.location.city}
          </p>
        </div>
      ))}
    </div>
  );
}
