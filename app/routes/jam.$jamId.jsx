import { json } from "@remix-run/node";
import { Link, Form, useLoaderData, useNavigate } from "@remix-run/react";
import mongoose from "mongoose";
// import { authenticator } from "../services/auth.server";

export async function loader({ params }) {
  // await authenticator.isAuthenticated(request, {
  //   failureRedirect: "/signin",
  // });

  const jam = await mongoose.models.Entry.findOne({
    _id: params.jamId,
  })
    .populate("userID")
    .populate("attendees", "username")
    .exec();

  if (!jam) {
    throw new Error("Jam not found");
  }

  return json({ jam });
}

export default function Jam() {
  const { jam } = useLoaderData();

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
        <Form
          className="flex items-center justify-center space-x-4"
          action="destroy"
          method="post"
          onSubmit={confirmDelete}
        >
          <Link
            to="update"
            className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
          >
            Update
          </Link>

          <button
            type="button"
            className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button className="w-30 bg-slate-600 hover:bg-slate-700 text-white font-bold mt-2 py-2 px-4 rounded-md">
            Delete
          </button>
        </Form>
      </div>
    </div>
  );
}
