import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { EcosystemBento4D } from "@/components/EcosystemBento4D";
import { CourseCards } from "@/components/CourseCards";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#18143D]">
      <Navbar />
      <main>
        <Hero />
        <EcosystemBento4D />
        <CourseCards />
      </main>
      <Footer />
    </div>
  );
}
