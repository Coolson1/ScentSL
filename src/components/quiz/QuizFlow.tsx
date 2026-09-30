"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { QuizQuestion } from "./QuizQuestion";
import { QuizResult } from "./QuizResult";
import { QuizIntro } from "./QuizIntro";
import { questions } from "@/lib/quiz-logic";
import type { QuizAnswer } from "@/lib/quiz-logic";

type QuizState = "intro" | "question" | "loading" | "result";

export function QuizFlow({ userId }: { userId: string }) {
  const [state, setState] = useState<QuizState>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const handleStart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setState("question");
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, { questionId: currentQuestion + 1, answer }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setState("loading");
      setTimeout(() => setState("result"), 1600);
    }
  };

  const handleRetake = () => {
    setAnswers([]);
    setCurrentQuestion(0);
    setState("intro");
  };

  return (
    <div className="bg-parchment pb-32">
      {state === "intro" && <QuizIntro onStart={handleStart} />}

      {state === "question" && (
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 sm:pt-16 lg:px-12 pt-12">
          <QuizQuestion questionId={currentQuestion + 1} onSelect={handleAnswer} />
        </div>
      )}

      {state === "loading" && <LoadingScreen />}

      {state === "result" && (
        <QuizResult answers={answers} userId={userId} onRetake={handleRetake} />
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.p
          className="font-display text-xl text-brand-gold sm:text-2xl"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Analyzing your olfactory profile & matching fragrance notes...
        </motion.p>
        <motion.div
          className="mt-6 h-px w-32 bg-gradient-to-r from-transparent via-brand-gold to-transparent sm:mt-8 sm:w-48"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}