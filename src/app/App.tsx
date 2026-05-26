import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

const smoothEase = [0.22, 1, 0.36, 1] as const;
const slideTransition = {
  type: "spring" as const,
  stiffness: 110,
  damping: 34,
  mass: 1.05,
};
const fadeTransition = { duration: 0.55, ease: smoothEase };
const NAV_COOLDOWN_MS = 550;

type PortfolioCard = {
  id: number;
  type: "iframe" | "image";
  src: string;
  color: string;
  title: string;
  embedScale?: number;
};

const cards: PortfolioCard[] = [
  {
    id: 1,
    type: "iframe",
    src: "https://embed.figma.com/design/kYBSqHoVMEB4kODxv14vcK/iaff--26?node-id=0-1&embed-host=share&scaling=contain",
    embedScale: 0.78,
    color: "#FFB6D9",
    title: "IAFF '26",
  },
  {
    id: 2,
    type: "iframe",
    src: "https://embed.figma.com/design/LxHbNvypFgGQziwFQEkdyP/stride-?node-id=0-1&embed-host=share&scaling=scale-down-width",
    color: "#87CEEB",
    title: "Stride",
  },
  {
    id: 3,
    type: "iframe",
    src: "https://embed.figma.com/design/gFfc6cgGNlvmYmc71N0vrS/places?node-id=0-1&embed-host=share&scaling=scale-down-width",
    color: "#B19CD9",
    title: "Places",
  },
  {
    id: 4,
    type: "iframe",
    src: "https://embed.figma.com/design/GTBzDbCFLAOh01cfdPibTM/stemify-v0?node-id=0-1&embed-host=share&scaling=scale-down-width",
    color: "#90EE90",
    title: "Stemifyy",
  },
  {
    id: 5,
    type: "iframe",
    src: "https://embed.figma.com/design/eIm6Nub6xG56T3iwnpDpKR/stemify-v2--25-?node-id=0-1&embed-host=share&scaling=scale-down-width",
    color: "#FDFD96",
    title: "Stemifyy v2",
  },
  {
    id: 6,
    type: "iframe",
    src: "https://embed.figma.com/design/RW3beKdefSTDd0OJowLi98/orbitulus?node-id=0-1&embed-host=share&scaling=scale-down-width",
    color: "#FFE6F0",
    title: "Orbitulus",
  },
];

