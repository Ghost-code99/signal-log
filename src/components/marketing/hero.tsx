"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { IconSparkles } from "@tabler/icons-react";
import { CTAModal } from "@/components/cta-modal";
import { AnimatedDots } from "@/components/ui/animated-dots";
import { BlurOrbs } from "@/components/ui/blur-orbs";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function Hero() {
  const scrollToProblem = () => {
    document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" });
  };

  // Stagger animation variants for text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.8,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/10">
      {/* Animated background effects */}
      <BlurOrbs />
      <AnimatedDots />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

      <div className="container relative z-10 mx-auto px-4 py-20 sm:py-32">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge with enhanced animation */}
          <motion.div variants={itemVariants} className="mb-8 inline-block">
            <Badge
              variant="outline"
              className="text-sm px-4 py-2 border-accent/30 text-accent-foreground bg-accent/10 backdrop-blur-sm shadow-lg"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                <IconSparkles className="w-4 h-4 mr-2 inline" />
              </motion.div>
              Coming Soon
            </Badge>
          </motion.div>

          {/* Main heading with enhanced gradient and animation */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="inline-block">Your AI</span>{" "}
            <span className="relative inline-block">
              <span className="relative bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                Strategy Partner
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 bg-clip-text text-transparent blur-lg"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Strategy Partner
              </motion.span>
            </span>
          </motion.h1>

          {/* Description with stagger effect */}
          <motion.div variants={itemVariants}>
            <motion.p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform scattered ideas into validated experiments. Accelerate
              your path to product-market fit with intelligent strategic
              collaboration.
            </motion.p>
          </motion.div>

          {/* CTA buttons with enhanced effects */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <CTAModal />
            <ShimmerButton
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={scrollToProblem}
              shimmerColor="rgba(120, 119, 198, 0.5)"
            >
              Learn More
            </ShimmerButton>
          </motion.div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-1/4 left-10 w-20 h-20 border-2 border-accent/20 rounded-full"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-10 w-16 h-16 border-2 border-purple-500/20 rounded-lg"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -180, -360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full backdrop-blur-sm"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator onClick={scrollToProblem} />
    </section>
  );
}
