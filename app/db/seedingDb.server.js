import mongoose from "mongoose";

export default async function seedDb() {
  const entryCount = await mongoose.models.Entry.countDocuments();
  if (entryCount === 0) {
    console.log("Seeding database...");
    insertData();
  }
}

async function insertData() {
  const entries = [
    {
      date: new Date("2024-01-01"),
      title: "New Year's Jam",
      text: "Bring your instrument and start the year with music!",
      location: {
        name: "Melody Mansion",
        street: "Rhythm Road 12",
        zip: 90120,
        city: "Harmony Haven",
      },
      userID: "65e5d00230c4147b8f2046be",
      attendees: ["65e5d3b730c4147b8f2046f7", "65e5d69230c4147b8f20470f"],
    },
    {
      date: new Date("2024-01-15"),
      title: "Blues & Brews",
      text: "A night of blues. Bring your guitar, harmonica, or just your love for blues.",
      location: {
        name: "The Blues Barn",
        street: "Groove Alley 34",
        zip: 80456,
        city: "Bassline Borough",
      },
      userID: "65e5d3b730c4147b8f2046f7",
      attendees: ["65e5d00230c4147b8f2046be", "65e5d69230c4147b8f20470f"],
    },
    {
      date: new Date("2024-02-01"),
      title: "Folk Fest",
      text: "Folk musicians unite for an evening of storytelling and strings.",
      location: {
        name: "Folklore Field",
        street: "Acoustic Avenue 56",
        zip: 70089,
        city: "Melodic Meadow",
      },
      userID: "65e5d69230c4147b8f20470f",
      attendees: ["65e5d00230c4147b8f2046be", "65e5d3b730c4147b8f2046f7"],
    },
  ];

  await mongoose.models.Entry.insertMany(entries);
}
