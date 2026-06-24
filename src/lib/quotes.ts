import type { Quote } from "./types.js";

export const DEFAULT_QUOTES: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  {
    text: "It is not enough to be busy; so are the ants. The question is: what are we busy about?",
    author: "Henry David Thoreau",
  },
  {
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
  },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Starve your distractions, feed your focus.", author: "Unknown" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  {
    text: "You will never always be motivated. You have to learn to be disciplined.",
    author: "Unknown",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
  },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your focus determines your reality.", author: "George Lucas" },
  {
    text: "One reason so few of us achieve what we truly want is that we never direct our focus.",
    author: "Tony Robbins",
  },
  {
    text: "Lack of direction, not lack of time, is the problem. We all have twenty-four hour days.",
    author: "Zig Ziglar",
  },
  {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    author: "Stephen Covey",
  },
  {
    text: "Amateurs sit and wait for inspiration. The rest of us just get up and go to work.",
    author: "Stephen King",
  },
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
  },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
];

export function pickRandomQuote(quotes: Quote[]): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
