import { json, redirect } from "@remix-run/node";
import {
  Link,
  Form,
  useLoaderData,
  useNavigate,
  useFetcher,
} from "@remix-run/react";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";

export async function loader({ params, request }) {
  let user;
  try {
    user = await authenticator.isAuthenticated(request);
  } catch (error) {
    user = null;
  }

  const jam = await mongoose.models.Entry.findOne({
    _id: params.jamId,
  })
    .populate("userID")
    .populate("attendees", "username")
    .exec();

  if (!jam) {
    throw new Error("Jam not found");
  }

  return json({ jam, user });
}

export default function Jam() {
  const { jam, user } = useLoaderData();
  const fetcher = useFetcher();

  function confirmDelete(event) {
    const response = confirm("Please confirm you want to delete this event.");
    if (!response) {
      event.preventDefault();
    }
  }

  const navigate = useNavigate();

  function handleCancel() {
    navigate(-1);
  }

  async function handleAttend(event) {
    event.preventDefault();

    // Prepare the data to be sent
    const formData = new FormData();
    formData.append("_action", "attend");

    // Use fetcher to submit the form data
    fetcher.submit(formData, {
      method: "post",
      action: `/jam/${jam._id}`, // Your route that handles the post request
    });
  }

  async function handleUnattend(event) {
    event.preventDefault();

    // Prepare the data to be sent
    const formData = new FormData();
    formData.append("_action", "unattend");

    // Use fetcher to submit the form data
    fetcher.submit(formData, {
      method: "post",
      action: `/jam/${jam._id}`, // Your route that handles the post request
    });
  }

  const isUserHost =
    user && jam.userID && jam.userID._id.toString() === user._id.toString();

  const isAlreadyAttending =
    user && jam.attendees.some((attendee) => attendee._id === user._id);

  return (
    <div className="max-w-2xl mx-auto text-center my-10 p-6 bg-slate-500 rounded-lg shadow-md">
      <div key={jam._id} className="entry p-4 my-2 bg-slate-200 rounded-lg">
        <h3 className="text-2xl">{jam.title}</h3>
        <p className="date">
          <b>Date:</b> {new Date(jam.date).toLocaleString()}
        </p>

        <p className="location">
          <b>Location:</b> {jam.location.name}, {jam.location.street} in{" "}
          {jam.location.city}
        </p>
        <p className="text">
          <b>Details:</b> {jam.text}
        </p>
        <p>
          <b>Host:</b> {jam.userID.username}
        </p>
        <div>
          <b>Attendees:</b>
          <ul>
            {jam.attendees.map((attendee) => (
              <li key={attendee._id}>{attendee.username}</li> // Displaying attendee usernames
            ))}
          </ul>
        </div>
      </div>
      <div className="btns flex items-center justify-center space-x-4">
        {isUserHost && (
          <>
            <Link
              to="update"
              className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
            >
              Update
            </Link>
            <Form action="destroy" method="post" onSubmit={confirmDelete}>
              <button
                type="submit"
                className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
              >
                Delete
              </button>
            </Form>
          </>
        )}
        <button
          onClick={handleCancel}
          className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
        >
          Cancel
        </button>
        {user && !isUserHost && !isAlreadyAttending && (
          <form method="post" onSubmit={handleAttend}>
            <input type="hidden" name="_action" value="attend" />
            <button
              type="submit"
              className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
            >
              Attend Jam
            </button>
          </form>
        )}
        {!isUserHost && isAlreadyAttending && (
          <form method="post" onSubmit={handleUnattend}>
            <input type="hidden" name="_action" value="unattend" />
            <button
              type="submit"
              className="w-30 bg-red-600 hover:bg-red-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
            >
              Unattend Jam
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "attend") {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
      // Handle the case where the user is not authenticated
      return redirect("/signin");
    }

    const jamId = params.jamId;
    const jam = await mongoose.models.Entry.findById(jamId);

    if (!jam) {
      // Handle the case where the jam is not found
      return null;
    }

    // Check if the user is already an attendee
    if (jam.attendees.includes(user._id)) {
      // Maybe you want to send a message back to the user that they're already attending
      return null;
    }

    // Add user to attendees
    jam.attendees.push(user._id);
    await jam.save();

    return redirect(`/profile`);
  }

  if (actionType === "unattend") {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
      // Handle the case where the user is not authenticated
      return redirect("/signin");
    }

    const jamId = params.jamId;
    const jam = await mongoose.models.Entry.findById(jamId);

    if (!jam) {
      // Handle the case where the jam is not found
      return null;
    }

    // Remove the user from attendees
    jam.attendees = jam.attendees.filter(
      (attendeeId) => attendeeId.toString() !== user._id.toString(),
    );
    await jam.save();

    return redirect(`/profile`);
  }
};
