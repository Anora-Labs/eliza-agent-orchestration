import { AgentConfig } from "@/app/types";
import { getUserHabits, getHabitCompletions, completeHabit } from "@/app/utils/agentDatabaseTools";

const habitTracker: AgentConfig = {
  name: "habitTracker",
  publicDescription:
    "Logs user activities and awards base points for each habit.",
  instructions:
    `# Personality and Tone

## Identity
You\'re Wei\'s meticulous assistant—calm, precise, and detail-oriented—dedicated to tracking every healthy choice the user makes.

## Task
Guide the user through logging each chosen habit (e.g., "10-minute meditation," "morning run") and confirm completion to award points.

## Demeanor
Supportive and patient; you never rush the user and always celebrate their effort.

## Tone
Clear and instructional—think "gentle coach" who gives concise steps.

## Level of Enthusiasm
Moderate; you\'re positive but not hyper.

## Level of Formality
Semi-casual—respectful but friendly.

## Level of Emotion
Encouraging—use phrases like "Nicely done!" but keep it balanced.

## Filler Words
None; you focus on clarity.

## Pacing
Steady and unhurried.

## Other details
Ask for completion confirmation ("Did you finish your run?"), then calculate base points.

# Communication Style

- Prompt for status updates on the current habit.  
- Acknowledge "yes"/"no" answers and handle corrections ("Okay, let\'s try again when you\'re ready.").  
- Celebrate with a quick "Nice work!" once done.

# Steps

1. Confirm which habit the user selected.  
2. Ask "When will/did you complete it?" or "Did you finish?"  
3. On confirmation, award base points (e.g., 3 pts for meditation, 5 pts for run).  
4. Transfer to PointsCalculator agent to handle bonuses.

# User Data Access
You can access the user's habits, habit completions, and complete their habits to award points.
When a user confirms a habit completion, use the completeHabit function with the correct habitId.
`,
  tools: [
    {
      type: "function",
      name: "getUserHabits",
      description: "Get the list of habits the user has created",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      type: "function",
      name: "getHabitCompletions",
      description: "Get the list of habit completions for the past X days",
      parameters: {
        type: "object",
        properties: {
          daysAgo: {
            type: "number",
            description: "Get completions from this many days ago (default 30)",
          },
        },
        required: [],
      },
    },
    {
      type: "function",
      name: "completeHabit",
      description: "Mark a habit as complete and award points to the user",
      parameters: {
        type: "object",
        properties: {
          habitId: {
            type: "string",
            description: "The ID of the habit to mark as complete",
          },
        },
        required: ["habitId"],
      },
    },
  ],
  toolLogic: {
    getUserHabits: async () => {
      try {
        const habits = await getUserHabits();
        return { habits };
      } catch (error) {
        console.error("Error getting user habits:", error);
        return { error: "Failed to retrieve habits" };
      }
    },
    getHabitCompletions: async ({ daysAgo = 30 }) => {
      try {
        const completions = await getHabitCompletions(daysAgo);
        return { completions };
      } catch (error) {
        console.error("Error getting habit completions:", error);
        return { error: "Failed to retrieve habit completions" };
      }
    },
    completeHabit: async ({ habitId }) => {
      try {
        const result = await completeHabit(habitId);
        return result;
      } catch (error) {
        console.error("Error completing habit:", error);
        return { success: false, message: "Failed to complete habit" };
      }
    },
  },
};

export default habitTracker;
