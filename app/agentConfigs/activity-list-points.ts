// ## How the scale was set  

// | Band | Examples | Rationale |
// |------|----------|-----------|
// | **1 - 2 pts** | very quick wins (drink water) | frequent dopamine hits keep people logging. |
// | **3 - 5 pts** | small-to-medium effort, <30 min | mirrors Habitica’s default “Medium” difficulty tasks. |
// | **6 - 8 pts** | solid effort, 30-60 min | seen in gamified fitness apps where moderate workouts earn ~⅔ of daily target. |
// | **9 - 10 pts** | high effort / keystone habit | big “anchor” actions create a goal-gradient pull. |

// A negative habit (late-night scrolling, sugary drink) can *deduct* 1–10 pts on the same scale, mirroring “loss-aversion” techniques used in productivity games.

import { Routine } from "../types";

export const activityListPoints: Routine[] = [
  {
    name: "Morning-Routine",
    activities: [
      {
        points: 2,
        description: "Wake up before personal target (≤ 30 min buffer) — **2 pts**.",
      },
      {
        points: 4,
        description: "Wake up ≥ 1 h earlier than baseline — **4 pts**.",
      },
      {
        points: 3,
        description: "10 min mindfulness / breathing — **3 pts**.",
      },
      {
        points: 1,
        description: "Make the bed — **1 pt**.",
      },
      {
        points: 3,
        description: "Cold shower — **3 pts**.",
      },
      {
        points: 2,
        description: "Write 3-item gratitude list — **2 pts**.",
      },
    ],
  },
  {
    name: "Physical Activity",
    activities: [
      {
        points: 2,
        description: "10 min walk / stretch break — **2 pts**.",
      },
      {
        points: 5,
        description: "20 min at ≥ 60 % HRmax (run, cycle) — **5 pts**.",
      },
      {
        points: 7,
        description: "Full 45-min gym session — **7 pts**.",
      },
      {
        points: 3,
        description: "Personal record or new weight lifted — **+3 bonus** (stackable).",
      },
      {
        points: 6,
        description: "Yoga / mobility class (60 min) — **6 pts**.",
      },
    ],
  },
  {
    name: "Mental-Well-being",
    activities: [
      {
        points: 3,
        description: "Guided meditation session (any length) — **3 pts**.",
      },
      {
        points: 4,
        description: "Therapy / journaling ≥ 20 min — **4 pts**.",
      },
      {
        points: 5,
        description: "Digital-detox 2 h block — **5 pts**.",
      },
      {
        points: 4,
        description: "Bedtime screen-free hour — **4 pts**.",
      },
    ],
  },
  {
    name: "Deep Work / Learning",
    activities: [
      {
        points: 3,
        description: "25-min Pomodoro of focused study — **3 pts**.",
      },
      {
        points: 8,
        description: "Four consecutive Pomodoros (2 h) — **8 pts**.",
      },
      {
        points: 10,
        description: "Publish or turn in major deliverable — **10 pts**.",
      },
      
    ],
  },
  {
    name: "Nutrition & Hydration",
    activities: [
      {
        points: 1,
        description: "500 ml plain water (max 6 logs/day) — **1 pt**.",
      },
      {
        points: 5,
        description: "Balanced home-cooked meal — **5 pts**.",
      },
      {
        points: 2,
        description: "Add leafy greens or legumes to plate — **2 pts**.",
      },
      {
        points: 2,
        description: "Skip sugary drink — **2 pts** (positive avoidance).",
      },
      {
        points: 4,
        description: "Alcohol-free day — **4 pts**.",
      },
    ],
  },
  {
    name: "Chores & Environment",
    activities: [
      {
        points: 2,
        description: "Tidy workspace (5-min reset) — **2 pts**.",
      },
      {
        points: 3,
        description: "15 min cleaning sprint — **3 pts**.",
      },
      {
        points: 5,
        description: "Full laundry cycle (wash-dry-fold) — **5 pts**.",
      },
      {
        points: 4,
        description: "Weekly fridge clear-out — **4 pts**.",
      },
    ],
  },
  {
    name: "Social & Kindness",
    activities: [
      {
        points: 2,
        description: "Compliment or thank someone deliberately — **2 pts**.",
      },
      {
        points: 3,
        description: "Help a colleague with a task — **3 pts**.",
      },
      {
        points: 3,
        description: "Call family / close friend ≥ 10 min — **3 pts**.",
      },
      {
        points: 7,
        description: "Volunteer hour — **7 pts**.",
      },
    ],
  },
  {
    name: "Sleep Hygiene",
    activities: [
      {
        points: 4,
        description: "In bed before target time — **4 pts**.",
      },
      {
        points: 6,
        description: "8 h actual sleep (tracked) — **6 pts**.",
      },
      {
        points: 2,
        description: "Reduce caffeine after 2 pm — **2 pts**.",
      },
    ],
  },
  {
    name: "Financial & Admin",
    activities: [
      {
        points: 2,
        description: "Track expenses for the day — **2 pts**.",
      },
      {
        points: 3,
        description: "Pay bill / budget session — **3 pts**.",
      },
      {
        points: 3,
        description: "30 min declutter of digital files — **3 pts**.",
      },
    ],
  },
  {
    name: "Creativity & Play",
    activities: [
      {
        points: 3,
        description: "15 min playing instrument / drawing — **3 pts**.",
      },
      {
        points: 3,
        description: "Write 200+ words fiction / journal — **3 pts**.",
      },
      {
        points: 5,
        description: "1 h focused craft / DIY — **5 pts**.",
      },
    ],
  },
  {
    name: "Negative Point",
    activities: [
      {
        points: -4,
        description: "Skip planned workout — **-4 pts**.",
      },
      {
        points: -5,
        description: ">60 min doom-scrolling at night — **-5 pts**.",
      },
      {
        points: -3,
        description: "Sugary snack after 9 pm — **-3 pts**.",
      },
    ],
  },
];
