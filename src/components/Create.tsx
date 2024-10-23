import React, { useState } from 'react';
import axios from 'axios';

const S3_BUCKET_URL = 'https://your-s3-bucket-url.s3.amazonaws.com/'; // Replace with your S3 bucket URL

interface CreateProps {
  account: string | null;
}

const Create: React.FC<CreateProps> = ({ account }) => {
  const [cardType, setCardType] = useState<'Character' | 'Item' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [rarity, setRarity] = useState(1);
  const [element, setElement] = useState('');
  const [weapon, setWeapon] = useState('');
  const [faction, setFaction] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImage(event.target?.files?.[0] || null);
  };

  const uploadImageToS3 = async () => {
    if (!image) return;
    try {
      const formData = new FormData();
      formData.append('image', image);
      const response = await axios.post('/api/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !image) return;

    setLoading(true);
    try {
      // Upload image to S3
      const imageUrl = await uploadImageToS3();

      // Prepare metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: [
          { trait_type: 'Rarity', value: rarity },
          ...(cardType === 'Character' ? [
            { trait_type: 'Element', value: element },
            { trait_type: 'Weapon', value: weapon },
            { trait_type: 'Faction', value: faction },
          ] : [
            { trait_type: 'Category', value: category },
          ]),
        ],
      };

      // Send metadata to backend API
      const response = await axios.post('/api/create-nft', {
        metadata,
        creator: account,
        cardType
      });

      console.log(`Created ${name}. ID: ${response.data.id}`);
      alert(`NFT created successfully! ID: ${response.data.id}`);
    } catch (error) {
      console.error('Error creating NFT:', error);
      alert('Failed to create NFT. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Create New NFT</h2>
      {!cardType ? (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCardType('Character')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Create Character Card
          </button>
          <button
            onClick={() => setCardType('Item')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Create Item Card
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-white mb-2">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-white mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              rows={4}
              required
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-white mb-2">Image</label>
            <input
              type="file"
              id="image"
              onChange={handleImageChange}
              className="w-full p-2 rounded bg-gray-700 text-white"
              accept="image/*"
              required
            />
          </div>
          <div>
            <label htmlFor="rarity" className="block text-white mb-2">Rarity (1-5)</label>
            <input
              type="number"
              id="rarity"
              value={rarity}
              onChange={(e) => setRarity(Number(e.target.value))}
              className="w-full p-2 rounded bg-gray-700 text-white"
              min="1"
              max="5"
              required
            />
          </div>
          {cardType === 'Character' ? (
            <>
              <div>
                <label htmlFor="element" className="block text-white mb-2">Element</label>
                <select
                  id="element"
                  value={element}
                  onChange={(e) => setElement(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                >
                  <option value="">Select an element</option>
                  <option value="Pyro">Pyro</option>
                  <option value="Hydro">Hydro</option>
                  <option value="Anemo">Anemo</option>
                  <option value="Electro">Electro</option>
                  <option value="Dendro">Dendro</option>
                  <option value="Cryo">Cryo</option>
                  <option value="Geo">Geo</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="weapon" className="block text-white mb-2">Weapon</label>
                <select
                  id="weapon"
                  value={weapon}
                  onChange={(e) => setWeapon(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                >
                  <option value="">Select a weapon</option>
                  <option value="Sword">Sword</option>
                  <option value="Claymore">Claymore</option>
                  <option value="Polearm">Polearm</option>
                  <option value="Bow">Bow</option>
                  <option value="Catalyst">Catalyst</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="faction" className="block text-white mb-2">Faction</label>
                <input
                  type="text"
                  id="faction"
                  value={faction}
                  onChange={(e) => setFaction(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  required
                />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="category" className="block text-white mb-2">Category</label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create NFT'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Create;
