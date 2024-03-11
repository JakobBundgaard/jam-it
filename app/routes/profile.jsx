import { Link, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import mongoose from "mongoose";
import banner from "../images/banner.png";

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const hostedJams = await mongoose.models.Entry.find({
    userID: user._id,
  })
    .sort({ date: 1 })
    .exec();
  const attendingJams = await mongoose.models.Entry.find({
    attendees: user._id,
  })
    .sort({ date: 1 })
    .exec();

  return { user, hostedJams, attendingJams };
}

export default function Profile() {
  const { user, hostedJams, attendingJams } = useLoaderData();

  return (
    <div>
      <div>
        <img className="w-full" src={banner} alt="" />
      </div>
      <div className="flex flex-col max-w-4xl mx-auto my-10 p-6 text-center rounded-lg shadow-md">
        <h1 className="text-5xl text-center text-white mb-4 uppercase">
          WELCOME {user.username}
        </h1>
        <div className="entries-list">
          <h2 className="text-3xl font-light text-center text-white mb-6">
            Your Jams
          </h2>
          {hostedJams.length > 0 ? (
            hostedJams.map((jam) => {
              const placesLeft = jam.maxAttendees - jam.attendees.length;
              const badgeClasses =
                "inline-block w-5/6 md:w-1/2 lg:w-1/3 xl:w-1/4 py-1 text-lg rounded-full mb-2 mx-auto text-center";
              return (
                <Link
                  key={jam._id}
                  to={`/jam/${jam._id}`}
                  className="entry-link"
                >
                  <div
                    className="block bg-gray-50 hover:bg-blue-50 focus:bg-blue-100 transition-colors duration-150 rounded-lg shadow px-6 py-4 mb-4 max-w-xl mx-auto"
                    style={{ minHeight: "160px" }}
                  >
                    {placesLeft <= 0 ? (
                      <div className={`${badgeClasses} bg-red-500 text-white`}>
                        Event Full
                      </div>
                    ) : placesLeft <= 5 ? (
                      <div
                        className={`${badgeClasses} bg-[#e89633]  text-white`}
                      >
                        {placesLeft} places left!
                      </div>
                    ) : null}
                    <h3 className="text-3xl font-bold text-gray-800">
                      {jam.title}
                    </h3>
                    <p className="text-2xl text-gray-600">
                      {jam.location.name}
                    </p>
                    <p className="text-xl text-gray-500">
                      {new Date(jam.date).toLocaleString()}
                    </p>
                    <p className="text-xl text-gray-500">{jam.text}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-xl text-white">
              You are not hosting any jams currently.
            </p>
          )}
        </div>

        {/* Jams the user is attending */}
        <div className="entries-list">
          <h2 className="text-2xl font-light text-center text-white mb-6">
            Jams You Are Attending
          </h2>
          {attendingJams.length > 0 ? (
            attendingJams.map((jam) => {
              const placesLeft = jam.maxAttendees - jam.attendees.length;
              const badgeClasses =
                "inline-block w-5/6 md:w-1/2 lg:w-1/3 xl:w-1/4 py-1 text-lg p-2 rounded-full mb-2 mx-auto text-center";
              return (
                <Link
                  key={jam._id}
                  to={`/jam/${jam._id}`}
                  className="entry-link"
                >
                  <div
                    key={jam._id}
                    className="block bg-gray-50 hover:bg-blue-50 focus:bg-blue-100 transition-colors duration-150 rounded-lg shadow px-6 py-4 mb-4 max-w-xl mx-auto"
                    style={{ minHeight: "160px" }}
                  >
                    {placesLeft <= 0 ? (
                      <div className={`${badgeClasses} bg-red-700 text-white`}>
                        Event Full
                      </div>
                    ) : placesLeft <= 5 ? (
                      <div
                        className={`${badgeClasses} bg-[#e89633] text-white`}
                      >
                        {placesLeft} place{placesLeft === 1 ? "" : "s"} left!
                      </div>
                    ) : null}
                    <h3 className="text-3xl font-bold text-gray-800">
                      {jam.title}
                    </h3>

                    <p className="text-2xl text-gray-600">
                      {jam.location.name}
                    </p>
                    <p className="text-xl text-gray-500">
                      {new Date(jam.date).toLocaleString()}
                    </p>
                    <p className="text-xl text-gray-500">{jam.text}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-xl text-white">
              You are not attending any jams currently.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export async function action({ request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  await authenticator.logout(request, { redirectTo: "/signin" });
}