function FigmaEmbed({
  src,
  embedScale,
  pointerEvents = "auto",
  border = "1px solid rgba(0, 0, 0, 0.1)",
}: {
  src: string;
  embedScale?: number;
  pointerEvents?: "auto" | "none";
  border?: string;
}) {
  const scaled = embedScale !== undefined && embedScale < 1;

  const iframe = (
    <iframe
      src={src}
      allowFullScreen
      width={scaled ? undefined : "100%"}
      height={scaled ? undefined : "100%"}
      style={
        scaled
          ? {
              border,
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${100 / embedScale}%`,
              height: `${100 / embedScale}%`,
              transform: `translate(-50%, -50%) scale(${embedScale})`,
            }
          : { border }
      }
      className={
        scaled
          ? pointerEvents === "none"
            ? "pointer-events-none"
            : "pointer-events-auto"
          : `size-full ${pointerEvents === "none" ? "pointer-events-none" : "pointer-events-auto"}`
      }
    />
  );

  if (scaled) {
    return <div className="relative size-full overflow-hidden">{iframe}</div>;
  }

  return iframe;
}

function Pill({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="-translate-x-1/2 absolute bg-[#e6e5e0] h-[30px] left-1/2 rounded-[1280px] w-[95px] hover:bg-[#d8d7d2] transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] cursor-pointer"
      data-name="Pill"
    >
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[29px] left-[calc(50%-0.58px)] pointer-events-none rounded-[1280px] top-[calc(50%-0.75px)] w-[94px]" data-name="Pill:shadow">
        <div aria-hidden="true" className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[1280px]" />
        <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_8px_4px_rgba(60,60,60,0.25)]" />
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 flex items-center gap-1 font-['Victor_Mono:Light',sans-serif] font-light text-[#101010] text-[11.5px] tracking-[0.288px] uppercase">
        <span className="leading-none">NEXT</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-2.5 w-2.5 shrink-0"
          aria-hidden
        >
          <path d="M5 12h12M13 7l5 5-5 5" />
        </svg>
      </div>
    </button>
  );
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [direction, setDirection] = useState(0);
  const lastNavAt = useRef(0);

  const canNavigate = () => {
    const now = Date.now();
    if (now - lastNavAt.current < NAV_COOLDOWN_MS) return false;
    lastNavAt.current = now;
    return true;
  };

  const handleNext = () => {
    if (!canNavigate()) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (!canNavigate()) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleScroll = (e: WheelEvent) => {
    if (expandedCard !== null) return;

    if (e.deltaX > 50 || e.deltaY > 50) {
      if (!canNavigate()) return;
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    } else if (e.deltaX < -50 || e.deltaY < -50) {
      if (!canNavigate()) return;
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (expandedCard !== null) return;

    if (touchStart - touchEnd > 75) {
      if (!canNavigate()) return;
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }
    if (touchStart - touchEnd < -75) {
      if (!canNavigate()) return;
      setDirection(-1);
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleScroll as any);
    window.addEventListener("touchstart", handleTouchStart as any);
    window.addEventListener("touchmove", handleTouchMove as any);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleScroll as any);
      window.removeEventListener("touchstart", handleTouchStart as any);
      window.removeEventListener("touchmove", handleTouchMove as any);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndex, expandedCard, touchStart, touchEnd]);

  const handleCardClick = () => {
    setExpandedCard(currentIndex);
  };

  const handleCloseModal = () => {
    setExpandedCard(null);
  };

  const currentCard = cards[currentIndex];
  const prevCard = cards[(currentIndex - 1 + cards.length) % cards.length];
  const nextCard = cards[(currentIndex + 1) % cards.length];

  return (
    <>
      <motion.div
        className="relative size-full overflow-hidden"
        animate={{
          background: `linear-gradient(to bottom, ${currentCard.color}, #ededed)`,
        }}
        transition={{ duration: 0.9, ease: smoothEase }}
        data-name="portfolio-carousel"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden py-6 sm:py-8 px-2 sm:px-4">
        {/* Cards Container */}
        <div className="w-full max-w-[1600px] flex items-center justify-center gap-3 md:gap-4 lg:gap-6">
          {/* Previous Card Preview */}
          <motion.div
            key={`prev-${prevCard.id}`}
            initial={{ opacity: 0.25, scale: 0.98 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={fadeTransition}
            className="hidden lg:block w-[180px] xl:w-[220px] aspect-[16/9] bg-white rounded-xl overflow-hidden cursor-pointer hover:opacity-60 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex-shrink-0"
            onClick={handlePrev}
          >
            {prevCard.type === "image" ? (
              <img
                src={prevCard.src}
                alt={`Previous card`}
                className="size-full object-cover"
              />
            ) : (
              <FigmaEmbed
                src={prevCard.src}
                embedScale={prevCard.embedScale}
                pointerEvents="none"
              />
            )}
          </motion.div>

          {/* Main Card Viewport */}
          <div className="relative w-full max-w-[min(78vw,720px)] sm:max-w-[min(68vw,640px)] md:max-w-[560px] lg:max-w-[680px] xl:max-w-[760px] aspect-[16/9] max-h-[36vh] sm:max-h-[40vh] md:max-h-[44vh] lg:max-h-[48vh] mx-auto flex-shrink-0">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{
                  x: direction > 0 ? 120 : direction < 0 ? -120 : 0,
                  scale: 0.94,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  x: 0,
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  x: direction > 0 ? -120 : direction < 0 ? 120 : 0,
                  scale: 0.94,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                transition={slideTransition}
                className="absolute inset-0 bg-white rounded-xl md:rounded-2xl overflow-hidden will-change-transform"
              >
                {currentCard.type === "image" ? (
                  <img
                    src={currentCard.src}
                    alt={`Card ${currentCard.id}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <FigmaEmbed
                    src={currentCard.src}
                    embedScale={currentCard.embedScale}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Expand Button */}
            <button
              onClick={handleCardClick}
              className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 bg-white/90 hover:bg-white rounded-lg flex items-center justify-center opacity-80 hover:opacity-100 transition-[opacity,transform,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 z-20 cursor-pointer"
              aria-label="Expand card"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>
          </div>

          {/* Next Card Preview */}
          <motion.div
            key={`next-${nextCard.id}`}
            initial={{ opacity: 0.25, scale: 0.98 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={fadeTransition}
            className="hidden lg:block w-[180px] xl:w-[220px] aspect-[16/9] bg-white rounded-xl overflow-hidden cursor-pointer hover:opacity-60 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex-shrink-0"
            onClick={handleNext}
          >
            {nextCard.type === "image" ? (
              <img
                src={nextCard.src}
                alt={`Next card`}
                className="size-full object-cover"
              />
            ) : (
              <FigmaEmbed
                src={nextCard.src}
                embedScale={nextCard.embedScale}
                pointerEvents="none"
              />
            )}
          </motion.div>
        </div>

        {/* Navigation, dots, and title — stacked below the card */}
        <div className="mt-3 sm:mt-4 md:mt-5 flex flex-col items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="relative h-[30px] w-[95px]">
            <Pill onClick={handleNext} />
          </div>

          <div className="flex gap-1.5">
            {cards.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  if (index === currentIndex || !canNavigate()) return;
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                animate={{
                  scale: index === currentIndex ? 1.35 : 1,
                  opacity: index === currentIndex ? 1 : 0.3,
                }}
                whileHover={{ opacity: index === currentIndex ? 1 : 0.5 }}
                transition={{ duration: 0.4, ease: smoothEase }}
                className="h-1.5 w-1.5 rounded-full bg-[#101010]"
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={fadeTransition}
              className="mt-1.5 [word-break:break-word] font-['Instrument_Serif',serif] font-normal text-[clamp(22px,3.2vw,56px)] text-[#101010] text-center tracking-[-0.037em] leading-none px-4 pb-1"
            >
              {currentCard.title}
            </motion.div>
          </AnimatePresence>
        </div>
        </div>
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {expandedCard !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: smoothEase }}
              className="fixed inset-0 z-40"
              style={{ backdropFilter: "blur(20px)", backgroundColor: "rgba(0, 0, 0, 0.4)" }}
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.55, ease: smoothEase }}
              className="fixed inset-8 md:inset-12 lg:inset-16 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* macOS Window Controls */}
              <div className="flex items-center gap-2 p-4 bg-[#f6f6f6] border-b border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF3B30] transition-colors flex items-center justify-center group"
                  aria-label="Close"
                >
                  <span className="text-[#8E0000] text-[8px] opacity-0 group-hover:opacity-100">×</span>
                </button>
                <button
                  className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFB300] transition-colors flex items-center justify-center group"
                  aria-label="Minimize"
                >
                  <span className="text-[#995700] text-[8px] opacity-0 group-hover:opacity-100">−</span>
                </button>
                <button
                  className="w-3 h-3 rounded-full bg-[#28CA42] hover:bg-[#1FA833] transition-colors flex items-center justify-center group"
                  aria-label="Maximize"
                >
                  <span className="text-[#006500] text-[8px] opacity-0 group-hover:opacity-100">+</span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden bg-white">
                {cards[expandedCard]?.type === "image" ? (
                  <img
                    src={cards[expandedCard]?.src}
                    alt={`Card ${expandedCard + 1}`}
                    className="size-full object-contain"
                  />
                ) : (
                  <FigmaEmbed
                    src={cards[expandedCard]?.src ?? ""}
                    embedScale={cards[expandedCard]?.embedScale}
                    border="none"
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}