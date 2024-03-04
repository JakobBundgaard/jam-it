import { Form } from "@remix-run/react";
import { authenticator } from "../services/auth.server";

export default function SignIn() {
  return (
    <div
      id="sign-in-page"
      className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md"
    >
      <h1 className="text-xl italic text-center">Sign In</h1>
      <Form id="sign-in-form" method="post">
        <div className="items-center">
          <label htmlFor="mail">Mail</label>

          <input
            id="mail"
            type="email"
            name="mail"
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
              Sign In
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  // we call the method with the name of the strategy we want to use and the
  // request object, optionally we pass an object with the URLs we want the user
  // to be redirected to after a success or a failure
  return await authenticator.authenticate("user-pass", request, {
    successRedirect: "/",
    failureRedirect: "/signin",
  });
}
