export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "oe.json");

type OEItem = {
  project: string;
  response: string;
  createdAt: string;
};

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function stemWord(word: string) {
  return word
    .replace(/ing$/, "")
    .replace(/ed$/, "")
    .replace(/ly$/, "")
    .replace(/s$/, "");
}

function getSemanticTokens(text: string) {
  const stopWords = new Set([
    "the","a","an","and","or","but","is","are","was","were",
    "to","of","in","on","for","with","it","this","that",
    "i","me","my","we","they","you","very","really","overall"
  ]);

  return getWords(text)
    .map(stemWord)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function semanticSimilarityScore(a: string, b: string) {
  const tokensA = new Set(getSemanticTokens(a));
  const tokensB = new Set(getSemanticTokens(b));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let common = 0;

  tokensA.forEach((token) => {
    if (tokensB.has(token)) common++;
  });

  return common / Math.max(tokensA.size, tokensB.size);
}

function diversityScore(projectResponses: OEItem[]) {
  if (projectResponses.length < 5) return 1;

  const patterns = projectResponses.map((item) =>
    getSentencePattern(item.response)
  );

  const unique = new Set(patterns);

  return unique.size / patterns.length;
}
function getWords(text: string) {
  return normalizeText(text).split(" ").filter(Boolean);
}

function getFirstChars(text: string, count = 20) {
  return normalizeText(text).slice(0, count);
}

function getLastChars(text: string, count = 20) {
  const cleaned = normalizeText(text);
  return cleaned.slice(Math.max(0, cleaned.length - count));
}

function wordOverlapScore(a: string, b: string) {
  const wordsA = getWords(a);
  const wordsB = getWords(b);

  if (!wordsA.length || !wordsB.length) return 0;

  const common = wordsA.filter((word) => wordsB.includes(word));
  return common.length / Math.max(wordsA.length, wordsB.length);
}

function isSimilar(a: string, b: string) {
  const aa = normalizeText(a);
  const bb = normalizeText(b);

  if (aa === bb) return true;
  if (getFirstChars(aa) === getFirstChars(bb)) return true;
  if (getLastChars(aa) === getLastChars(bb)) return true;
  if (wordOverlapScore(aa, bb) > 0.6) return true;

  return false;
}

function getSentencePattern(text: string) {
  const words = getWords(text);

  return words
    .map((word) => {
      if (word.length <= 2) return "s";
      if (word.length <= 4) return "m";
      if (word.length <= 7) return "l";
      return "x";
    })
    .join("-");
}

function hasRepeatedPhrase(text: string) {
  const words = getWords(text);
  const seen = new Set<string>();

  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (seen.has(phrase)) return true;
    seen.add(phrase);
  }

  return false;
}

function botRiskCheck(response: string, existing: OEItem[], project: string) {
  const reasons: string[] = [];
  const cleaned = normalizeText(response);
  const words = getWords(response);
  const wordCount = words.length;

  const genericPhrases = [
    "it was good",
    "it was great",
    "very nice",
    "very good",
    "i like it",
    "i liked it",
    "it is useful",
    "it was helpful",
    "it was interesting",
    "overall it was good",
    "everything was good",
    "this was amazing",
    "this is amazing",
    "i am very interested",
    "i would love to try",
    "it seems effective",
    "it looks promising",
  ];

  const bottyWords = [
    "moreover",
    "furthermore",
    "additionally",
    "simultaneously",
    "highly effective",
    "innovative solution",
    "valuable experience",
    "overall experience",
    "in conclusion",
    "therefore",
    "significantly",
    "particularly",
  ];

  if (wordCount < 4) {
    reasons.push("Too short");
  }

  if (wordCount > 80) {
    reasons.push("Too long and unnatural for an OE");
  }

  for (const phrase of genericPhrases) {
    if (cleaned.includes(phrase)) {
      reasons.push(`Generic phrase detected: "${phrase}"`);
      break;
    }
  }

  const bottyMatches = bottyWords.filter((w) => cleaned.includes(w));
  if (bottyMatches.length >= 2) {
    reasons.push("Polished / bot-like wording detected");
  }

  if (hasRepeatedPhrase(response)) {
    reasons.push("Repeated phrase pattern detected");
  }

  const uniqueWords = new Set(words);
  if (words.length > 0 && uniqueWords.size / words.length < 0.6) {
    reasons.push("Low word variation");
  }

  const sameProject = existing.filter((item) => item.project === project);
  // 🔹 Semantic similarity (paraphrased duplicate detection)
const semanticMatches = sameProject.filter(
  (item) => semanticSimilarityScore(item.response, response) > 0.55
);

if (semanticMatches.length >= 1) {
  reasons.push("Semantic similarity detected / possible paraphrased duplicate");
}

// 🔹 Diversity scoring (detect too-perfect dataset)
const projectedResponses = [
  ...sameProject,
  {
    project,
    response,
    createdAt: new Date().toISOString(),
  },
];

const score = diversityScore(projectedResponses);

if (score < 0.45 && sameProject.length >= 5) {
  reasons.push("Low response diversity / too-patterned dataset");
}
  for (const item of sameProject) {
    if (isSimilar(item.response, response)) {
      reasons.push("Too similar to an existing response");
      break;
    }
  }

  const currentPattern = getSentencePattern(response);
  const patternMatches = sameProject.filter(
    (item) => getSentencePattern(item.response) === currentPattern
  );

  if (patternMatches.length >= 2) {
    reasons.push("Patterned structure similar to other saved responses");
  }

  const sameLengthMatches = sameProject.filter((item) => {
    const count = getWords(item.response).length;
    return Math.abs(count - wordCount) <= 1;
  });

  if (sameLengthMatches.length >= 3) {
    reasons.push("Very similar word-count pattern to existing responses");
  }

  const sameStartMatches = sameProject.filter(
    (item) => getFirstChars(item.response, 18) === getFirstChars(response, 18)
  );

  if (sameStartMatches.length >= 1) {
    reasons.push("Same starting line pattern detected");
  }

  const sameEndMatches = sameProject.filter(
    (item) => getLastChars(item.response, 18) === getLastChars(response, 18)
  );

  if (sameEndMatches.length >= 1) {
    reasons.push("Same ending line pattern detected");
  }

  const highOverlapMatches = sameProject.filter(
    (item) => wordOverlapScore(item.response, response) > 0.5
  );

  if (highOverlapMatches.length >= 2) {
    reasons.push("Similar tone/content to multiple existing responses");
  }

  return {
    blocked: reasons.length > 0,
    reasons,
    similar: sameProject.filter((item) => isSimilar(item.response, response)),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = String(body.project || "").trim();
    const response = String(body.response || "").trim();

    if (!project || !response) {
      return NextResponse.json({
        success: true,
        blocked: false,
        reasons: [],
        similar: [],
      });
    }

    let existing: OEItem[] = [];

    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        existing = parsed;
      }
    } catch {
      existing = [];
    }

    const risk = botRiskCheck(response, existing, project);

    return NextResponse.json({
      success: true,
      blocked: risk.blocked,
      reasons: risk.reasons,
      similar: risk.similar,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        blocked: false,
        reasons: [],
        similar: [],
        error: "Failed to check OE",
      },
      { status: 500 }
    );
  }
}