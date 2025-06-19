// Structured changelog data for the application
export type ChangelogItem = {
  version: string;
  releaseDate: string;
  changes: string[];
  benefits?: string[];
  details?: string;
};

// Changelog entries from newest to oldest
export const changelogData: ChangelogItem[] = [
  {
    version: "0.2.1",
    releaseDate: "30th April 2025",
    changes: [
      "Added a feedback widget to the home page",
      "Added an experimental feature; theme comparison. affects only the home page."
    ]
  },
  {
    version: "0.2.0",
    releaseDate: "28th April 2025",
    changes: [
      "Created a centralized database initialization in lib/db.ts that handles all object store creation",
      "Modified the DatabaseContext to use this centralized initialization",
      "Updated UserCacheContext to reuse the database connection from DatabaseContext",
      "Removed all db.close() calls to prevent closing shared connections",
      "Updated agentDatabaseTools to cache and reuse the database connection",
      "Added a DBLoader component to handle database loading and error states",
      "Updated the provider structure to wrap UserCacheProvider with the DBLoader"
    ],
    benefits: [
      "Only one instance of the database is opened",
      "The upgrade logic is centralized and runs only once",
      "The database connection is shared across providers",
      "Database errors are properly handled with user feedback"
    ]
  },
  {
    version: "0.1.0",
    releaseDate: "26th April 2025",
    changes: [
      "Initial release",
      "Voice support",
      "Multi-agent support",
      "Conversation agent",
      "Habit tracking",
      "Reward system",
      "Database support"
    ],
    details: "First official release with core functionality"
  }
];

// Get the latest version
export const getLatestVersion = (): string => {
  return changelogData[0].version;
};

// Get a specific version's changelog
export const getChangelogByVersion = (version: string): ChangelogItem | undefined => {
  return changelogData.find(item => item.version === version);
};

// Get multiple versions' changelogs
export const getChangelogHistory = (count: number = 3): ChangelogItem[] => {
  return changelogData.slice(0, count);
}; 