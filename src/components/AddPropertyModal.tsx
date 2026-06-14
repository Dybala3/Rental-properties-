import  React, { useState } from 'react';
import { motion } from 'motion/react';
import { Property } from '../types';
import { PROPERTY_IMAGES } from '../data';
import { X, Check, Home, Image, MapPin, DollarSign, Bed, Bath, Layers, Plus } from 'lucide-react';

interface AddPropertyModalProps {
  onClose: () => void;
  onSave: (property: Omit<Property, 'id' | 'landlordId' | 'landlordName' | 'landlordAvatar' | 'status' | 'tenantId'>) => void;
}

const AMENITY_OPTIONS = [
  'High-speed Wi-Fi',
  'In-unit Laundry',
  'Rooftop Lounge',
  '24/7 Security',
  'Gym Access',
  'Pet Friendly',
  'Balcony',
  'Bike Storage',
  'Near Public Transit',
  'Parking Space',
  'Chef\'s Kitchen',
  'Furnished'
];

export default function AddPropertyModal({ onClose, onSave }: AddPropertyModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Apartment' | 'Studio' | 'Room' | 'Shared Room'>('Apartment');
  const [price, setPrice] = useState<number>(1200000);
  const [deposit, setDeposit] = useState<number>(1000000);
  const [location, setLocation] = useState('');
  const [beds, setBeds] = useState<number>(1);
  const [baths, setBaths] = useState<number>(1);
  const [sqft, setSqft] = useState<number>(550);
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(PROPERTY_IMAGES[0].url);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['High-speed Wi-Fi', 'Pet Friendly']);

  const [customImage, setCustomImage] = useState('');
  const [useCustomImage, setUseCustomImage] = useState(false);

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !description) {
      alert('Please fill out all mandatory fields: Title, Location, and Description.');
      return;
    }

    onSave({
      title,
      type,
      price: Number(price),
      deposit: Number(deposit),
      location,
      beds: Number(beds),
      baths: Number(baths),
      sqft: Number(sqft),
      description,
      imageUrl: useCustomImage && customImage ? customImage : selectedImage,
      amenities: selectedAmenities
    });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="add-property-overlay"
      className="absolute inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-3"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        id="add-property-container"
        className="w-full max-w-md glass-panel rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Home className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold font-display text-white tracking-wide">Upload Property</h2>
          </div>
          <button 
            id="close-add-property"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Section 1: Core Details */}
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
              Property title *
            </label>
            <input 
              id="prop-title-input"
              type="text" 
              required
              placeholder="e.g. Sunny Bedroom with Balcony"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg glass-input focus:glass-input-focus placeholder-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
                Property Type
              </label>
              <select
                id="prop-type-select"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input focus:glass-input-focus"
              >
                <option value="Apartment" className="bg-slate-900 text-slate-100">Apartment</option>
                <option value="Studio" className="bg-slate-900 text-slate-100">Studio</option>
                <option value="Room" className="bg-slate-900 text-slate-100">Private Room</option>
                <option value="Shared Room" className="bg-slate-900 text-slate-100">Shared Room</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
                Location *
              </label>
              <input 
                id="prop-location-input"
                type="text" 
                required
                placeholder="e.g. Arts District, Block 4"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input focus:glass-input-focus placeholder-white/30"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-purple-950/20 rounded-xl border border-purple-500/10">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-purple-300 uppercase tracking-widest mb-1">
                <span className="text-[10px] px-1 py-0.5 rounded bg-purple-500/25 border border-purple-400/30 text-purple-200">UGX</span> Rent / Month
              </label>
              <input 
                id="prop-price-input"
                type="number" 
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg glass-input focus:glass-input-focus font-semibold"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-bold text-pink-300 uppercase tracking-widest mb-1">
                <span className="text-[10px] px-1 py-0.5 rounded bg-pink-500/25 border border-pink-400/30 text-pink-200">ugshs</span> Security Deposit
              </label>
              <input 
                id="prop-deposit-input"
                type="number" 
                required
                min={0}
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg glass-input focus:glass-input-focus"
              />
            </div>
          </div>

          {/* Stats: Beds Bhats Sqft */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
                Beds
              </label>
              <input 
                id="prop-beds-input"
                type="number" 
                min={1} 
                max={10}
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg glass-input focus:glass-input-focus text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
                Baths
              </label>
              <input 
                id="prop-baths-input"
                type="number" 
                min={1} 
                max={10}
                value={baths}
                onChange={(e) => setBaths(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg glass-input focus:glass-input-focus text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
                Sq Ft
              </label>
              <input 
                id="prop-sqft-input"
                type="number" 
                min={50}
                value={sqft}
                onChange={(e) => setSqft(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg glass-input focus:glass-input-focus text-center"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-1">
              Description *
            </label>
            <textarea 
              id="prop-description-input"
              rows={3}
              required
              placeholder="Tell tenants about the space, housemates, community feel, landlord responsiveness..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg glass-input focus:glass-input-focus placeholder-white/30"
            />
          </div>

          {/* Image Presets Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                Select Cover Photo
              </label>
              <button
                type="button"
                onClick={() => setUseCustomImage(!useCustomImage)}
                className="text-xs text-purple-400 font-bold hover:underline"
              >
                {useCustomImage ? 'Use Beautiful Presets' : 'Enter Custom URL'}
              </button>
            </div>

            {useCustomImage ? (
              <input 
                id="prop-custom-image-input"
                type="url" 
                placeholder="https://images.unsplash.com/your-own-image"
                value={customImage}
                onChange={(e) => setCustomImage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input focus:glass-input-focus placeholder-white/30"
              />
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {PROPERTY_IMAGES.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative h-14 rounded-lg overflow-hidden border border-white/10 group transition-all ${
                      selectedImage === img.url ? 'ring-2 ring-purple-500 border-transparent shadow' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img.url} 
                      alt={img.label} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[8px] text-white text-center font-bold">
                      Preset {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amenities checklist */}
          <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">
              Select Amenities
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {AMENITY_OPTIONS.map((amenity, index) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected 
                        ? 'bg-purple-500/20 border-purple-400/55 text-white' 
                        : 'border-white/5 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[8px] ${
                      isSelected ? 'bg-purple-500 border-transparent text-white' : 'border-white/20 bg-black/20'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky footer actions inside the form */}
          <div className="pt-4 border-t border-white/10 flex gap-2">
            <button
              id="cancel-add-property"
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold glass-btn-secondary hover:glass-btn-secondary-hover rounded-lg"
            >
              Cancel
            </button>
            <button
              id="submit-add-property-form"
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold glass-btn-primary hover:glass-btn-primary-hover rounded-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Publish Listing
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
