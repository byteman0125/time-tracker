import { db } from "./index";
import { interviewSteps } from "./schema";

export async function seedDatabase() {
  try {
    // Check if Intro step exists
    const existingSteps = await db.select().from(interviewSteps);
    
    if (existingSteps.length === 0) {
      const defaultSteps = [
        { name: "Intro", order: 1 },
        { name: "Recruiter Screen", order: 2 },
        { name: "Hiring Manager", order: 3 },
        { name: "Technical Loop", order: 4 },
        { name: "CTO", order: 5 },
        { name: "CEO", order: 6 },
        { name: "Offer", order: 7 },
        { name: "Reminder", order: 8 },
      ];

      await db.insert(interviewSteps).values(defaultSteps);
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already seeded");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

