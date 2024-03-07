// import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const action = async ({ request }) => {
  return await authenticator.logout(request, { redirectTo: "/" });
};
