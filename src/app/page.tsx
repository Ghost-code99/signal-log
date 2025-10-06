import { Hero } from "@/components/marketing/hero";
import { Problem } from "@/components/marketing/problem";
import { Solution } from "@/components/marketing/solution";
import { CTA } from "@/components/marketing/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <CTA />
    </>
  );
}
