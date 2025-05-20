'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArtistProfile } from '@prisma/client';

interface ArtistEditFormProps {
  artist: ArtistProfile;
}

export default function ArtistEditForm({ artist }: ArtistEditFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: artist.name,
    website: artist.website || '',
    instagram: artist.instagram || '',
    biography: artist.biography || '',
    youtubeUrls: artist.youtubeUrls,
  });
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/artists/${artist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update artist');
      }

      router.refresh();
      router.push('/admin/artists');
    } catch (error) {
      console.error('Error updating artist:', error);
      alert('Failed to update artist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addYoutubeUrl = () => {
    if (newYoutubeUrl && !formData.youtubeUrls.includes(newYoutubeUrl)) {
      setFormData({
        ...formData,
        youtubeUrls: [...formData.youtubeUrls, newYoutubeUrl],
      });
      setNewYoutubeUrl('');
    }
  };

  const removeYoutubeUrl = (urlToRemove: string) => {
    setFormData({
      ...formData,
      youtubeUrls: formData.youtubeUrls.filter((url) => url !== urlToRemove),
    });
  };

  const moveYoutubeUrl = (index: number, direction: 'up' | 'down') => {
    const newUrls = [...formData.youtubeUrls];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newUrls.length) {
      [newUrls[index], newUrls[newIndex]] = [newUrls[newIndex], newUrls[index]];
      setFormData({
        ...formData,
        youtubeUrls: newUrls,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
          required
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
          Instagram
        </label>
        <input
          type="text"
          id="instagram"
          value={formData.instagram}
          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label htmlFor="biography" className="block text-sm font-medium text-gray-700">
          Biography
        </label>
        <textarea
          id="biography"
          value={formData.biography}
          onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">YouTube Videos</label>
        <div className="mt-2 space-y-2">
          {formData.youtubeUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveYoutubeUrl(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveYoutubeUrl(index, 'down')}
                    disabled={index === formData.youtubeUrls.length - 1}
                    className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    ↓
                  </button>
                </div>
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Open
                </a>
              </div>
              <button
                type="button"
                onClick={() => removeYoutubeUrl(url)}
                className="text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={newYoutubeUrl}
              onChange={(e) => setNewYoutubeUrl(e.target.value)}
              placeholder="Add new YouTube URL"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addYoutubeUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 