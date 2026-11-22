import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app } from "@/app";
import { prisma } from "@/lib/prisma";
import { LMS_COURSES } from "@/data/lms-data";
import { resolveTrackId, tutorForTrack } from "@/lib/tutors";
import { createTestStudent, cleanupTestData } from "./helpers";

afterAll(cleanupTestData);

describe("track and tutor resolution", () => {
  it("maps course ids, old ids and track titles to real courses", () => {
    expect(resolveTrackId("web-dev")).toBe("web-dev");
    expect(resolveTrackId("graphic-design")).toBe("product-design");
    expect(resolveTrackId("UI/UX & Product Design")).toBe("product-design");
    expect(resolveTrackId("Generative AI & Automation")).toBe("ai-automation");
    expect(resolveTrackId("Cybersecurity Defense")).toBe("cybersecurity");
    expect(resolveTrackId("Full-Stack Web Development")).toBe("web-dev");
    expect(resolveTrackId(undefined)).toBe("web-dev");
    expect(resolveTrackId({ evil: true })).toBe("web-dev");
  });

  it("takes every tutor from the course catalogue", () => {
    for (const course of LMS_COURSES) {
      const tutor = tutorForTrack(course.id);
      expect(tutor.name).toBe(course.tutor);
      expect(tutor.promptIdentity).not.toMatch(/Okeke|Adeleke|Amaka|Tunde|Johnson|David|October/);
    }
    expect(tutorForTrack("cybersecurity").promptIdentity).toMatch(/^the BEMS Cybersecurity tutor/);
  });
});

describe("AI tutor route", () => {
  it("ignores the browser's tutor name and records the real course", async () => {
    const { agent, userId } = await createTestStudent("ai-tutor");
    const res = await agent.post("/api/ai", {
      action: "tutor",
      prompt: "hello there",
      courseTrack: "graphic-design",
      tutorName: "Engr. David Kalu"
    });
    expect(res.status).toBe(200);
    expect(res.body.text).not.toMatch(/David|Kalu/);
    const event = await prisma.learningEvent.findFirstOrThrow({ where: { userId, eventType: "AI_TUTOR_USED" } });
    expect(event.courseId).toBe("product-design");
    expect((event.metadata as { tutorName?: string }).tutorName).toBe("Temi");
  });

  it("finds course material for the AI page's old product-design id", async () => {
    const res = await request(app).post("/api/ai").send({ action: "tutor", prompt: "figma auto layout", courseTrack: "graphic-design" });
    expect(res.status).toBe(200);
    expect(res.body.ragSources.length).toBeGreaterThan(0);
  });
});
