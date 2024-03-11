import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import {
  getSession,
  commitSession,
  destroySession,
} from "../services/session.server";
import { json, redirect } from "@remix-run/node";
import mongoose from "mongoose";
import banner from "../images/banner.png";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const session = await getSession(request.headers.get("Cookie"));

  const error = session.get("sessionErrorKey");
  session.unset("sessionErrorKey");

  const headers = new Headers({
    "Set-Cookie": await commitSession(session),
  });

  return json({ error }, { headers });
}

export default function SignUp() {
  const loaderData = useLoaderData();
  console.log(loaderData);
  return (
    <>
      <div>
        <img className="w-full" src={banner} alt="" />
      </div>

      <div
        id="sign-up-page"
        className="flex flex-col max-w-xl mx-auto my-10 p-6 text-center bg-slate-500 rounded-lg shadow-md"
      >
        <div>
          <h1 className="text-4xl text-gray-800 mb-4 uppercase">Sign Up</h1>
          <Form
            id="sign-up-form"
            method="post"
            className="flex flex-col items-center justify-center"
          >
            <div className="mb-4 w-full px-6">
              <label htmlFor="username" className="block text-left mb-1">
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                aria-label="username"
                placeholder="Type your user name..."
                required
                className="text-gray-900 w-full p-2 rounded-md"
              />
            </div>
            <div className="mb-4 w-full px-6">
              <label htmlFor="email" className="block text-left mb-1">
                Mail
              </label>

              <input
                id="email"
                type="email"
                name="email"
                aria-label="mail"
                placeholder="Type your mail..."
                required
                className="text-gray-900 w-full p-2 rounded-md"
              />
            </div>
            <div className="mb-4 w-full px-6">
              <label htmlFor="password" className="block text-left mb-1">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                aria-label="password"
                placeholder="Type your password..."
                autoComplete="current-password"
                className="text-gray-900 w-full p-2 rounded-md"
              />
            </div>

            <div className="mb-4 w-full px-6">
              <label htmlFor="repeatPassword" className="block text-left mb-1">
                Repeat Password
              </label>

              <input
                id="repeatPassword"
                type="password"
                name="repeatPassword"
                aria-label="repeatPassword"
                placeholder="Repeat your password..."
                autoComplete="new-password" // To avoid autofilling the password
                className="text-gray-900 w-full p-2 rounded-md"
                required
              />
            </div>
            <button className="w-52 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md">
              Sign Up
            </button>

            <div className="error-message text-red-600 mt-2">
              {loaderData?.error ? <p>{loaderData?.error?.message}</p> : null}
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");
  const repeatPassword = formData.get("repeatPassword");
  const session = await getSession(request.headers.get("Cookie"));

  // Check if passwords match
  if (password !== repeatPassword) {
    session.flash("sessionErrorKey", { message: "Passwords do not match" });
    return redirect("/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    const newUser = { username, email, password };
    const result = await mongoose.models.User.create(newUser);

    if (result) {
      return redirect("/signin", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }
  } catch (error) {
    let errorMessage = "Failed to sign up, please try again.";
    // Check if the error is a Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = error.errors;
      // Collect all validation messages into a single string or an array, depending on your preference
      errorMessage = Object.values(errors)
        .map((err) => err.message)
        .join(", ");
    }

    session.flash("sessionErrorKey", { message: errorMessage });
    return redirect("/signup", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

// catch (error) {
//     // Handle any errors such as duplicate username or email, etc.
//     session.flash("sessionErrorKey", {
//       message: "Failed to sign up, please try again.",
//     });
//     // session.unset("sessionErrorKey");
//     return redirect("/signup", {
//       headers: {
//         "Set-Cookie": await commitSession(session),
//       },
//     });
//   }
// }
