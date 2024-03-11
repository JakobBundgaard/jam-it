import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, "Username must be at least 5 characters long"],
      maxlength: [20, "Username cannot be more than 30 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: [6, "Password must be at least 5 characters long"], // Burde være længere og indeholde special characterer, men gør det ikke for nemheds skyld
      maxlength: [20, "Password cannot be more than 30 characters long"],
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
      minlength: [5, "Title must be at least 5 characters long"],
      maxlength: [30, "title cannot be more than 30 characters long"],
    },
    text: {
      type: String,
      required: true,
      minlength: [5, "Text must be at least 5 characters long"],
      maxlength: [50, "Text cannot be more than 30 characters long"],
    },
    location: {
      name: {
        type: String,
        required: true,
        minlength: [3, "Name must be at least 5 characters long"],
        maxlength: [50, "Name cannot be more than 30 characters long"],
      },
      street: {
        type: String,
        required: true,
        minlength: [3, "Street must be at least 5 characters long"],
        maxlength: [30, "Street cannot be more than 30 characters long"],
      },
      zip: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
        required: true,
        minlength: [3, "City must be at least 5 characters long"],
        maxlength: [30, "City cannot be more than 30 characters long"],
      },
    },
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    maxAttendees: {
      type: Number,
      required: true,
      min: 1, // Ensure there's at least space for one attendee
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
