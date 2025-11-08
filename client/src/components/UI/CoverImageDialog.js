import React, { useState } from 'react';
import { X, Upload, Link } from 'lucide-react';
import Button from './Button';
import Input from './Input';

const CoverImageDialog = ({ isOpen, onClose, onSave, currentImage = null }) => {
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setPreviewUrl(url);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(imageUrl);
      onClose();
    } catch (error) {
      console.error('Error saving cover image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await onSave(null);
      onClose();
    } catch (error) {
      console.error('Error removing cover image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Change Cover Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Preview */}
          {previewUrl && (
            <div className="mb-4 rounded-lg overflow-hidden border">
              <img 
                src={previewUrl} 
                alt="Cover preview"
                className="w-full h-32 object-cover"
                onError={() => setPreviewUrl('')}
              />
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Link className="w-4 h-4 inline mr-2" />
                Image URL
              </label>
              <Input
                type="url"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />
            </div>

            {/* Upload Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                File upload coming soon
              </p>
              <p className="text-xs text-gray-500 mt-1">
                For now, please use image URLs
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-lg">
          <div>
            {currentImage && (
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={isLoading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Remove Cover
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !imageUrl.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : 'Save Cover'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverImageDialog;
