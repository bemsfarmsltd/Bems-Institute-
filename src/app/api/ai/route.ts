import { NextRequest, NextResponse } from "next/server";
import {
  generateAITutorResponse,
  generateDynamicQuiz,
  generatePersonalizedStudyPlan,
  evaluateCodeSubmission,
  computeStudentRecommendations
} from "@/lib/gemini";

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
        const result = await generateAITutorResponse(prompt, courseTrack, tutorName, history);
        return NextResponse.json(result);
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
