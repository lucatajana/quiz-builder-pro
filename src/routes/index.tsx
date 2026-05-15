import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import questionsData from "@/data/questions.json";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Railway Transport Quiz" },
      { name: "description", content: "Practice multiple-choice questions on Railway Transport." },
    ],
  }),
  component: QuizPage,
});

type Q = {
  n: number;
  question: string;
  options: Record<string, string>;
  answer: string;
};

const ALL: Q[] = questionsData as Q[];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function QuizPage() {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(20);
  const [shuffleQ, setShuffleQ] = useState(true);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);

  const start = (n: number) => {
    const pool = shuffleQ ? shuffle(ALL) : ALL;
    setQuestions(pool.slice(0, Math.min(n, ALL.length)));
    setIdx(0);
    setPicked(null);
    setAnswers({});
    setDone(false);
    setStarted(true);
  };

  const score = useMemo(
    () => questions.reduce((s, q) => s + (answers[q.n] === q.answer ? 1 : 0), 0),
    [answers, questions],
  );

  if (!started) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            UPC · Master in Urban Mobility
          </p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight">Railway Transport Quiz</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {ALL.length} multiple-choice questions on railway systems, infrastructure and operations.
          </p>

          <Card className="mt-10 p-6">
            <label className="block text-sm font-medium">Number of questions</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {[10, 20, 50, ALL.length].map((n) => (
                <Button
                  key={n}
                  variant={count === n ? "default" : "outline"}
                  onClick={() => setCount(n)}
                >
                  {n === ALL.length ? `All (${ALL.length})` : n}
                </Button>
              ))}
            </div>

            <label className="mt-6 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={shuffleQ}
                onChange={(e) => setShuffleQ(e.target.checked)}
              />
              Shuffle questions
            </label>

            <Button className="mt-6 w-full" size="lg" onClick={() => start(count)}>
              Start quiz
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <h1 className="text-4xl font-bold">Results</h1>
          <p className="mt-2 text-2xl">
            {score} / {questions.length} <span className="text-muted-foreground">({pct}%)</span>
          </p>
          <Button className="mt-4" onClick={() => setStarted(false)}>
            New quiz
          </Button>

          <div className="mt-8 space-y-4">
            {questions.map((q, i) => {
              const user = answers[q.n];
              const ok = user === q.answer;
              return (
                <Card key={q.n} className="p-5">
                  <p className="text-sm text-muted-foreground">Question {i + 1}</p>
                  <p className="mt-1 font-medium">{q.question}</p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {Object.entries(q.options).map(([k, v]) => (
                      <li
                        key={k}
                        className={cn(
                          "rounded px-2 py-1",
                          k === q.answer && "bg-green-500/15 text-green-700 dark:text-green-400",
                          k === user && k !== q.answer && "bg-red-500/15 text-red-700 dark:text-red-400",
                        )}
                      >
                        <strong>{k})</strong> {v}
                      </li>
                    ))}
                  </ul>
                  {!ok && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Your answer: {user ? `${user})` : "—"} · Correct: {q.answer})
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  const q = questions[idx];
  const savedAnswer = answers[q.n];
  const submitted = savedAnswer !== undefined;
  const currentPick = submitted ? savedAnswer : picked;
  const isLast = idx + 1 >= questions.length;

  const submit = () => {
    if (!picked) return;
    setAnswers({ ...answers, [q.n]: picked });
  };
  const goTo = (newIdx: number) => {
    setIdx(newIdx);
    setPicked(null);
  };
  const prev = () => idx > 0 && goTo(idx - 1);
  const next = () => {
    if (isLast) setDone(true);
    else goTo(idx + 1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {idx + 1} of {questions.length}
          </span>
          <span>Score: {score}</span>
        </div>
        <Progress className="mt-2" value={((idx + 1) / questions.length) * 100} />

        <h2 className="mt-8 text-2xl font-semibold leading-snug">{q.question}</h2>

        <div className="mt-6 space-y-3">
          {Object.entries(q.options).map(([k, v]) => {
            const isPicked = currentPick === k;
            const isCorrect = k === q.answer;
            const showResult = submitted;
            return (
              <button
                key={k}
                onClick={() => !submitted && setPicked(k)}
                disabled={submitted}
                className={cn(
                  "block w-full rounded-lg border p-4 text-left transition-colors",
                  !showResult && isPicked && "border-primary bg-primary/5",
                  !showResult && !isPicked && "hover:bg-accent",
                  showResult && isCorrect && "border-green-500 bg-green-500/10",
                  showResult && !isCorrect && isPicked && "border-red-500 bg-red-500/10",
                )}
              >
                <strong className="mr-2">{k})</strong> {v}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={prev} disabled={idx === 0}>
            ← Previous
          </Button>
          <div className="flex gap-2">
            {!submitted && (
              <Button onClick={submit} disabled={!picked}>
                Submit
              </Button>
            )}
            <Button
              variant={submitted ? "default" : "outline"}
              onClick={next}
              disabled={isLast && !submitted}
            >
              {isLast ? "See results" : submitted ? "Next →" : "Skip →"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
