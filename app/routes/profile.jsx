import { Form } from "@remix-run/react";
import { authenticator } from "../services/auth.server";
// import Nav from "../components/Nav";

export async function loader({ request }) {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
}

export default function Profile() {
  return (
    <div>
      {/* <Nav /> */}
      <div className="max-w-2xl mx-auto my-10 p-6 bg-slate-300 rounded-lg shadow-md">
        <Form method="post">
          <button className="w-40 bg-slate-500 hover:bg-slate-600 text-white font-bold m-2 py-2 px-4 rounded-md">
            Logout
          </button>
        </Form>
      </div>
    </div>
  );
}

export async function action({ request }) {
  await authenticator.logout(request, { redirectTo: "/signin" });
}
