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
import banner from "../images/banner.png";

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
  const placesLeft = jam.maxAttendees - jam.attendees.length;
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

    const formData = new FormData();
    formData.append("_action", "attend");

    fetcher.submit(formData, {
      method: "post",
      action: `/jam/${jam._id}`,
    });
  }

  async function handleUnattend(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("_action", "unattend");

    fetcher.submit(formData, {
      method: "post",
      action: `/jam/${jam._id}`,
    });
  }

  const isUserHost =
    user && jam.userID && jam.userID._id.toString() === user._id.toString();

  const isAlreadyAttending =
    user && jam.attendees.some((attendee) => attendee._id === user._id);
  console.log(jam);

  const badgeClasses =
    "inline-block w-5/6 md:w-3/4 lg:w-1/2 py-1 text-lg rounded-full mb-4 mx-auto text-center";

  return (
    <>
      <div>
        <img className="w-full" src={banner} alt="" />
      </div>

      <div className="flex flex-col max-w-4xl mx-auto my-10 p-6 text-center rounded-lg shadow-md ">
        <div
          key={jam._id}
          className="block bg-gray-50 hover:bg-blue-50 focus:bg-blue-100 transition-colors duration-150 rounded-lg shadow px-6 py-4 mb-4"
          style={{ minHeight: "160px" }}
        >
          {placesLeft <= 0 ? (
            <div className={`${badgeClasses} bg-red-700 text-white`}>
              Event Full
            </div>
          ) : placesLeft <= 5 ? (
            <div className={`${badgeClasses} bg-[#e89633] text-white`}>
              {placesLeft} place{placesLeft === 1 ? "" : "s"} left!
            </div>
          ) : null}
          <h3 className="text-3xl font-bold text-gray-800">{jam.title}</h3>

          <p className="text-2xl text-gray-600">
            <strong>Location:</strong> {jam.location.name},{" "}
            {jam.location.street} in {jam.location.city}
          </p>
          <p className="text-xl text-gray-600">
            <strong>Date:</strong>{" "}
            {new Intl.DateTimeFormat("da-DK", {
              timeZone: "UTC",
              dateStyle: "full",
              timeStyle: "short",
            }).format(new Date(jam.date))}
          </p>
          <p className="text-xl text-gray-500">
            <strong>Details:</strong> {jam.text}
          </p>
          <p className="text-xl text-gray-500">
            <strong>Host:</strong> {jam.userID.username}
          </p>
          <div className="text-xl text-gray-500">
            <strong>Attendees:</strong>
            {jam.attendees.length > 0 ? (
              <ul className="list-disc list-inside">
                {jam.attendees.map((attendee) => (
                  <li key={attendee._id}>{attendee.username}</li>
                ))}
              </ul>
            ) : (
              <p>No attendees yet.</p>
            )}
          </div>
          <p className="text-xl text-gray-500">
            <strong>Places Left:</strong> {placesLeft}
          </p>
        </div>
        <div className="btns flex items-center justify-center space-x-4">
          {isUserHost && (
            <>
              <Link
                to="update"
                className="w-40 bg-[#4972b6] hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md"
              >
                Update
              </Link>
              <Form action="destroy" method="post" onSubmit={confirmDelete}>
                <button
                  type="submit"
                  className="w-40 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md"
                >
                  Delete
                </button>
              </Form>
            </>
          )}
          <button
            onClick={handleCancel}
            className="w-40 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md"
          >
            Cancel
          </button>
          {user && !isUserHost && !isAlreadyAttending && (
            <form method="post" onSubmit={handleAttend}>
              <input type="hidden" name="_action" value="attend" />
              <button
                type="submit"
                className="w-40 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md"
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
                className="w-40 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md"
              >
                Unattend Jam
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  if (actionType === "attend") {
    const user = await authenticator.isAuthenticated(request);
    if (!user) {
      return redirect("/signin");
    }

    const jamId = params.jamId;
    const jam = await mongoose.models.Entry.findById(jamId);

    if (!jam) {
      // Handle the case where the jam is not found
      return null;
    }

    if (jam.attendees.includes(user._id)) {
      // Maybe you want to send a message back to the user that they're already attending
      return null;
    }

    jam.attendees.push(user._id);
    await jam.save();

    if (jam.attendees.length >= jam.maxAttendees) {
      return redirect(`/profile`, {
        state: { message: "This jam is full." },
      });
    }

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

    jam.attendees = jam.attendees.filter(
      (attendeeId) => attendeeId.toString() !== user._id.toString(),
    );
    await jam.save();

    return redirect(`/profile`);
  }
};
