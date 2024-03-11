import { json, redirect } from "@remix-run/node";
import { useFetcher, useNavigate, useLoaderData } from "@remix-run/react";
import mongoose from "mongoose";
import { useEffect, useRef } from "react";
import { format } from "date-fns"; // Ensure you have date-fns installed for formatting dates
import { authenticator } from "../services/auth.server";
import { sessionStorage } from "../services/session.server";
import banner from "../images/banner.png";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  const error = session.get("sessionErrorKey");

  session.unset("sessionErrorKey");

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  const entries = await mongoose.models.Entry.find({});
  return json({ entries, error }, { headers });
}

export default function AddJam() {
  //   const { entries } = useLoaderData();
  const loaderData = useLoaderData();
  const fetcher = useFetcher();
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const isIdle = fetcher.state === "idle";
  const isInit = isIdle && fetcher.data == null;

  useEffect(() => {
    if (!isInit && isIdle && textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
  }, [isInit, isIdle]);

  function handleCancel() {
    navigate(-1);
  }

  return (
    <>
      <div>
        <img className="w-full" src={banner} alt="" />
      </div>
      <div className="flex flex-col max-w-xl mx-auto my-10 p-6 text-center rounded-lg shadow-md">
        <h1 className="text-4xl text-white mb-4 uppercase">Create Jam Event</h1>

        <div>
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
                    className="text-gray-900 p-2 rounded"
                    defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  />
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    required
                    className="w-full text-gray-900 p-2 rounded"
                  />
                </div>

                <div className="mt-4">
                  <input
                    type="number"
                    name="maxAttendees"
                    placeholder="Maximum Attendees"
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
                    required
                    className="w-full text-gray-700 p-2 rounded"
                  />
                </div>

                <p className="text-xl text-white">Location</p>
                <div className="mt-4">
                  <input
                    type="text"
                    name="location[name]"
                    placeholder="Location Name"
                    required
                    className="w-full text-gray-900 p-2 rounded"
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    name="location[street]"
                    placeholder="Street"
                    required
                    className="w-full text-gray-900 p-2 rounded"
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="number"
                    name="location[zip]"
                    placeholder="ZIP Code"
                    required
                    className="w-full text-gray-900 p-2 rounded"
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    name="location[city]"
                    placeholder="City"
                    required
                    className="w-full text-gray-900 p-2 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  type="submit"
                  className="w-40 bg-[#4972b6]  hover:bg-blue-800 text-white font-bold mt-2 py-2 px-4 rounded-md"
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
              <div className="error-message text-red-600 mt-2">
                {loaderData?.error ? <p>{loaderData?.error?.message}</p> : null}
              </div>
            </fieldset>
          </fetcher.Form>
        </div>
      </div>
    </>
  );
}

export async function action({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  try {
    const formData = await request.formData();
    const date = formData.get("date");
    const title = formData.get("title");
    const text = formData.get("text");
    const maxAttendees = parseInt(formData.get("maxAttendees"), 10);

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
      maxAttendees,
      text,
      location,
      userID: user._id, // Ensure this matches your schema field for the user reference
    };

    if (!date || title || !maxAttendees || !text || !location || !user._id) {
      return json(
        { error: "All fileds required" },
        {
          status: 400,
        },
      );
    }

    const result = await mongoose.models.Entry.create(jam);
    if (result) {
      return redirect("/profile", {
        headers: {
          "Set-Cookie": await sessionStorage.destroySession(session),
        },
      });
    }
  } catch (error) {
    let errorMessage = "Failed to add jam, please try again.";
    // Check if the error is a Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = error.errors;
      // Collect all validation messages into a single string or an array, depending on your preference
      errorMessage = Object.values(errors)
        .map((err) => err.message)
        .join(", ");
    }

    session.flash("sessionErrorKey", { message: errorMessage });
    //   return redirect("/profile");
    // } catch (error) {
    //   // Catch validation errors and other errors here
    //   const session = await sessionStorage.getSession(
    //     request.headers.get("Cookie"),
    //   );
    //   session.flash("sessionErrorKey", error.message); // Using flash to show the message once

    return redirect("/add-jam", {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }
}

// export async function action({ request }) {
//   const user = await authenticator.isAuthenticated(request, {
//     failureRedirect: "/signin",
//   });
//   const formData = await request.formData();
//   const date = formData.get("date");
//   const title = formData.get("title");
//   const text = formData.get("text");
//   const maxAttendees = parseInt(formData.get("maxAttendees"), 10);

//   // Manually construct the location object
//   const location = {
//     name: formData.get("location[name]"),
//     street: formData.get("location[street]"),
//     zip: parseInt(formData.get("location[zip]"), 10), // Ensure zip is a number
//     city: formData.get("location[city]"),
//   };

//   // Construct the jam object with the location object included
//   const jam = {
//     date,
//     title,
//     maxAttendees,
//     text,
//     location,
//     userID: user._id, // Ensure this matches your schema field for the user reference
//   };

//   await mongoose.models.Entry.create(jam);

//   return redirect("/profile");
// }
