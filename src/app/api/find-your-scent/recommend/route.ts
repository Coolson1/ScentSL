import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScores, getTopCategories, scoreProductForQuiz } from "@/lib/quiz-logic";
import type { QuizAnswer } from "@/lib/quiz-logic";

export async function POST(request: NextRequest) {
  try {
    const { answers } = (await request.json()) as { answers: QuizAnswer[] };

    const scores = calculateScores(answers);
    const topCategories = getTopCategories(scores, 3);
    const primaryCategory = topCategories[0] || "Citrus & Fresh";

    // 1. Fetch all active products in the system
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // 2. Score each product dynamically based on user quiz answers, notes, and category
    const scoredProducts = allProducts.map((p) =>
      scoreProductForQuiz(
        {
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          images: p.images,
          slug: p.slug,
          isFeatured: p.isFeatured,
          createdAt: p.createdAt,
        },
        answers
      )
    );

    // 3. Sort scored products: highest score first, then featured, then newest
    scoredProducts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.product.isFeatured !== a.product.isFeatured) {
        return (b.product.isFeatured ? 1 : 0) - (a.product.isFeatured ? 1 : 0);
      }
      return new Date(b.product.createdAt).getTime() - new Date(a.product.createdAt).getTime();
    });

    // 4. Extract top 6 matching products (or best available active products)
    const topScored = scoredProducts.slice(0, 6);

    // Collect all matched notes across recommended products for UI summary
    const allMatchedNotesSet = new Set<string>();
    topScored.forEach((sp) => {
      sp.matchedNotes.forEach((n) => allMatchedNotesSet.add(n));
    });

    const recommendedProducts = topScored.map((sp) => ({
      id: sp.product.id,
      name: sp.product.name,
      slug: sp.product.slug,
      description: sp.product.description,
      images: sp.product.images,
      categoryName: sp.product.category?.name || "Fragrance",
      matchedNotes: sp.matchedNotes,
      matchScore: sp.score,
    }));

    return NextResponse.json({
      products: recommendedProducts,
      categories: topCategories,
      matchedNotes: Array.from(allMatchedNotesSet),
      primaryCategory,
    });
  } catch (error) {
    console.error("Quiz recommendation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}