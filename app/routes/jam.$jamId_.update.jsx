import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useRef } from "react";
// import { format } from "date-fns";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";

// export function meta() {
//   return [
//     {
//       title: "Remix Post App - Update"
//     }
//   ];
// }

export async function loader({ params, request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const jam = await mongoose.models.Entry.findOne({
    _id: params.jamId,
  })
    .populate("attendees", "username") // This populates the `attendees` field, retrieving the `username` of each attendee
    .exec();
  return json({ jam });
}

export default function UpdateJam() {
  const { jam } = useLoaderData();
  const fetcher = useFetcher();
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Adjust date for local timezone to use as defaultValue
  const eventDate = new Date(jam.date);
  const timeZoneOffset = eventDate.getTimezoneOffset();
  eventDate.setMinutes(eventDate.getMinutes() - timeZoneOffset);
  const localDateTimeString = eventDate.toISOString().slice(0, 16);

  function handleCancel() {
    navigate(-1);
  }

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md">
      <h1 className="text-5xl text-center">Update Jam Event</h1>

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
                  defaultValue={localDateTimeString} // Set the adjusted local date time as defaultValue
                />
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  defaultValue={jam.title}
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <textarea
                  ref={textareaRef}
                  placeholder="Type your entry..."
                  name="text"
                  defaultValue={jam.text}
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
                  defaultValue={jam.location.name}
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  name="location[street]"
                  placeholder="Street"
                  defaultValue={jam.location.street}
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <input
                  type="number"
                  name="location[zip]"
                  placeholder="ZIP Code"
                  defaultValue={jam.location.zip}
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  name="location[city]"
                  placeholder="City"
                  defaultValue={jam.location.city}
                  required
                  className="w-full text-gray-900 p-1"
                />
              </div>
            </div>

            <div className="btns flex items-center justify-center space-x-4">
              <button
                type="submit"
                className="w-40 bg-slate-500 hover:bg-slate-600 text-white font-bold mt-2 py-2 px-4 rounded-md"
              >
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="w-40 bg-slate-500 hover:bg-slate-600 text-white font-bold mt-2 py-2 px-4 rounded-md"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </fetcher.Form>
      </div>
    </div>
  );
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const date = formData.get("date");
  const title = formData.get("title");
  const text = formData.get("text");

  const location = {
    name: formData.get("location[name]"),
    street: formData.get("location[street]"),
    zip: parseInt(formData.get("location[zip]"), 10),
    city: formData.get("location[city]"),
  };

  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  await mongoose.models.Entry.updateOne(
    { _id: params.jamId },
    { $set: { date, title, text, location, userID: user._id } },
  );

  return redirect("/profile");
}
