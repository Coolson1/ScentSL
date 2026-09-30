export type QuizAnswer = {
  questionId: number;
  answer: string;
};

export type FragranceCategory =
  | "Citrus & Fresh"
  | "Floral"
  | "Gourmand"
  | "Musk"
  | "Oriental & Amber"
  | "Oud"
  | "Woody"
  | string;

export type QuestionOption = {
  label: string;
  value: string;
  category: FragranceCategory;
  description?: string;
  notes: string[];
};

export type Question = {
  id: number;
  question: string;
  subtitle?: string;
  options: QuestionOption[];
};

export const questions: Question[] = [
  {
    id: 1,
    question: "What kind of vibe fits your style best?",
    subtitle: "Pick the mood that feels most like you",
    options: [
      {
        label: "Fresh, Bright & Full of Energy",
        value: "bright-energetic",
        category: "Citrus & Fresh",
        description: "Refreshing citrus, lemon, bergamot, and clean ocean air",
        notes: ["citrus", "bergamot", "lemon", "grapefruit", "orange", "neroli", "fresh", "aquatic", "green"],
      },
      {
        label: "Soft, Sweet & Gentle",
        value: "soft-romantic",
        category: "Floral",
        description: "Beautiful flowers like fresh roses, jasmine, and blossoms",
        notes: ["floral", "rose", "jasmine", "tuberose", "ylang-ylang", "peony", "blossom", "violet", "iris", "orchid"],
      },
      {
        label: "Warm, Rich & Sweet",
        value: "warm-seductive",
        category: "Oriental & Amber",
        description: "Warm amber, sweet vanilla, and rich gentle spices",
        notes: ["amber", "vanilla", "cinnamon", "spice", "tonka", "clove", "resins", "myrrh", "benzoin", "praline"],
      },
      {
        label: "Deep, Bold & Mysterious",
        value: "deep-mysterious",
        category: "Oud",
        description: "Rich dark woods, natural oud, leather, and smoky warmth",
        notes: ["oud", "leather", "saffron", "smoky", "incense", "wood", "birch", "dark", "guaiac", "tobacco"],
      },
    ],
  },
  {
    id: 2,
    question: "Where do you feel most relaxed or happy?",
    subtitle: "Pick the place or setting you love most",
    options: [
      {
        label: "Fresh ocean breeze on a sunny morning",
        value: "ocean-sunrise",
        category: "Citrus & Fresh",
        description: "Cool sea breeze, fresh orange, lemon, and clean air",
        notes: ["citrus", "bergamot", "lemon", "lime", "fresh", "sea salt", "marine", "aquatic"],
      },
      {
        label: "Cozy coffee shop with sweet treats",
        value: "candlelit-dinner",
        category: "Gourmand",
        description: "Warm vanilla, sweet caramel, honey, and roasted coffee",
        notes: ["gourmand", "praline", "coffee", "vanilla", "caramel", "honey", "chocolate", "cinnamon", "sweet"],
      },
      {
        label: "Warm luxury room with soothing spices",
        value: "hotel-lobby",
        category: "Oriental & Amber",
        description: "Warm amber, smooth spices, and rich relaxing scents",
        notes: ["amber", "incense", "patchouli", "tonka", "tobacco", "spicy", "oriental", "rich"],
      },
      {
        label: "Fresh woods & forest after rainy weather",
        value: "midnight-drive",
        category: "Woody",
        description: "Natural tree woods, fresh rain, cedar, and sandalwood",
        notes: ["woody", "cedar", "sandalwood", "vetiver", "tobacco", "cypress", "earthy", "pine", "moss"],
      },
    ],
  },
  {
    id: 3,
    question: "Which scents do you enjoy smelling the most?",
    subtitle: "Choose your favorite smells from everyday life",
    options: [
      {
        label: "Fresh Lemon, Orange & Mint",
        value: "fresh-citrus-herbs",
        category: "Citrus & Fresh",
        description: "Clean, zesty citrus fruits and fresh mint leaves",
        notes: ["bergamot", "lemon", "citrus", "mint", "herbal", "mandarin", "grapefruit", "green tea"],
      },
      {
        label: "Sweet Vanilla, Coffee & Chocolate",
        value: "vanilla-coffee-gourmand",
        category: "Gourmand",
        description: "Delicious sweet vanilla, caramel, and warm coffee",
        notes: ["vanilla", "praline", "coffee", "caramel", "cacao", "tonka", "gourmand", "sweet", "nutmeg"],
      },
      {
        label: "Fresh Flowers & Soft Skin Scents",
        value: "rose-jasmine-musk",
        category: "Floral",
        description: "Roses, jasmine, and soft, clean skin musk",
        notes: ["rose", "jasmine", "violet", "musk", "floral", "tuberose", "powder", "blossom", "orchid"],
      },
      {
        label: "Rich Wood, Leather & Warm Spices",
        value: "oud-leather-spices",
        category: "Oud",
        description: "Natural tree wood, rich leather, and warm cardamom spices",
        notes: ["oud", "leather", "sandalwood", "cedar", "saffron", "cardamom", "wood", "spicy"],
      },
    ],
  },
  {
    id: 4,
    question: "How do you want people to remember your scent?",
    subtitle: "The lasting impression you leave when you enter a room",
    options: [
      {
        label: "Clean, fresh and refreshing",
        value: "clean-refreshing",
        category: "Citrus & Fresh",
        description: "Like a breeze of clean air and fresh citrus",
        notes: ["clean", "fresh", "citrus", "bergamot", "aquatic", "green", "linen", "neroli"],
      },
      {
        label: "Sweet, warm and attractive",
        value: "sweet-addictive",
        category: "Gourmand",
        description: "Delicious warm vanilla, sweet honey, and caramel",
        notes: ["sweet", "vanilla", "praline", "cinnamon", "amber", "gourmand", "warm", "honey"],
      },
      {
        label: "Strong, bold and memorable",
        value: "bold-unforgettable",
        category: "Oud",
        description: "Rich dark wood, saffron, and deep luxury scents",
        notes: ["bold", "oud", "saffron", "leather", "smoke", "woody", "amberwood", "incense"],
      },
      {
        label: "Soft, smooth and elegant",
        value: "elegant-sensual",
        category: "Musk",
        description: "Subtle soft musk and gentle warm cedarwood",
        notes: ["musk", "ambrette", "iris", "sensual", "cedar", "powder", "clean", "sandalwood"],
      },
    ],
  },
];

