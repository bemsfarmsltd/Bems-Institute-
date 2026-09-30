import { Router } from "express";
import {
  generateAITutorResponse,
  generateDynamicQuiz,
  generatePersonalizedStudyPlan,
  evaluateCodeSubmission,
  computeStudentRecommendations
} from "@/lib/gemini";
import { retrieveCourseKnowledge } from "@/lib/course-rag";
import { getSessionUser } from "@/lib/api-auth";
import { getLearningProfile } from "@/lib/learning-engine";
import { prisma } from "@/lib/prisma";
import { checkUsageQuota, recordAttempt, rateLimitMessage } from "@/lib/rate-limit";

const router = Router();

const AI_QUOTA_MAX_CALLS = 30;
const AI_QUOTA_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

router.post("/", async (req, res) => {
  // Every action below calls the Gemini API, which costs money per request —
  // this used to have no session check and no throttle at all, so anyone
  // could hit it in a loop anonymously. Require login and cap usage per user.
  const session = await getSessionUser(req);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const quotaKey = `ai-usage:${session.id}`;
  const quota = await checkUsageQuota(quotaKey, AI_QUOTA_MAX_CALLS, AI_QUOTA_WINDOW_MS);
  if (quota.blocked) {
    return res.status(429).json({ error: rateLimitMessage(quota.retryAfterSeconds!) });
  }
  await recordAttempt(quotaKey, true);

  try {
    const body = req.body ?? {};
    const { action } = body;

    switch (action) {
      case "tutor": {
        const { prompt, courseTrack, tutorName, history } = body;
        if (!prompt) {
          return res.status(400).json({ error: "Prompt is required" });
        }

        const ragSnippets = retrieveCourseKnowledge(prompt, courseTrack, 3);

        let weakConceptNames: string[] = [];
        let strongConceptNames: string[] = [];

        const profile = await getLearningProfile(session.id).catch(() => null);
        if (profile) {
          weakConceptNames = profile.weaknesses
            .filter((w) => w.masteryScore < 0.6)
            .map((w) => `${w.name} (${Math.round(w.masteryScore * 100)}%)`);
          strongConceptNames = profile.strengths
            .filter((s) => s.masteryScore >= 0.7)
            .map((s) => `${s.name} (${Math.round(s.masteryScore * 100)}%)`);
        }

        await prisma.learningEvent
          .create({
            data: {
              userId: session.id,
              courseId: courseTrack || "web-dev",
              eventType: "AI_TUTOR_USED",
              metadata: { prompt: String(prompt).slice(0, 200), tutorName }
            }
          })
          .catch(() => null);

        const contextBlocks: string[] = [];
        if (weakConceptNames.length > 0) {
          contextBlocks.push(`Student's current weak concepts from quiz history: ${weakConceptNames.join(", ")}.`);
        }
        if (strongConceptNames.length > 0) {
          contextBlocks.push(`Student's mastered concepts: ${strongConceptNames.join(", ")}.`);
        }
        if (ragSnippets.length > 0) {
          contextBlocks.push(
            `Relevant BEMS Course Material:\n` + ragSnippets.map((s) => `- [${s.title}]: ${s.content}`).join("\n")
          );
        }

        const enrichedPrompt =
          contextBlocks.length > 0
            ? `${prompt}\n\n[LEARNIQ CONTEXT — DO NOT REPEAT VERBATIM, USE TO PERSONALIZE ANSWER:\n${contextBlocks.join("\n")}]`
            : prompt;

        const result = await generateAITutorResponse(enrichedPrompt, courseTrack, tutorName, history);

        let finalReply = result.text;
        if (ragSnippets.length > 0 && !process.env.GEMINI_API_KEY) {
          const top = ragSnippets[0];
          finalReply += `\n\n---\n📖 **From Your BEMS Course Material (${top.title}):**\n> ${top.content}`;
          if (weakConceptNames.length > 0) {
            finalReply += `\n\n🎯 *Personalized Note:* Based on your quiz history, we are also reinforcing **${weakConceptNames.join(", ")}**.`;
          }
        }

        return res.json({
          text: finalReply,
          suggestedPrompts: result.suggestedPrompts,
          ragSources: ragSnippets.map((s) => ({ id: s.id, title: s.title, sourceType: s.sourceType, lessonUrl: s.lessonUrl })),
          weakConcepts: weakConceptNames
        });
      }

      case "quiz": {
        const { topic, difficulty, count, track } = body;
        const quiz = await generateDynamicQuiz(
          topic || "Full-Stack Web Architecture",
          difficulty || "Intermediate",
          count || 3,
          track || "Web Development"
        );
        return res.json(quiz);
      }

      case "study-plan": {
        const { studentName, trackTitle, hoursPerWeek, learningPace } = body;
        const plan = await generatePersonalizedStudyPlan(
          studentName || "FutureSkills Scholar",
          trackTitle || "Full-Stack Web Development",
          hoursPerWeek || 8,
          learningPace || "Standard"
        );
        return res.json(plan);
      }

      case "feedback": {
        const { submissionContent, track } = body;
        if (!submissionContent) {
          return res.status(400).json({ error: "Submission code or URL is required" });
        }
        const feedback = await evaluateCodeSubmission(submissionContent, track);
        return res.json(feedback);
      }

      case "recommendations": {
        const { courseId, progressPercent, quizScore } = body;
        const recommendations = computeStudentRecommendations(
          courseId || "web-dev",
          progressPercent !== undefined ? progressPercent : 75,
          quizScore
        );
        return res.json({ recommendations });
      }

      default:
        return res.status(400).json({ error: "Invalid action. Supported actions: tutor, quiz, study-plan, feedback, recommendations" });
    }
  } catch (err: unknown) {
    console.error("AI API Route Error:", err);
    return res.status(500).json({ error: "Failed to process AI request", details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
