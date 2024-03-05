import { json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useRef } from "react";
import { format } from "date-fns"; // Ensure you have date-fns installed for formatting dates
import { authenticator } from "../services/auth.server";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const entries = await mongoose.models.Entry.find({});
  return json({ entries });
}

export default function AddJam() {
  //   const { entries } = useLoaderData();
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
      <h1 className="text-5xl text-center">Create Jam Event</h1>

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
    </div>
  );
}

export async function action({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
  const formData = await request.formData();
  const date = formData.get("date");
  const title = formData.get("title");
  const text = formData.get("text");

  // Manually construct the location object
  const location = {
    name: formData.get("location[name]"),
    street: formData.get("location[street]"),
    zip: parseInt(formData.get("location[zip]"), 10), // Ensure zip is a number
    city: formData.get("location[city]"),
  };

  // Construct the jam object with the location object included
  const jam = {
    date,
    title,
    text,
    location,
    userID: user._id, // Ensure this matches your schema field for the user reference
  };

  await mongoose.models.Entry.create(jam);

  return redirect("/profile");
}

// export async function action({ request }) {
//   const formData = await request.formData();
//   const jam = Object.fromEntries(formData);

//   const user = await authenticator.isAuthenticated(request, {
//     failureRedirect: "/signin",
//   });

//   jam.user = user._id;

//   await mongoose.models.Entry.create(jam);

//   return redirect("/");
// }
