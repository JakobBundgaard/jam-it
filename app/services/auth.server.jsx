import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import { authenticator } from "./auth.server";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

export const authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey", // keep in sync
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    // let user = null;
    console.log(email);

    if (!email || email?.length === 0) {
      throw new AuthorizationError("Bad Credentials: Email is required");
    }
    if (typeof email !== "string") {
      throw new AuthorizationError("Bad Credentials: Email must be a string");
    }

    if (!password || password?.length === 0) {
      throw new AuthorizationError("Bad Credentials: Password is required");
    }
    if (typeof password !== "string") {
      throw new AuthorizationError(
        "Bad Credentials: Password must be a string",
      );
    }

    // login the user, this could be whatever process you want
    const user = await verifyUser({ email, password });
    if (!user) {
      // if problem with user throw error AuthorizationError
      throw new AuthorizationError("Bad Credentials: User not found ");
    }
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
);

async function verifyUser({ email, password }) {
  const user = await mongoose.models.User.findOne({ email }).select(
    "+password",
  );

  console.log(user, email);

  if (!user) {
    throw new AuthorizationError("No user found with this email.");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new AuthorizationError("Invalid password.");
  }

  // Create a new object without the password field
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  console.log(userWithoutPassword);
  return userWithoutPassword;
}
