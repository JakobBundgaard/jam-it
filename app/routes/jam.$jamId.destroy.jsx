import { redirect } from "@remix-run/node";
import mongoose from "mongoose";
import { authenticator } from "../services/auth.server";

export async function action({ params, request }) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  await mongoose.models.Entry.findByIdAndDelete(params.jamId);
  return redirect("/profile");
}
