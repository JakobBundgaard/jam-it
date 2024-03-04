import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

// User Schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      // Make sure to hash passwords before saving
      type: String,
      required: true,
      select: false, // Automatically exclude from query results
    },
    // Include any other user fields you may need
  },
  { timestamps: true },
);

// pre save password hook
userSchema.pre("save", async function (next) {
  const user = this; // this refers to the user document

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) {
    return next(); // continue
  }

  const salt = await bcrypt.genSalt(10); // generate a salt
  user.password = await bcrypt.hash(user.password, salt); // hash the password
  next(); // continue
});

// Entry Schema
const entrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    location: {
      name: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      zip: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Other fields as necessary
  },
  { timestamps: true },
);

// Create models
// const UserModel = mongoose.model("User", userSchema, "users");
// const EntryModel = mongoose.model("Entry", entrySchema, "entries");

// Export models
export const models = [
  { name: "User", schema: userSchema, collection: "users" },
  { name: "Entry", schema: entrySchema, collection: "entries" },
];

// export { UserModel, EntryModel };
