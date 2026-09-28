import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "tutor": {
        const { prompt, courseTrack, tutorName, history } = body;
        if (!prompt) {
          return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // 1. Retrieve matching BEMS course content (RAG)
        const ragSnippets = retrieveCourseKnowledge(prompt, courseTrack, 3);

        // 2. Fetch live student LearningProfile & ConceptMastery if signed in
        const session = await getSessionUser(req).catch(() => null);
        let weakConceptNames: string[] = [];
        let strongConceptNames: string[] = [];

        if (session) {
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
        }

        // 3. Build context-enriched prompt for Gemini / Tutor Engine
        const contextBlocks: string[] = [];
        if (weakConceptNames.length > 0) {
          contextBlocks.push(
            `Student's current weak concepts from quiz history: ${weakConceptNames.join(", ")}.`
          );
        }
        if (strongConceptNames.length > 0) {
          contextBlocks.push(
            `Student's mastered concepts: ${strongConceptNames.join(", ")}.`
          );
        }
        if (ragSnippets.length > 0) {
          contextBlocks.push(
            `Relevant BEMS Course Material:\n` +
              ragSnippets.map((s) => `- [${s.title}]: ${s.content}`).join("\n")
          );
        }

        const enrichedPrompt =
          contextBlocks.length > 0
            ? `${prompt}\n\n[LEARNIQ CONTEXT — DO NOT REPEAT VERBATIM, USE TO PERSONALIZE ANSWER:\n${contextBlocks.join("\n")}]`
            : prompt;

        const result = await generateAITutorResponse(
          enrichedPrompt,
          courseTrack,
          tutorName,
          history
        );

        // Append course RAG grounding note if using local fallback so learner sees course-specific context
        let finalReply = result.text;
        if (ragSnippets.length > 0 && !process.env.GEMINI_API_KEY) {
          const top = ragSnippets[0];
          finalReply += `\n\n---\n📖 **From Your BEMS Course Material (${top.title}):**\n> ${top.content}`;
          if (weakConceptNames.length > 0) {
            finalReply += `\n\n🎯 *Personalized Note:* Based on your quiz history, we are also reinforcing **${weakConceptNames.join(", ")}**.`;
          }
        }

        return NextResponse.json({
          text: finalReply,
          suggestedPrompts: result.suggestedPrompts,
          ragSources: ragSnippets.map((s) => ({
            id: s.id,
            title: s.title,
            sourceType: s.sourceType,
            lessonUrl: s.lessonUrl
          })),
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
        return NextResponse.json(quiz);
      }

      case "study-plan": {
        const { studentName, trackTitle, hoursPerWeek, learningPace } = body;
        const plan = await generatePersonalizedStudyPlan(
          studentName || "FutureSkills Scholar",
          trackTitle || "Full-Stack Web Development",
          hoursPerWeek || 8,
          learningPace || "Standard"
        );
        return NextResponse.json(plan);
      }

      case "feedback": {
        const { submissionContent, track } = body;
        if (!submissionContent) {
          return NextResponse.json({ error: "Submission code or URL is required" }, { status: 400 });
        }
        const feedback = await evaluateCodeSubmission(submissionContent, track);
        return NextResponse.json(feedback);
      }

      case "recommendations": {
        const { courseId, progressPercent, quizScore } = body;
        const recommendations = computeStudentRecommendations(
          courseId || "web-dev",
          progressPercent !== undefined ? progressPercent : 75,
          quizScore
        );
        return NextResponse.json({ recommendations });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: tutor, quiz, study-plan, feedback, recommendations" },
          { status: 400 }
        );
    }
  } catch (err: unknown) {
    console.error("AI API Route Error:", err);
    return NextResponse.json(
      { error: "Failed to process AI request", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
