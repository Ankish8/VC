"use client";

import Marquee from "@/components/magicui/marquee";
import Section from "@/components/section";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "bg-primary/20 p-1 py-0.5 font-bold text-primary",
        className
      )}
    >
      {children}
    </span>
  );
};

export interface TestimonialCardProps {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const TestimonialCard = ({
  description,
  name,
  img,
  role,
  className,
  ...props
}: TestimonialCardProps) => (
  <div
    className={cn(
      "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      " border border-neutral-200 bg-white",
      className
    )}
    {...props}
  >
    <div className="select-none text-sm font-normal text-neutral-700">
      {description}
      <div className="flex flex-row py-1">
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
      </div>
    </div>

    <div className="flex w-full select-none items-center justify-start gap-5">
      <Image
        width={40}
        height={40}
        src={img || ""}
        alt={name}
        className="h-10 w-10 rounded-full ring-1 ring-border ring-offset-4"
      />

      <div>
        <p className="font-medium text-neutral-500">{name}</p>
        <p className="text-xs font-normal text-neutral-400">{role}</p>
      </div>
    </div>
  </div>
);

const testimonials = [
  {
    name: "Sarah Martinez",
    role: "Creative Director at BrandCraft Studio",
    img: "https://randomuser.me/api/portraits/women/91.jpg",
    description: (
      <p>
        VectorCraft has revolutionized our logo design workflow. Converting client JPEGs to vectors used to take hours.
        <Highlight>
          Now it takes just 30 seconds with perfect results.
        </Highlight>{" "}
        Our productivity has increased dramatically.
      </p>
    ),
  },
  {
    name: "Mike Johnson",
    role: "Owner at PrintPerfect Solutions",
    img: "https://randomuser.me/api/portraits/men/12.jpg",
    description: (
      <p>
        As a print shop owner, VectorCraft saves me from constantly asking clients for vector files.
        <Highlight>Perfect print quality every time, from business cards to billboards!</Highlight> Essential for any print business.
      </p>
    ),
  },
  {
    name: "Jennifer Kim",
    role: "Marketing Manager at TechStartup Inc",
    img: "https://randomuser.me/api/portraits/women/45.jpg",
    description: (
      <p>
        Our marketing team needed scalable logos for different media sizes. VectorCraft's AI is incredible.
        <Highlight>One upload gives us perfect vectors for web, print, and social media.</Highlight> No more pixelated logos!
      </p>
    ),
  },
  {
    name: "David Chen",
    role: "Freelance Graphic Designer",
    img: "https://randomuser.me/api/portraits/men/83.jpg",
    description: (
      <p>
        VectorCraft has become my secret weapon for client projects. Hand-tracing logos was eating up my profits.
        <Highlight>Now I can deliver professional vectors in minutes, not hours.</Highlight> Game-changer for freelancers.
      </p>
    ),
  },
  {
    name: "Lisa Rodriguez",
    role: "Brand Manager at Fashion Forward",
    img: "https://randomuser.me/api/portraits/women/1.jpg",
    description: (
      <p>
        Our apparel business needed vectors for embroidery and screen printing. VectorCraft's AI understands our designs perfectly.
        <Highlight>
          Clean, professional results that work beautifully on fabric.
        </Highlight>{" "}
        Essential for fashion brands.
      </p>
    ),
  },
  {
    name: "Tom Williams",
    role: "Sign Shop Owner at CustomSigns Pro",
    img: "https://randomuser.me/api/portraits/men/5.jpg",
    description: (
      <p>
        Vinyl cutting requires perfect vectors, and VectorCraft delivers every time. No more manual tracing or bad results.
        <Highlight>
          Crisp edges and perfect curves for professional signage.
        </Highlight>{" "}
        My customers love the quality.
      </p>
    ),
  },
  {
    name: "Amanda Thompson",
    role: "Art Director at Digital Agency",
    img: "https://randomuser.me/api/portraits/women/14.jpg",
    description: (
      <p>
        Client logos come in JPG and JPEG images, but we need vectors for scalability. VectorCraft's AI is simply the best.
        <Highlight>
          Maintains design integrity while creating perfect vectors.
        </Highlight>{" "}
        No more design compromises.
      </p>
    ),
  },
  {
    name: "Robert Garcia",
    role: "Web Developer at PixelPerfect",
    img: "https://randomuser.me/api/portraits/men/56.jpg",
    description: (
      <p>
        High-DPI displays demand scalable graphics. VectorCraft helps us convert client logos to SVG vectors instantly.
        <Highlight>
          Crisp, scalable logos that look perfect on any screen size.
        </Highlight>{" "}
        Essential for modern web development.
      </p>
    ),
  },
  {
    name: "Maria Gonzalez",
    role: "Owner at Custom Apparel Co",
    img: "https://randomuser.me/api/portraits/women/18.jpg",
    description: (
      <p>
        T-shirt printing requires vector files, but customers only have JPEGs. VectorCraft solved this problem completely.
        <Highlight>
          Perfect vectors for heat transfer, embroidery, and screen printing.
        </Highlight>{" "}
        Increased our order acceptance rate by 80%.
      </p>
    ),
  },
  {
    name: "James Patterson",
    role: "Creative Lead at Ad Agency Plus",
    img: "https://randomuser.me/api/portraits/men/73.jpg",
    description: (
      <p>
        VectorCraft's AI understands design nuances that other tools miss. Logo recreations are flawless.
        <Highlight>
          Saves our team 10+ hours per week on vector conversions.
        </Highlight>{" "}
        ROI paid for itself in the first month.
      </p>
    ),
  },
  {
    name: "Rachel Green",
    role: "Product Designer at StartupFlow",
    img: "https://randomuser.me/api/portraits/women/25.jpg",
    description: (
      <p>
        Creating product mockups requires scalable assets. VectorCraft converts our sketches and logos perfectly.
        <Highlight>From concept to vector in seconds, not hours.</Highlight>{" "}
        Accelerated our entire design process.
      </p>
    ),
  },
  {
    name: "Carlos Rivera",
    role: "Marketing Director at GrowthCorp",
    img: "https://randomuser.me/api/portraits/men/78.jpg",
    description: (
      <p>
        Brand consistency across all media requires vector logos. VectorCraft makes this effortless for our team.
        <Highlight>Professional quality vectors for every marketing campaign.</Highlight> Our brand never looked better.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <Section
      title="Testimonials"
      subtitle="What our customers are saying"
      className="max-w-8xl"
    >
      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  "[--duration:60s]": i === 1,
                  "[--duration:30s]": i === 2,
                  "[--duration:70s]": i === 3,
                })}
              >
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}
                  >
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-white from-20%"></div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-white from-20%"></div>
      </div>
    </Section>
  );
}
