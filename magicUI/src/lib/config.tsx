import { Icons } from "@/components/icons";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "VectorCraft",
  description: "Convert images to vectors with AI",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Vector", "Conversion", "Image", "AI", "SVG", "PDF", "EPS"],
  links: {
    email: "support@thevectorcraft.com",
    twitter: "https://twitter.com/magicuidesign",
    discord: "https://discord.gg/87p2vpsat5",
    github: "https://github.com/magicuidesign/magicui",
    instagram: "https://instagram.com/magicuidesign/",
  },
  header: [
    {
      href: "#features",
      label: "Features",
    },
    {
      href: "#pricing",
      label: "Pricing",
    },
    {
      href: "#faq",
      label: "FAQ",
    },
  ],
  pricing: [
    {
      name: "STARTER",
      href: "#",
      price: "$10",
      period: "month",
      yearlyPrice: "$8",
      features: [
        "100 conversions/month",
        "SVG & EPS export",
        "Email support",
        "Standard processing",
      ],
      description: "Perfect for individuals and small projects",
      buttonText: "Get Started",
      isPopular: false,
    },
    {
      name: "PROFESSIONAL",
      href: "#",
      price: "$19",
      period: "month",
      yearlyPrice: "$15",
      features: [
        "500 conversions/month",
        "SVG & EPS export",
        "Priority support",
        "Batch processing",
        "API access (coming soon)",
      ],
      description: "Ideal for designers and growing businesses",
      buttonText: "Get Started",
      isPopular: false,
    },
    {
      name: "LIFETIME",
      href: "#",
      price: "$39",
      period: "lifetime",
      yearlyPrice: "$39",
      features: [
        "Unlimited conversions",
        "SVG & EPS export",
        "Priority support",
        "Batch processing",
        "API access (coming soon)",
        "Lifetime updates",
      ],
      description: "One-time payment, unlimited access forever",
      buttonText: "Get Lifetime Deal",
      isPopular: true,
    },
  ],
  faqs: [
    {
      question: "What is VectorCraft and how does it work?",
      answer: (
        <span>
          VectorCraft is an AI-powered vector conversion tool that transforms any raster image (JPG, PNG, etc.) into perfect scalable vector graphics. Our proprietary Deep Vector Engine uses 15 years of research combining deep learning networks and classical algorithms to analyze your image and automatically generate high-quality vector representations in formats like SVG, PDF, and EPS.
        </span>
      ),
    },
    {
      question: "What file formats does VectorCraft support?",
      answer: (
        <span>
          <strong>Input formats:</strong> We support JPG and JPEG image formats. <strong>Output formats:</strong> Export your vectors as SVG and EPS. Both output formats maintain full color depth and transparency support for professional use.
        </span>
      ),
    },
    {
      question: "How accurate is the AI conversion process?",
      answer: (
        <span>
          Our Deep Vector Engine achieves sub-pixel precision with advanced symmetry modeling and full shape fitting. Unlike simple auto-trace tools, we detect and fit complex geometric shapes (circles, ellipses, rounded rectangles) and maintain perfect symmetries. The AI automatically optimizes settings for each image type, whether it's logos, artwork, sketches, or photographs.
        </span>
      ),
    },
    {
      question: "What's included in each pricing plan?",
      answer: (
        <span>
          <strong>Starter ($10/month):</strong> 100 conversions, SVG & EPS export, email support. <strong>Professional ($19/month):</strong> 500 conversions, SVG & EPS export, priority support, batch processing. <strong>Lifetime Deal ($39 one-time):</strong> Unlimited conversions, SVG & EPS export, priority support, batch processing, lifetime updates. API access is coming soon for Professional and Lifetime plans.
        </span>
      ),
    },
    {
      question: "Is there a file size or resolution limit?",
      answer: (
        <span>
          VectorCraft can handle images up to 50MB and resolutions up to 10,000x10,000 pixels across all plans. Our high-performance GPU processing ensures fast conversion times even for large, complex images. The quality of vector output remains consistently high regardless of input resolution.
        </span>
      ),
    },
    {
      question: "How long does the conversion process take?",
      answer: (
        <span>
          Most conversions complete in 10-30 seconds depending on image complexity. Simple logos typically process in under 15 seconds, while detailed artwork or photographs may take up to 60 seconds. Our GPU-accelerated processing and parallel algorithms ensure optimal performance for all image types.
        </span>
      ),
    },
    {
      question: "Can I batch process multiple images?",
      answer: (
        <span>
          Yes! Batch processing is available with Professional and Lifetime plans. Upload multiple images simultaneously and convert them all with consistent settings. This feature is perfect for processing logo variations, artwork series, or large image collections efficiently.
        </span>
      ),
    },
    {
      question: "What makes VectorCraft different from other vectorization tools?",
      answer: (
        <span>
          VectorCraft uses proprietary Vector Graph technology and 15 years of computational geometry research. Unlike simple auto-trace tools, we employ deep learning for intelligent shape detection, full geometric shape fitting (not just Bezier curves), symmetry modeling, and sub-pixel precision. Our fully automatic AI requires no manual input or parameter tweaking.
        </span>
      ),
    },
    {
      question: "When will API access be available?",
      answer: (
        <span>
          API access is currently in development and will be available to Professional and Lifetime plan users in Q4 2025. The API will support batch processing, webhook notifications, and integration with popular design tools. Existing users will receive early access and detailed documentation when it launches.
        </span>
      ),
    },
    {
      question: "Is the Lifetime Deal really lifetime access?",
      answer: (
        <span>
          Yes! The $39 Lifetime Deal provides permanent access to VectorCraft with unlimited conversions, all export formats, priority support, and lifetime updates. This limited-time offer includes all future features and improvements. No recurring fees, no hidden costs - pay once, use forever.
        </span>
      ),
    },
    {
      question: "What kind of support do you provide?",
      answer: (
        <span>
          We offer email support for all plans with typical response times under 24 hours. Professional and Lifetime users receive priority support with faster response times. Our support includes technical assistance, conversion optimization tips, and help with specific use cases. We also provide comprehensive documentation and tutorials.
        </span>
      ),
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: (
        <span>
          Yes, you can cancel your monthly subscription at any time from your account dashboard. There are no cancellation fees or penalties. Your access continues until the end of your current billing period. Lifetime Deal purchases are one-time payments with no subscription to cancel.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "/#features", text: "Features", icon: null },
        { href: "/#pricing", text: "Pricing", icon: null },
        { href: "/#faq", text: "FAQ", icon: null },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/contact", text: "Contact Us", icon: null },
        { href: "mailto:support@thevectorcraft.com", text: "Email Support", icon: null },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", text: "Privacy Policy", icon: null },
        { href: "/terms", text: "Terms of Service", icon: null },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
