import Section from "@/components/section";
import { 
  Brain, 
  Network, 
  Hexagon, 
  Spline, 
  Square, 
  Zap, 
  RotateCcw, 
  Minimize2, 
  Palette, 
  Crosshair, 
  Settings, 
  Image, 
  Crop, 
  Layers 
} from "lucide-react";

const features = [
  {
    title: "Deep Vector Engine",
    description: "Building on our 15 years of experience in the field, we have created deep learning networks and classical algorithms that together form the core functionality of VectorCraft.",
    icon: <Brain className="h-6 w-6 text-primary" />,
  },
  {
    title: "Vector Graph",
    description: "Our proprietary computational geometry framework lets us make automated edits and localized optimizations that are simply not possible with conventional vector image representations.",
    icon: <Network className="h-6 w-6 text-primary" />,
  },
  {
    title: "Full Shape Fitting",
    description: "Going beyond simple Bezier curves, we fit complex whole geometric shapes where possible to get a perfect fit and unmatched consistency. We support fully parameterized circles, ellipses, rounded rectangles, and stars.",
    icon: <Hexagon className="h-6 w-6 text-primary" />,
  },
  {
    title: "High Performance",
    description: "Nobody likes to wait. We respect your time, so we make sure we are fully utilizing state of the art GPUs for deep learning, and run carefully tuned and massively parallel classical algorithms on multi-core CPUs.",
    icon: <Zap className="h-6 w-6 text-primary" />,
  },
  {
    title: "Symmetry Modelling",
    description: "Symmetry is everywhere in nature and especially in design. We detect and model mirror and rotational symmetries in your image to produce more accurate and more consistent results.",
    icon: <RotateCcw className="h-6 w-6 text-primary" />,
  },
  {
    title: "Sub-Pixel Precision",
    description: "We tease out features that are less than a pixel wide, and place boundaries according to the anti-aliasing pixel values. Details matter.",
    icon: <Crosshair className="h-6 w-6 text-primary" />,
  },
  {
    title: "Fully Automatic",
    description: "No user input is required to produce the result. Our advanced AI analyzes your image and automatically applies optimal settings for perfect vectorization.",
    icon: <Settings className="h-6 w-6 text-primary" />,
  },
  {
    title: "Multiple Image Types",
    description: "While originally designed for logos and other rasterized vector art, the algorithm also works really well on scans or photos of sketches and other drawn artwork, as well as photographs.",
    icon: <Image className="h-6 w-6 text-primary" />,
  },
  {
    title: "Full Color & Transparency",
    description: "We support full 32-bit color, including the alpha channel, which was incorporated as a first-class concept right from the start. Partially transparent areas and anti-aliasing are all fully supported.",
    icon: <Layers className="h-6 w-6 text-primary" />,
  },
];

export default function Component() {
  return (
    <Section title="Advanced AI Features" subtitle="Professional Vector Conversion Technology">
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-200">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg text-gray-900">
                {feature.title}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