// Common fragrance notes dictionary for dynamic note discovery
export const KNOWN_NOTES: string[] = [
  "amber", "ambrette", "apple", "aquatic", "bergamot", "birch", "blackcurrant", "blossom",
  "cacao", "cardamom", "caramel", "cedar", "cedarwood", "chestnut", "cinnamon", "citrus",
  "clove", "coffee", "cypress", "dates", "fig", "floral", "fruit", "gourmand", "grapefruit",
  "green tea", "guaiac", "heliotrope", "honey", "incense", "iris", "jasmine", "lavender",
  "leather", "lemon", "lime", "mandarin", "mint", "musk", "myrrh", "neroli", "nutmeg",
  "oakmoss", "orchid", "oriental", "oud", "patchouli", "peony", "pepper", "pine", "pink pepper",
  "praline", "rose", "rosewood", "saffron", "sandalwood", "sea salt", "smoke", "spicy",
  "strawberry", "sweet", "tobacco", "tonka", "tuberose", "vanilla", "vetiver", "violet",
  "white musk", "wood", "woody", "ylang-ylang"
];

export function calculateScores(answers: QuizAnswer[]): Record<string, number> {
  const scores: Record<string, number> = {
    "Citrus & Fresh": 0,
    Floral: 0,
    Gourmand: 0,
    Musk: 0,
    "Oriental & Amber": 0,
    Oud: 0,
    Woody: 0,
  };

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question) {
      const option = question.options.find((o) => o.value === answer.answer);
      if (option) {
        scores[option.category] = (scores[option.category] || 0) + 1;
      }
    }
  }

  return scores;
}

export function getTopCategories(
  scores: Record<string, number>,
  count: number = 3
): string[] {
  const sorted = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([category]) => category);

  if (sorted.length > 0) {
    return sorted.slice(0, count);
  }

  return Object.keys(scores).slice(0, count);
}

