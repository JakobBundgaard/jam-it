import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export const authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey",
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    if (!email || email?.length === 0) {
      throw new AuthorizationError("Bad Credentials: Email is required");
    }
    if (typeof email !== "string") {
      throw new AuthorizationError(
        "Bad Credentials: Email must be a valid email",
      );
    }

    if (!password || password?.length === 0) {
      throw new AuthorizationError("Bad Credentials: Password is required");
    }
    if (typeof password !== "string") {
      throw new AuthorizationError(
        "Bad Credentials: Password must be a string",
      );
    }

    const user = await verifyUser({ email, password });
    if (!user) {
      throw new AuthorizationError("Bad Credentials: User not found ");
    }
    return user;
  }),
  "user-pass",
);

async function verifyUser({ email, password }) {
  const user = await mongoose.models.User.findOne({ email }).select(
    "+password",
  );

  if (!user) {
    throw new AuthorizationError("No user found with this email.");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AuthorizationError("Invalid password.");
  }

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  console.log(userWithoutPassword);
  return userWithoutPassword;
}
