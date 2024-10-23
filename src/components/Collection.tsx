// src/components/Collection.tsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import GachaCard from "./GachaCard";
import { Character, Item } from "../types"; // Adjust the import based on your project structure

type CollectionItem = (Character | Item) & { isListed?: boolean; price?: string };

const Collection: React.FC = () => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      try {
        // Assuming the server can extract user ID from the token
        const response = await axios.get(`/api/collection`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const items: CollectionItem[] = response.data.map((item: any) => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : `https://genshin-cards.s3.amazonaws.com/${item.image}`
        }));
        setCollection(items);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  if (loading) {
    return <div>Loading your collection...</div>;
  }

  return (
    <div className="mt-12">
      <h2 className="text-white text-xl font-bold mb-4">Your Collection</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {collection.length === 0 ? (
          <p className="text-white">No items collected yet.</p>
        ) : (
          collection.map((item) => (
            <div key={item.id} className="relative group">
              <GachaCard 
                item={item} 
                isListed={item.isListed} 
                price={item.price}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Collection;
