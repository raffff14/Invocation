import React, { useState, useEffect } from "react";
import { Character } from "../types";
import { Star } from "lucide-react";
import axios from "axios"; // Add this import for making HTTP requests

const S3_BUCKET_URL = 'https://your-s3-bucket-url.s3.amazonaws.com/'; // Replace with your S3 bucket URL

interface MarketplaceProps {
  userAddress: string;
  onPurchase: (character: Character) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ userAddress, onPurchase }) => {
  const [balance, setBalance] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"price" | "rarity">("price");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [marketplaceItems, setMarketplaceItems] = useState<Character[]>([]);

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        // Replace this with a call to your backend API to fetch the user's balance
        const response = await axios.get(`/api/users/${userAddress}/balance`);
        setBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };
    fetchUserBalance();
  }, [userAddress]);

  useEffect(() => {
    const fetchMarketplaceItems = async () => {
      try {
        // Replace this with a call to your backend API to fetch marketplace items
        const response = await axios.get('/api/marketplace/items');
        setMarketplaceItems(response.data);
      } catch (error) {
        console.error("Error fetching marketplace items:", error);
      }
    };
    fetchMarketplaceItems();
  }, []);

  const sortedCharacters = [...marketplaceItems].sort((a, b) => {
    if (sortBy === "price") {
      return Number(a.price) - Number(b.price);
    } else {
      return b.rarity - a.rarity;
    }
  });

  const handlePurchase = async (character: Character) => {
    try {
      // Replace this with a call to your backend API to handle the purchase
      await axios.post('/api/marketplace/purchase', { characterId: character.id, buyer: userAddress });

      onPurchase(character);
      setAlertMessage(`Successfully purchased ${character.name}!`);

      // Refresh user balance
      const balanceResponse = await axios.get(`/api/users/${userAddress}/balance`);
      setBalance(balanceResponse.data.balance);

      // Remove the purchased item from the marketplace
      setMarketplaceItems(prevItems => prevItems.filter(item => item.id !== character.id));
    } catch (error) {
      console.error("Purchase failed:", error);
      setAlertMessage("Purchase failed. Please try again.");
    }

    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleUnlist = async (character: Character) => {
    try {
      // Replace this with a call to your backend API to handle unlisting
      await axios.post('/api/marketplace/unlist', { characterId: character.id, seller: userAddress });

      setAlertMessage(`Successfully unlisted ${character.name}!`);

      // Remove the unlisted item from the marketplace
      setMarketplaceItems(prevItems => prevItems.filter(item => item.id !== character.id));
    } catch (error) {
      console.error("Unlisting failed:", error);
      setAlertMessage("Unlisting failed. Please try again.");
    }

    setTimeout(() => setAlertMessage(null), 3000);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">
        Marketplace
      </h2>

      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          Your Balance: <span className="text-yellow-400">{balance.toFixed(2)} Credits</span>
        </div>
        <select
          className="bg-purple-700 text-white p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "price" | "rarity")}
        >
          <option value="price">Sort by Price</option>
          <option value="rarity">Sort by Rarity</option>
        </select>
      </div>

      {alertMessage && (
        <div className="bg-blue-500 text-white p-4 rounded-md mb-4">
          <p className="font-bold">Notice</p>
          <p>{alertMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sortedCharacters.map((character) => (
          <div key={character.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 w-52 sm:w-56 md:w-60 lg:w-64">
            <div className="relative pb-[133%]">
              <img
                src={`${S3_BUCKET_URL}${character.image}`}
                alt={character.name}
                className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white truncate">
                {character.name}
              </h3>
              <div className="flex items-center mt-1">
                {Array.from({ length: character.rarity }).map((_, index) => (
                  <Star
                    key={index}
                    className="inline-block w-4 h-4 text-yellow-400 mr-1"
                  />
                ))}
              </div>
              <p className="text-lg text-yellow-400 font-bold mt-2">
                Price: {character.price} Credits
              </p>
              {character.seller === userAddress ? (
                <button
                  onClick={() => handleUnlist(character)}
                  className="mt-3 w-full bg-red-600 text-white text-base p-2 rounded hover:bg-red-700 transition duration-300"
                >
                  Unlist
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(character)}
                  className="mt-3 w-full bg-purple-600 text-white text-base p-2 rounded hover:bg-purple-700 transition duration-300"
                >
                  Purchase
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
