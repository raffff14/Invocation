import React, { useState, useEffect, useRef } from "react";
import { Coins, Sparkles } from "lucide-react";
import GachaCard from "./GachaCard";
import { Character, Item, Metadata } from "./types";
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const S3_BUCKET_URL = import.meta.env.VITE_S3_BUCKET_URL;

interface GachaProps {
  // You can add any props if needed
}

type PulledItem = Character | Item;

function Gacha({}: GachaProps) {
  const [pulledItems, setPulledItems] = useState<PulledItem[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [newlyPulledItem, setNewlyPulledItem] = useState<PulledItem | null>(null);
  const [multiPullItems, setMultiPullItems] = useState<PulledItem[]>([]);

  const fetchItemData = async (isMultiPull: boolean = false): Promise<PulledItem | PulledItem[]> => {
    try {
      const token = localStorage.getItem('token'); // Assuming you store the JWT in localStorage
      const endpoint = isMultiPull ? '/api/gacha/multi-pull' : '/api/gacha/pull';
      
      const response = await axios.post(endpoint, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching item data:", error);
      throw error;
    }
  };

  const pullGacha = async () => {
    try {
      const newItem = await fetchItemData() as PulledItem;
      setNewlyPulledItem(newItem);

      // Set animation based on rarity
      let animation: string;
      switch (newItem.rarity) {
        case 6:
          animation = "images/gacha/radiance-multi.mp4";
          break;
        case 5:
          animation = "images/gacha/5star-single.mp4";
          break;
        case 4:
          animation = "images/gacha/4star-single.mp4";
          break;
        default:
          animation = "images/gacha/3star-single.mp4";
      }

      // Play the animation
      setIsAnimating(true);
      setCurrentAnimation(animation);
    } catch (error) {
      console.error("Failed to pull gacha:", error);
    }
  };

  const multiPullGacha = async () => {
    try {
      const newItems = await Promise.all(
        Array(10).fill(null).map(() => fetchItemData())
      );

      console.log("Pulled items:", newItems);
      setMultiPullItems(newItems);

      // Determine the highest rarity among pulled items
      const highestRarity = Math.max(...newItems.map(item => item.rarity));

      // Set animation based on highest rarity
      let animation: string;
      if (highestRarity >= 5) {
        animation = "images/gacha/5star-multi.mp4";
      } else {
        animation = "images/gacha/4star-multi.mp4";
      }

      // Play the animation
      setIsAnimating(true);
      setCurrentAnimation(animation);
    } catch (error) {
      console.error("Failed to multi-pull gacha:", error);
    }
  };

  const handleVideoEnd = () => {
    console.log("Video ended. Duration:", videoDuration);
    setIsAnimating(false);
    if (newlyPulledItem) {
      setPulledItems([newlyPulledItem]);
      setNewlyPulledItem(null);
    } else if (multiPullItems.length > 0) {
      setPulledItems(multiPullItems);
      setMultiPullItems([]);
    }
  };

  useEffect(() => {
    // Create and configure the ad options
    const atOptionsScript = document.createElement('script');
    atOptionsScript.type = "text/javascript";
    atOptionsScript.text = `
      atOptions = {
        'key' : '29c7ae6e74bda21ea49d7327f05d3f1f',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    document.head.appendChild(atOptionsScript);

    // Create and append the ad script to the ad-container
    const script2 = document.createElement('script');
    script2.src = "//www.highperformanceformat.com/29c7ae6e74bda21ea49d7327f05d3f1f/invoke.js";
    script2.async = true;
    script2.setAttribute("data-cfasync", "false");
    
    const adContainer = document.querySelector('.ad-container');
    if (adContainer) {
        
      adContainer.appendChild(script2);
    }

    return () => {
      // Cleanup the scripts when the component unmounts
      if (adContainer) {
        adContainer.removeChild(script2);
      }
    };
  }, []);

  return (
    <div className="flex flex-col justify-center">
      {/* Ad placeholder container */}
      
      <div className="relative w-full h-screen overflow-hidden video-wrapper">
        {/* Image that will have an overlay */}
        <img
          src="images/landing.png"
          alt="Landing"
          className="w-full h-auto"
        />
        {/* Overlay Ad container */}
        <div className="ad-container absolute inset-0 flex  justify-center"></div>
      </div>

      
      <div className="relative w-full h-screen overflow-hidden video-wrapper">
        <video
          src="images/ROLL.mp4"
          autoPlay
          muted
          loop
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-none"
          style={{ width: "100vw", height: "100vh", objectFit: "cover" }}
        />
        
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-4">
          
          <button
              onClick={pullGacha}
              className="bg-gradient-to-r from-blue-950 to-blue-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center w-auto hover:from-blue-500 hover:to-blue-600 transition duration-300 transform hover:scale-105"
            >
            <Sparkles className="w-5 h-5" />
            <span className="mx-2">
              1x Summon
            </span>
            <Sparkles className="w-5 h-5" />
          </button>
          <button 
            onClick={multiPullGacha}
            className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center w-auto hover:from-yellow-500 hover:to-orange-600 transition duration-300 transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            <span className="mx-2">
              10x Summons
            </span>
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isAnimating && currentAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <video
            ref={videoRef}
            src={currentAnimation}
            autoPlay
            muted
            onLoadedMetadata={() => {
              if (videoRef.current) {
                const duration = videoRef.current.duration * 1000;
                console.log("Video duration set:", duration);
                setVideoDuration(duration);
              }
            }}
            onEnded={handleVideoEnd}
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {!isAnimating && pulledItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            {pulledItems.length === 1 ? "Pulled Item" : "Pulled Items"}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {pulledItems.map((item) => (
              <GachaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Gacha;
