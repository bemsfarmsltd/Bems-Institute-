import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { CourseCards } from "@/components/CourseCards";
import { EduportTrendingCourses } from "@/components/EduportTrendingCourses";
import { EduportStudentFeedback } from "@/components/EduportStudentFeedback";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#24292D]">
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
