import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { Download, MousePointer, Sparkles } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Just Drop Your Image",
    content:
      "No account needed. No forms to fill. Simply drag any JPG or JPEG image and watch the magic happen instantly. Our AI starts working the moment your image touches the screen.",
    image: "/1.png",
    icon: <MousePointer className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. AI Works Its Magic in 30 Seconds",
    content:
      "Our world-class AI analyzes every pixel and creates perfect vectors automatically. No manual work. No complex settings. No waiting around. Just professional results in under 30 seconds.",
    image: "/2.png",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Customize & Export",
    content:
      "Fine-tune your vectors with our intuitive color editor. Adjust colors, refine details, and perfect your design before exporting. Download as SVG or EPS files ready for any project.",
    image: "/3.png",
    icon: <Download className="w-6 h-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section 
      title="How It Works" 
      subtitle="From Image to Perfect Vector in 30 Seconds"
      description="Stop struggling with complex software. VectorCraft makes professional vectorization as simple as drag, drop, and download."
    >
      <Features data={data} />
    </Section>
  );
}
