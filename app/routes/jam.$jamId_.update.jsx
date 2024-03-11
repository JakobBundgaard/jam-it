import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useRef } from "react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";
import banner from "../images/banner.png";

export async function loader({ params, request }) {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const jam = await mongoose.models.Entry.findOne({
    _id: params.jamId,
  })
    .populate("attendees", "username") // This populates the `attendees` field, retrieving the `username` of each attendee
    .exec();

  if (currentUser._id !== jam.userID) {
    throw new Response(null, { status: 401, message: "not autherized" });
  }

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
    <>
      <div>
        <img className="w-full" src={banner} alt="" />
      </div>
      <div
        id="sign-in-page"
        className="flex flex-col max-w-xl mx-auto my-10 p-6 text-center  rounded-lg shadow-md"
      >
        <div className="max-w-2xl mx-auto my-10 p-6 rounded-lg shadow-md">
          <h1 className="text-4xl text-center mb-4 uppercase text-white">
            Update Jam Event
          </h1>

          <div className="my-8 p-3">
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
                      className="text-gray-900 border w-full p-2 rounded-md"
                      defaultValue={localDateTimeString}
                    />
                  </div>

                  <div className="mt-4">
                    <input
                      type="text"
                      name="title"
                      placeholder="Title"
                      defaultValue={jam.title}
                      required
                      className="text-gray-900 border w-full p-2 rounded-md"
                    />
                  </div>
                  <div className="mt-4">
                    <input
                      type="number"
                      name="maxAttendees"
                      placeholder="Maximum Attendees"
                      defaultValue={jam.maxAttendees}
                      required
                      className="w-full text-gray-900 p-2 rounded"
                      min="1"
                    />
                  </div>
                  <div className="mt-4">
                    <textarea
                      ref={textareaRef}
                      placeholder="Type your entry..."
                      name="text"
                      defaultValue={jam.text}
                      required
                      className="text-gray-900 border w-full p-2 rounded-md"
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
                      className="text-gray-900 border w-full p-2 rounded-md"
                    />
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      name="location[street]"
                      placeholder="Street"
                      defaultValue={jam.location.street}
                      required
                      className="text-gray-900 border w-full p-2 rounded-md"
                    />
                  </div>
                  <div className="mt-4">
                    <input
                      type="number"
                      name="location[zip]"
                      placeholder="ZIP Code"
                      defaultValue={jam.location.zip}
                      required
                      className="text-gray-900 border w-full p-2 rounded-md"
                    />
                  </div>
                  <div className="mt-4">
                    <input
                      type="text"
                      name="location[city]"
                      placeholder="City"
                      defaultValue={jam.location.city}
                      required
                      className="text-gray-900 border w-full p-2 rounded-md"
                    />
                  </div>
                </div>

                <div className="btns flex items-center justify-center space-x-4">
                  <button
                    type="submit"
                    className="w-40 bg-[#4972b6] hover:bg-blue-800 text-white font-bold mt-2 py-2 px-4 rounded-md"
                  >
                    {fetcher.state === "submitting" ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="w-40 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </fieldset>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </>
  );
}

export async function action({ request, params }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
  const formData = await request.formData();
  const date = formData.get("date");
  const title = formData.get("title");
  const text = formData.get("text");
  const maxAttendees = parseInt(formData.get("maxAttendees"), 10);

  const location = {
    name: formData.get("location[name]"),
    street: formData.get("location[street]"),
    zip: parseInt(formData.get("location[zip]"), 10),
    city: formData.get("location[city]"),
  };

  await mongoose.models.Entry.updateOne(
    { _id: params.jamId },
    { $set: { date, title, maxAttendees, text, location, userID: user._id } },
  );

  return redirect("/profile");
}
