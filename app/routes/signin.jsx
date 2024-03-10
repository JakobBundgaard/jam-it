import { Link, Form, useLoaderData } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
import { sessionStorage } from "../services/session.server";
import { json } from "@remix-run/node";

export async function loader({ request }) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/profile",
  });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  const error = session.get("sessionErrorKey");

  session.unset("sessionErrorKey");

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return json({ error }, { headers });
}

export default function SignIn() {
  const loaderData = useLoaderData();
  return (
    <div
      id="sign-in-page"
      className="flex flex-col max-w-xl mx-auto my-10 p-6 text-center bg-slate-500 rounded-lg shadow-md"
    >
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sign In</h1>
        <Form
          id="sign-in-form"
          method="post"
          className="flex flex-col items-center justify-center"
        >
          <div className="mb-4 w-full px-6">
            <label htmlFor="email" className="block text-left mb-1">
              Mail
            </label>
            <input
              id="email"
              type="email"
              name="email"
              aria-label="email"
              placeholder="Type your email..."
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
              required
              className="text-gray-900 w-full p-2 rounded-md"
            />
          </div>
          <button className="w-52 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-md">
            Sign In
          </button>
          <div className="error-message text-red-600 mt-2">
            {loaderData?.error ? <p>{loaderData?.error?.message}</p> : null}
          </div>
        </Form>
        <p className="mt-6">
          Not a member yet?{" "}
          <Link
            to="/signup"
            className="text-blue-800 hover:text-blue-900 underline"
          >
            Signup here...
          </Link>
        </p>
      </div>
    </div>
  );
}

export async function action({ request }) {
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/profile",
    failureRedirect: "/signin",
  });
}
