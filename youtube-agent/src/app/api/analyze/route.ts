import { NextResponse } from "next/server";
import yts from "yt-search";
import type { VideoSearchResult } from "yt-search";

type AnalyzeRequest = {
  topic: string;
  description?: string;
  audience?: string;
  style?: string;
  duration?: string;
  language?: string;
};

type VideoInsight = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  channel: string;
  views: number;
  ago: string;
  description: string;
  score: number;
  relevance: number;
  highlights: string[];
};

type OutlineSegment = {
  title: string;
  durationHint: string;
  talkingPoints: string[];
  brollIdeas: string[];
};

type ScriptSection = {
  heading: string;
  paragraphs: string[];
  callout?: string;
};

type AnalyzeResponse = {
  query: string;
  summary: string;
  hookIdeas: string[];
  narrativeAngle: string;
  keyThemes: string[];
  actionItems: string[];
  seo: {
    titleIdeas: string[];
    description: string;
    tags: string[];
  };
  outline: OutlineSegment[];
  script: ScriptSection[];
  inspiration: VideoInsight[];
  metadata: {
    requestedAudience?: string;
    tone?: string;
    durationHint?: string;
    language?: string;
  };
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "if",
  "in",
  "on",
  "for",
  "with",
  "of",
  "to",
  "by",
  "from",
  "about",
  "is",
  "are",
  "was",
  "were",
  "be",
  "this",
  "that",
  "those",
  "these",
  "you",
  "your",
  "into",
  "how",
  "what",
  "why",
  "when",
  "where",
  "can",
  "should",
  "will",
  "new",
  "latest",
  "best",
  "top",
  "2024",
  "2025",
  "video",
  "official",
]);

const timeUnitToMinutes = (unit: string) => {
  switch (unit) {
    case "second":
      return 1 / 60;
    case "minute":
      return 1;
    case "hour":
      return 60;
    case "day":
      return 60 * 24;
    case "week":
      return 60 * 24 * 7;
    case "month":
      return 60 * 24 * 30;
    case "year":
      return 60 * 24 * 365;
    default:
      return 60 * 24;
  }
};

const parseAgeMinutes = (ago?: string): number => {
  if (!ago) return 60 * 24 * 365;
  const normalized = ago.toLowerCase();
  const match = normalized.match(/(\d+)\s+(second|minute|hour|day|week|month|year)/);

  if (match) {
    const value = Number.parseInt(match[1], 10);
    const unit = match[2] as Parameters<typeof timeUnitToMinutes>[0];
    return value * timeUnitToMinutes(unit);
  }

  if (normalized.includes("streamed") || normalized.includes("premiered")) {
    const streamingMatch = normalized.match(
      /streamed\s+(\d+)\s+(second|minute|hour|day|week|month|year)/
    );
    if (streamingMatch) {
      const value = Number.parseInt(streamingMatch[1], 10);
      const unit = streamingMatch[2] as Parameters<typeof timeUnitToMinutes>[0];
      return value * timeUnitToMinutes(unit);
    }
  }

  return 60 * 24 * 365;
};

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOP_WORDS.has(word) && word.length > 2);

