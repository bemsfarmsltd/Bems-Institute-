import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CourseCards } from "@/components/CourseCards";
import { EduportTrendingCourses } from "@/components/EduportTrendingCourses";
import { EduportStudentFeedback } from "@/components/EduportStudentFeedback";
import { Footer } from "@/components/Footer";
import { AttributionCapture } from "@/components/AttributionCapture";
import { PageViewTracker } from "@/components/PageViewTracker";
import { HomeTour } from "@/components/tours/HomeTour";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#24292D]">
      <Suspense fallback={null}>
        <AttributionCapture />
        <PageViewTracker page="home" />
      </Suspense>
      <HomeTour />
      <Navbar />
      <main>
        <Hero />
        <CourseCards />
        <EduportTrendingCourses />
        <EduportStudentFeedback />
      </main>
      <Footer />
    </div>
  );
}
