require("dotenv").config();
const mongoose = require("mongoose");
const Expense = require("./models/Expense");

const categories = ["Food", "Transport", "Shopping", "Health", "Entertainment", "Rent", "Utilities"];

const randomBetween = (min, max) => Math.round(Math.random() * (max - min) + min);

const categoryRanges = {
  Food:          { min: 80,   max: 600  },
  Transport:     { min: 50,   max: 300  },
  Shopping:      { min: 200,  max: 2000 },
  Health:        { min: 100,  max: 800  },
  Entertainment: { min: 100,  max: 500  },
  Rent:          { min: 5000, max: 8000 },
  Utilities:     { min: 300,  max: 900  },
};

const categoryFrequency = {
  Food:          18,
  Transport:     12,
  Shopping:      5,
  Health:        3,
  Entertainment: 4,
  Rent:          1,
  Utilities:     2,
};

function generateExpenses() {
  const expenses = [];
  const now = new Date();

  // Generate for past 3 months
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const year = now.getFullYear();
    const month = now.getMonth() - monthOffset;

    categories.forEach((cat) => {
      const count = categoryFrequency[cat];
      const { min, max } = categoryRanges[cat];

      for (let i = 0; i < count; i++) {
        const day = randomBetween(1, 28);
        const date = new Date(year, month, day);

        expenses.push({
          userId: "user1",
          amount: randomBetween(min, max),
          category: cat,
          date,
        });
      }
    });
  }

  return expenses;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Clear existing data
    await Expense.deleteMany({ userId: "user1" });
    console.log("Cleared existing expenses");

    const expenses = generateExpenses();
    await Expense.insertMany(expenses);
    console.log(`Seeded ${expenses.length} expenses across 3 months`);

    mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error(err);
  }
}

seed();
