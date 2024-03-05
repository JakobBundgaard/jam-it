import { Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import { sessionStorage } from "../services/session.server";
import { json } from "@remix-run/node";
import mongoose from "mongoose";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  const error = session.get("sessionErrorKey");
  return json({ error });
}

export default function SignUp() {
  const loaderData = useLoaderData();
  return (
    <div
      id="sign-in-page"
      className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md"
    >
      <h1 className="text-xl italic text-center">Sign Up</h1>
      <Form id="sign-in-form" method="post">
        <div className="items-center">
          <label htmlFor="name">Username</label>
          <input
            id="username"
            type="text"
            name="username"
            aria-label="username"
            placeholder="Type your user name..."
            required
            className="text-gray-900 m-2 p-1 rounded-md"
          />
          <br />
          <label htmlFor="email">Mail</label>
          <input
            id="email"
            type="email"
            name="email"
            aria-label="mail"
            placeholder="Type your mail..."
            required
            className="text-gray-900 m-2 p-1 rounded-md"
          />
          <br />
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            name="password"
            aria-label="password"
            placeholder="Type your password..."
            autoComplete="current-password"
            className="text-gray-900 m-2 p-1 rounded-md"
          />

          <div>
            <button className="w-40 bg-slate-500 hover:bg-slate-600 text-white font-bold m-2 py-2 px-4 rounded-md">
              Sign Up
            </button>
          </div>
          <div className="error-message text-red-600">
            {loaderData?.error ? <p>{loaderData?.error?.message}</p> : null}
          </div>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const newUser = Object.fromEntries(formData);

  const result = await mongoose.models.User.create(newUser);

  if (result) {
    return await authenticator.isAuthenticated(request, {
      failureRedirect: "/signin",
    });
  } else {
    return await authenticator.isAuthenticated(request, {
      failureRedirect: "/signup",
    });
  }
}
