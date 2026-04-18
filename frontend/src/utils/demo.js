/**
 * demo.js — realistic fake data for testing the UI
 * without a microphone or Groq API key
 */

export const DEMO_CHUNKS = [
  {
    text: "Good morning everyone. Let's kick off our Q3 planning session. I want to start by reviewing what we achieved in Q2 before we talk about targets.",
    time: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    text: "Our revenue came in at 2.4 million, which is 12% above forecast. The main driver was the enterprise segment — we closed three deals that were originally pushed from Q1.",
    time: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    text: "On the product side, we shipped the new dashboard in week 8 and it's already showing 34% better retention for users who engage with it daily. That's a strong signal.",
    time: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    text: "For Q3 I'm proposing we double down on enterprise and set a target of 3.2 million. That's about 33% growth. Marketing wants to run a campaign in July. Any concerns?",
    time: new Date(Date.now() - 60000).toISOString(),
  },
];

export const DEMO_SUGGESTIONS = [
  {
    id: "1",
    type: "question",
    icon: "🙋",
    label: "Ask",
    text: "What's the plan if the July campaign underperforms against the 3.2M target?",
  },
  {
    id: "2",
    type: "insight",
    icon: "💡",
    label: "Insight",
    text: "The 34% retention lift from the dashboard is a strong upsell story for enterprise deals.",
  },
  {
    id: "3",
    type: "clarify",
    icon: "🔍",
    label: "Clarify",
    text: "Were the three Q1-pushed enterprise deals included in the Q2 2.4M or counted separately?",
  },
];

export const DEMO_TRANSCRIPT = DEMO_CHUNKS.map((c) => c.text).join(" ");