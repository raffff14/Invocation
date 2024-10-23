// src/components/Collection.tsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import GachaCard from "./GachaCard";
import { Character, Item } from "../types"; // Adjust the import based on your project structure

interface CollectionProps {
  account: string | null;
}

type CollectionItem = (Character | Item) & { isListed?: boolean; price?: string };

const Collection: React.FC<CollectionProps> = ({ account }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      if (!account) return;

      setLoading(true);
      try {
        const response = await axios.get(`/api/collection/${account}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const items: CollectionItem[] = response.data.map((item: any) => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : `https://your-s3-bucket-url.s3.amazonaws.com/${item.image}`
        }));
        setCollection(items);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [account]);

  if (loading) {
    return <div>Loading your collection...</div>;
  }

  return (
    <div>
      <h2>Your Collection</h2>
      <div>
        {collection.length === 0 ? (
          <p>No items collected yet.</p>
        ) : (
          collection.map(item => (
            <GachaCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default Collection;
