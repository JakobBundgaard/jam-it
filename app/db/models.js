import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

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
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

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
  },
  { timestamps: true },
);

export const models = [
  { name: "User", schema: userSchema, collection: "users" },
  { name: "Entry", schema: entrySchema, collection: "entries" },
];