const aggregateKeywords = (texts: string[]) => {
  const freq = new Map<string, number>();
  for (const text of texts) {
    const words = tokenize(text);
    for (const word of words) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const buildHighlights = (video: VideoSearchResult, keywords: string[]): string[] => {
  const highlights: string[] = [];
  const lowerTitle = video.title.toLowerCase();

  for (const keyword of keywords.slice(0, 5)) {
    if (lowerTitle.includes(keyword)) {
      highlights.push(`Focus on ${keyword}`);
    }
  }

  if (video.views) {
    const viewLabel =
      video.views > 1_000_000
        ? `${(video.views / 1_000_000).toFixed(1)}M views`
        : video.views > 10_000
          ? `${Math.round(video.views / 1000)}k views`
          : `${video.views.toLocaleString()} views`;
    highlights.push(viewLabel);
  }

  if (video.ago) {
    highlights.push(`Published ${video.ago}`);
  }

  return highlights;
};

const buildNarrativeAngle = (
  topic: string,
  themes: string[],
  audience?: string,
  tone?: string
) => {
  const primaryTheme = themes[0] ?? "breakthroughs";
  const secondaryTheme = themes[1] ?? "insights";
  const persona = audience ? ` for ${audience}` : "";
  const tonal = tone ? `${tone} tone` : "engaging tone";
  return `Lead with the most relatable storyline${persona}, highlighting ${primaryTheme} before unfolding supporting context around ${secondaryTheme}, and keep a ${tonal} throughout to make the topic feel actionable.`;
};

const buildSummary = (topic: string, videos: VideoInsight[], themes: string[]) => {
  const topThree = videos.slice(0, 3);
  const headlineThemes =
    themes.length > 0 ? `Key momentum revolves around ${themes.slice(0, 3).join(", ")}.` : "";
  const inspirationLine = topThree
    .map((video) => `${video.title} (${video.views.toLocaleString()} views)`)
    .join("; ");

  return `Audience interest in ${topic} is clustering around ${headlineThemes} Notable reference videos: ${inspirationLine}. Use these as proof points to craft a differentiated position.`;
};

const buildHookIdeas = (topic: string, themes: string[], audience?: string) => {
  const angle = themes[0] ?? "the biggest shift";
  const hookAudience = audience ? `${audience}, ` : "";
  return [
    `${hookAudience}did you catch ${angle} happening in ${topic}? Here is why it matters right now.`,
    `I analyzed the most-watched ${topic} videos this week so you can skip the hype and copy what works.`,
    `Before you make your next move in ${topic}, you need to see how the top channels are framing the narrative.`,
  ];
};

const buildOutline = (topic: string, themes: string[]): OutlineSegment[] => {
  const segments: OutlineSegment[] = [];

  segments.push({
    title: "Hook & Context",
    durationHint: "0:00 - 0:45",
    talkingPoints: [
      `Drop an attention-grabbing stat or question that ties ${topic} to the viewer's everyday stakes.`,
      "Position the problem or opportunity in one sentence.",
      "Promise the transformation viewers will get by watching.",
    ],
    brollIdeas: [
      "YouTube analytics dashboard zoom-in",
      "Trending article headlines montage",
      "Fast-cut reaction shots",
    ],
  });

  themes.slice(0, 3).forEach((theme, index) => {
    segments.push({
      title: `Breakdown ${index + 1}: ${theme.replace(/^\w/, (c) => c.toUpperCase())}`,
      durationHint: `${index === 0 ? "0:45" : index === 1 ? "2:30" : "4:00"} - ${
        index === 0 ? "2:30" : index === 1 ? "4:00" : "5:30"
      }`,
      talkingPoints: [
        `Summarize what top creators are saying about ${theme}.`,
        "Call out what worked (hooks, pacing, visuals, CTAs).",
        "Explain how your take will evolve or improve that angle.",
      ],
      brollIdeas: [
        "Screen recordings of top videos with animated highlights",
        "Overlay of key statistics or quotes",
        "Relevant product or scenario footage",
      ],
    });
  });

  segments.push({
    title: "Action Plan & CTA",
    durationHint: "5:30 - 7:00",
    talkingPoints: [
      "Summarize the playbook viewers can replicate.",
      "Share one bonus tip or contrarian insight.",
      "Invite engagement with a specific question or challenge.",
    ],
    brollIdeas: [
      "Clean over-the-shoulder shot of action steps checklist",
      "Call-to-action animation",
      "Satisfied audience reaction visuals",
    ],
  });

  return segments;
};

const buildScript = (
  topic: string,
  themes: string[],
  audience?: string,
  tone?: string
): ScriptSection[] => {
  const persona = audience ? `${audience}` : "creators";
  const tonal = tone ?? "energetic yet trustworthy";
  const themeOne = themes[0] ?? "the game-changing shift";
  const themeTwo = themes[1] ?? "what top channels are doing differently";
  const themeThree = themes[2] ?? "the roadmap you can follow today";

  return [
    {
      heading: "Hook",
      paragraphs: [
        `You won't believe how fast ${topic} is evolving—one creator cracked ${themeOne}, and it's rewriting the rules.`,
        `If you're ${persona}, stay with me: we're breaking down the exact moves driving millions of views right now.`,
      ],
      callout: `Promise: by the end of this video you'll know how to apply ${themeOne} without copying anyone.`,
    },
    {
      heading: "Segment 1",
      paragraphs: [
        `Let’s start with ${themeOne}. The biggest breakout video frames it as a before-and-after transformation.`,
        `Notice their pacing: a strong cold open, data-backed proof, and a cliffhanger before each reveal.`,
        `Your spin? Anchor this shift to your viewers' lived reality. Make it personal, not abstract.`,
      ],
    },
    {
      heading: "Segment 2",
      paragraphs: [
        `Now, ${themeTwo}. Across top performers, the visuals never stall—pattern interrupts every 6 seconds.`,
        `Weave in motion graphics or quick cutaways that reinforce your main argument without feeling gimmicky.`,
        `Narrate in an ${tonal} voice—bring the urgency without losing clarity.`,
      ],
    },
    {
      heading: "Segment 3",
      paragraphs: [
        `Finally, ${themeThree}. Stack your advice as a mini roadmap: tease the payoff, outline steps, deliver the win.`,
        `Close each beat with a forward-looking question. You're priming comments and retention at the same time.`,
      ],
    },
    {
      heading: "Call To Action",
      paragraphs: [
        `Drop your biggest breakthrough in ${topic} inside the comments—we're building a community playbook together.`,
        `If this breakdown helped, subscribe for the weekly trend download. Your next viral idea might be in tomorrow's feed.`,
      ],
      callout: "CTA: Like + subscribe + answer the question to boost watch-time and signal the algorithm.",
    },
  ];
};

const buildSeo = (topic: string, themes: string[], keywords: string[]) => {
  const combined = Array.from(new Set([...themes, ...keywords])).slice(0, 12);
  return {
    titleIdeas: [
      `${topic}: ${themes[0] ? themes[0][0].toUpperCase() + themes[0].slice(1) : "The Playbook"} You Need Right Now`,
      `Stop Scrolling: ${topic} Strategy the Top Creators Won't Share`,
      `${topic} Trend Report: ${combined.slice(0, 3).join(" • ")}`,
    ],
    description: `I analyzed the most successful ${topic} videos this week to decode what actually works. Expect deep dives into ${combined
      .slice(0, 5)
      .join(", ")}, plus a step-by-step plan you can copy for your next upload.`,
    tags: combined,
  };
};

const buildActionItems = (topic: string, themes: string[], insights: VideoInsight[]) => {
  const references = insights
    .slice(0, 3)
    .map((video) => `Watch "${video.title}" to study their hook and pacing.`)
    .join(" ");
  return [
    `Draft your opening hook anchoring ${topic} to a real outcome your viewers want.`,
    `Storyboard three chapters around ${themes.slice(0, 3).join(", ")} and align visual interrupts for each.`,
    references || "Save at least two reference videos to mirror their energy and editing cadence.",
  ];
};

const scoreVideo = (video: VideoSearchResult, keywords: string[]) => {
  const views = video.views ?? 0;
  const viewScore = Math.log10(views + 1) / 6;
  const ageMinutes = parseAgeMinutes(video.ago);
  const ageScore = Math.exp(-ageMinutes / (60 * 24 * 21)); // half-life around 3 weeks

  const text = `${video.title} ${video.description ?? ""}`.toLowerCase();
  const matchCount = keywords.reduce(
    (acc, keyword) => (text.includes(keyword) ? acc + 1 : acc),
    0
  );
  const relevance = keywords.length > 0 ? matchCount / keywords.length : 0.3;

  const score = viewScore * 0.6 + ageScore * 0.3 + relevance * 0.4;

  return { score, relevance };
};

const dedupeVideos = (videos: VideoSearchResult[]) => {
  const map = new Map<string, VideoSearchResult>();
  for (const video of videos) {
    if (!video.videoId) continue;
    if (!map.has(video.videoId)) {
      map.set(video.videoId, video);
    }
  }
  return Array.from(map.values());
};

const fetchVideoSet = async (query: string) => {
  const result = await yts.search({ query, pages: 1 });
  return result.videos;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const topic = body.topic?.trim();

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        {
          status: 400,
        }
      );
    }

    const queryTokens = tokenize(`${topic} ${body.description ?? ""}`);
    const fallbackTokens = queryTokens.length > 0 ? queryTokens : tokenize(topic);

    const [primaryResults, trendingResults, expertResults] = await Promise.all([
      fetchVideoSet(topic),
      fetchVideoSet(`${topic} trending`),
      fetchVideoSet(`best ${topic}`),
    ]);

    const combinedRaw = dedupeVideos([...primaryResults, ...trendingResults, ...expertResults]);

    if (combinedRaw.length === 0) {
      return NextResponse.json(
        { error: "No videos found for the provided topic." },
        { status: 404 }
      );
    }

    const insights: VideoInsight[] = combinedRaw
      .map((video) => {
        const { score, relevance } = scoreVideo(video, fallbackTokens);
        return {
          id: video.videoId ?? video.url,
          title: video.title,
          url: video.url,
          thumbnail: video.thumbnail ?? video.image ?? "",
          channel: video.author?.name ?? "Unknown",
          views: video.views ?? 0,
          ago: video.ago ?? "Unknown",
          description: video.description ?? "",
          score,
          relevance,
          highlights: buildHighlights(video, fallbackTokens),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    const themeKeywords = aggregateKeywords(
      insights.map((video) => `${video.title} ${video.description}`)
    );

    const themes = themeKeywords.slice(0, 5);

    const response: AnalyzeResponse = {
      query: topic,
      summary: buildSummary(topic, insights, themes),
      hookIdeas: buildHookIdeas(topic, themes, body.audience),
      narrativeAngle: buildNarrativeAngle(topic, themes, body.audience, body.style),
      keyThemes: themes,
      actionItems: buildActionItems(topic, themes, insights),
      seo: buildSeo(topic, themes, themeKeywords),
      outline: buildOutline(topic, themes),
      script: buildScript(topic, themes, body.audience, body.style),
      inspiration: insights,
      metadata: {
        requestedAudience: body.audience,
        tone: body.style,
        durationHint: body.duration,
        language: body.language,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to analyze topic. Please try again later." },
      { status: 500 }
    );
  }
}
