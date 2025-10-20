import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Palette, Image, Heart } from "lucide-react";

const useCases = [
  {
    title: "Pre-Print",
    description:
      "Stop wasting hours on manual work. Get artwork ready to print, cut, or embroider fast. Speed up turnaround times, minimize hassles, and lower your costs.",
    icon: Printer,
  },
  {
    title: "Logos", 
    description:
      "Your logo needs to look crisp everywhere—website, business cards, flyers, banners. SVG and EPS vectors ensure consistent quality across all media.",
    icon: Palette,
  },
  {
    title: "Graphic Design",
    description:
      "The secret every designer knows: quickly get bitmap images into your vector compositions. Draw on paper, scan, vectorize, and refine your creation.",
    icon: Image,
  },
  {
    title: "... and More",
    description:
      "Create artistic effects from photos, vectorize graphs or maps, turn scanned artwork into something flexible. Try it today!",
    icon: Heart,
  },
];

export default function Component() {
  return (
    <Section
      title="USE CASES"
      subtitle="See What's Possible"
      description="Real professionals, real results. Here's how VectorCraft transforms your work into premium revenue streams—before your competition discovers it."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        {useCases.map((useCase, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-white border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <useCase.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
}
