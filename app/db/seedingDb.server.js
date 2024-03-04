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
    },
    {
      date: new Date("2024-02-15"),
      title: "Jazz & Java",
      text: "A cozy coffeehouse jazz session. Bring your sax or just come to enjoy.",
      location: {
        name: "Caffeine Corner",
        street: "Swing Street 78",
        zip: 60234,
        city: "Jazz Junction",
      },
    },
    {
      date: new Date("2024-02-22"),
      title: "Rock Rendezvous",
      text: "Let's rock this town! Guitars, drums, and rock spirit required.",
      location: {
        name: "Rock Realm",
        street: "Plectrum Place 90",
        zip: 50367,
        city: "Riff Ridge",
      },
    },
  ];

  await mongoose.models.Entry.insertMany(entries);
}
