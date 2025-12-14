import { Star } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

// Galaxy background styles
const galaxyStyles = `
  .galaxy-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -1;
    background: linear-gradient(to bottom, #0f0c29, #302b63, #24243e);
  }

  .stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .star {
    position: absolute;
    background-color: #fff;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    animation: twinkle 3s infinite;
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1); }
  }

  .shooting-star {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, #ffffff 50%, rgba(255,255,255,0) 100%);
    opacity: 0;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
  }
`;

// Add the styles to the document head
const addGalaxyStyles = () => {
  const styleId = 'galaxy-styles';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = galaxyStyles;
    document.head.appendChild(styleElement);
  }
};

// Call the function to add styles
if (typeof window !== 'undefined') {
  addGalaxyStyles();
}

// Create stars for the galaxy
const createStars = (container, count = 200) => {
  if (!container) return [];
  
  const stars = [];
  const containerRect = container.getBoundingClientRect();
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    const size = Math.random() * 2 + 1;
    const x = Math.random() * containerRect.width;
    const y = Math.random() * containerRect.height;
    const delay = Math.random() * 3;
    
    star.className = 'star';
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.animationDelay = `${delay}s`;
    
    container.appendChild(star);
    stars.push(star);
  }
  
  return stars;
};

// Create shooting stars
const createShootingStars = (container, count = 5) => {
  if (!container) return [];
  
  const shootingStars = [];
  const containerRect = container.getBoundingClientRect();
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    const length = Math.random() * 100 + 50;
    const x = Math.random() * containerRect.width;
    const y = Math.random() * containerRect.height;
    const angle = Math.random() * Math.PI * 2;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 10;
    
    star.className = 'shooting-star';
    star.style.width = `${length}px`;
    star.style.transform = `rotate(${angle}rad)`;
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.animation = `shoot ${duration}s ${delay}s infinite`;
    
    container.appendChild(star);
    shootingStars.push(star);
  }
  
  return shootingStars;
};

// Add shooting star animation
const addShootingStarAnimation = () => {
  const styleId = 'shooting-star-animation';
  if (!document.getElementById(styleId)) {
    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.innerHTML = `
      @keyframes shoot {
        0% {
          transform: rotate(var(--angle)) translateX(0);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: rotate(var(--angle)) translateX(500px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

const Home = () => {
  const { theme } = useTheme();
  const galaxyRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);

  useEffect(() => {
    if (theme !== 'light') return;

    // Create galaxy container if it doesn't exist
    let galaxy = document.getElementById('galaxy-bg');
    if (!galaxy) {
      galaxy = document.createElement('div');
      galaxy.id = 'galaxy-bg';
      galaxy.className = 'galaxy-bg';
      const starsContainer = document.createElement('div');
      starsContainer.className = 'stars';
      galaxy.appendChild(starsContainer);
      document.body.appendChild(galaxy);
      galaxyRef.current = galaxy;
      
      // Add shooting star animation
      addShootingStarAnimation();
      
      // Create stars and shooting stars
      const starsContainerEl = galaxy.querySelector('.stars');
      starsRef.current = createStars(starsContainerEl, 300);
      shootingStarsRef.current = createShootingStars(starsContainerEl, 8);
      
      // Make stars twinkle at different intervals
      starsRef.current.forEach((star, index) => {
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 4;
        star.style.animation = `twinkle ${duration}s ${delay}s infinite`;
      });
      
      // Make shooting stars move
      shootingStarsRef.current.forEach(star => {
        const angle = Math.random() * Math.PI * 2;
        star.style.setProperty('--angle', `${angle}rad`);
        const delay = Math.random() * 15;
        const duration = 2 + Math.random() * 3;
        star.style.animation = `shoot ${duration}s ${delay}s infinite`;
      });
    }
    
    // Cleanup function
    return () => {
      if (galaxy && document.body.contains(galaxy)) {
        document.body.removeChild(galaxy);
      }
      starsRef.current = [];
      shootingStarsRef.current = [];
    };
  }, [theme]);

  // No need for mouse position tracking anymore
  const styles = {};
  
  return (
    <div 
      className={`min-h-screen py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-around relative ${
        theme === 'dark' ? 'bg-[#2a2440]' : 'bg-transparent'
      }`}
    >
      {/* Content container with higher z-index */}
      <div className="relative z-10 w-full">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mt-10">
        
        <div className="text-left px-10">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm mb-6 ${
            theme === 'dark' 
              ? 'bg-[#41375c] text-white' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            ⚡ AI-Powered Reviews & SEO
          </div>

          {/* Heading */}
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-purple-100'
          }`}>
            Transform Your{" "}
            <span className="bg-clip-text text-transparent font-bold font-weight-bold bg-gradient-to-r from-[#5d3be6] via-[#7b5fff] to-[#9a7dff]">
              Business Reviews
            </span>{" "}
            with AI
          </h1>

         <p className={`text-lg mb-8 max-w-lg font-semibold ${
  theme === 'dark' ? 'text-white' : 'text-white'
}`}>
  Generate authentic reviews, craft perfect replies, and boost SEO rankings with our advanced AI platform. Trusted by 10,000+ businesses worldwide.
</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className={`px-6 py-3 font-semibold rounded-lg transition transform hover:-translate-y-1 hover:shadow-lg ${
              theme === 'dark'
                ? 'bg-white text-purple-600 hover:bg-gray-100'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}>
              Watch Demo
            </button>
            {/* <button className={`px-6 py-3 border font-semibold rounded-lg transition transform hover:-translate-y-1 hover:shadow-lg ${
              theme === 'dark'
                ? 'border-gray-400 text-white hover:bg-white/10'
                : 'border-purple-300 text-purple-700 hover:bg-purple-50'
            }`}>
              Learn More
            </button> */}
          </div>

          <div className={`flex flex-wrap items-center gap-6 text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <Star className="text-yellow-400 w-5 h-5" />
              <span>4.9/5 from 2,000+ reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>📈</span>
              <span>98% customer satisfaction</span>
            </div>
          </div>
        </div>
{/* Image Content - Right Side */}
<div className="relative order-1 lg:order-2 flex justify-end">
  <div className={`relative rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 w-full max-w-md ${
    theme === 'dark' 
      ? 'ring-1 ring-purple-900/50 shadow-[0_0_30px_rgba(147,51,234,0.5)]' 
      : 'ring-1 ring-purple-200 shadow-[0_0_30px_rgba(147,51,234,0.3)] bg-white/10 backdrop-blur-sm'
  }`}>
    <img
      src="https://png.pngtree.com/background/20250523/original/pngtree-futuristic-data-analytics-dashboard-with-neon-financial-graphs-picture-image_16528267.jpg"
      alt="AI Dashboard"
      className="w-full h-auto"
    />
    <div className={`absolute top-4 left-4 text-sm px-3 py-1 rounded-full shadow-lg ${
      theme === 'dark' 
        ? 'bg-black/60 text-green-400 border border-green-500/30' 
        : 'bg-green-100 text-green-800 border border-green-200'
    }`}>
      ● AI Active
    </div>
    <div className={`absolute bottom-4 right-4 text-sm px-3 py-1 rounded-full shadow-lg ${
      theme === 'dark' 
        ? 'bg-purple-600 text-white' 
        : 'bg-purple-100 text-purple-800 border border-purple-200'
    }`}>
      +247% Review Growth
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
