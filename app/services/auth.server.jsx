import { Authenticator, AuthorizationError } from "remix-auth";
import { sessionStorage } from "./session.server";
import { FormStrategy } from "remix-auth-form";
// import { authenticator } from "./auth.server";
// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

export const authenticator = new Authenticator(sessionStorage, {
  sessionErrorKey: "sessionErrorKey", // keep in sync
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const mail = form.get("mail");
    const password = form.get("password");
    let user = null;

    if (!mail || mail?.length === 0) {
      throw new AuthorizationError("Bad Credentials: Email is required");
    }
    if (typeof mail !== "string") {
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
    if (mail === "jake@mail.com" && password === "1111") {
      user = {
        mail,
      };

      // the type of this user must match the type you pass to the Authenticator
      // the strategy will automatically inherit the type if you instantiate
      // directly inside the `use` method
      return user;
    } else {
      // if problem with user throw error AuthorizationError
      throw new AuthorizationError("Bad Credentials");
    }
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
);