export type ScoredProduct<T> = {
  product: T;
  score: number;
  matchedNotes: string[];
  matchedCategories: string[];
};

/**
 * Dynamically scores a product based on user's quiz answers and notes found in the product details.
 * Compatible with existing and newly added products & notes.
 */
export function scoreProductForQuiz<
  T extends {
    id: string;
    name: string;
    description: string;
    category?: { name: string; slug?: string } | null;
  }
>(product: T, answers: QuizAnswer[]): ScoredProduct<T> {
  const selectedOptions: QuestionOption[] = [];
  for (const ans of answers) {
    const q = questions.find((q) => q.id === ans.questionId);
    if (q) {
      const opt = q.options.find((o) => o.value === ans.answer);
      if (opt) selectedOptions.push(opt);
    }
  }

  const categoryWeights: Record<string, number> = {};
  const userNoteKeywords = new Set<string>();

  for (const opt of selectedOptions) {
    categoryWeights[opt.category] = (categoryWeights[opt.category] || 0) + 1;
    for (const note of opt.notes) {
      userNoteKeywords.add(note.toLowerCase());
    }
  }

  const categoryName = product.category?.name || "";
  const prodText = `${product.name} ${product.description} ${categoryName}`.toLowerCase();

  let score = 0;
  const matchedNotesSet = new Set<string>();
  const matchedCategoriesSet = new Set<string>();

  // 1. Category Matching Score
  for (const [catName, weight] of Object.entries(categoryWeights)) {
    const normCat = catName.toLowerCase();
    const normProdCat = categoryName.toLowerCase();

    if (normProdCat.includes(normCat) || normCat.includes(normProdCat)) {
      score += weight * 15;
      matchedCategoriesSet.add(categoryName || catName);
    } else {
      // Partial match check (e.g., "Oud" inside "Oud Satin", "Fresh" inside "Citrus & Fresh")
      const catWords = normCat.split(/[\s&]+/);
      for (const word of catWords) {
        if (word.length > 2 && normProdCat.includes(word)) {
          score += weight * 5;
          matchedCategoriesSet.add(categoryName || catName);
        }
      }
    }
  }

  // 2. Note Keyword Matching Score
  for (const noteKeyword of Array.from(userNoteKeywords)) {
    if (prodText.includes(noteKeyword)) {
      score += 6;
      const displayNote = noteKeyword.charAt(0).toUpperCase() + noteKeyword.slice(1);
      matchedNotesSet.add(displayNote);
    }
  }

  // 3. Known Notes extraction from product text
  for (const note of KNOWN_NOTES) {
    if (userNoteKeywords.has(note) && prodText.includes(note)) {
      const displayNote = note.charAt(0).toUpperCase() + note.slice(1);
      matchedNotesSet.add(displayNote);
    }
  }

  return {
    product,
    score,
    matchedNotes: Array.from(matchedNotesSet),
    matchedCategories: Array.from(matchedCategoriesSet),
  };
}

export const categoryDescriptions: Record<string, { title: string; description: string }> = {
  "Citrus & Fresh": {
    title: "Citrus & Fresh",
    description: "Radiant, luminous, and invigorating. You embody the essence of brightness and sea-breeze vitality.",
  },
  Floral: {
    title: "Floral",
    description: "Romantic, graceful, and enchanting. Your presence carries the delicate beauty of blooming petals.",
  },
  Gourmand: {
    title: "Gourmand",
    description: "Sweet, indulgent, and irresistibly captivating. You leave a delicious trail of vanilla, honey & praline warmth.",
  },
  Musk: {
    title: "Musk",
    description: "Sensual, intimate, and profoundly elegant. Your aura exudes quiet confidence and second-skin warmth.",
  },
  "Oriental & Amber": {
    title: "Oriental & Amber",
    description: "Warm, opulent, and seductively rich. You radiate amber sophistication, exotic resin, and depth.",
  },
  Oud: {
    title: "Oud",
    description: "Dark, magnetic, and majestic. Your essence of natural agarwood, leather & saffron commands reverence.",
  },
  Woody: {
    title: "Woody",
    description: "Earthy, refined, and grounded. You carry the strength of ancient sandalwood & cedarwood forests.",
  },
};