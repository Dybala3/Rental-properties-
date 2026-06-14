import { motion } from 'motion/react';
import { Property, Inquiry, Message } from '../types';
import { 
  MapPin, DollarSign, Bed, Bath, Layers, 
  X, MessageSquare, Check, Clock, Calendar, 
  ShieldCheck, ArrowUpRight, Bookmark, Heart, Sparkles 
} from 'lucide-react';
import React, { useState } from 'react';

interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
  currentUserRole: 'landlord' | 'tenant';
  onInquire: (propertyId: string, customMessage: string) => void;
  onOpenChat: (propertyId: string) => void;
  hasApplied: boolean;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
}

export default function PropertyDetail({
  property,
  onClose,
  currentUserRole,
  onInquire,
  onOpenChat,
  hasApplied,
  applicationStatus,
}: PropertyDetailProps) {
  const [inquiryMessage, setInquiryMessage] = useState(
    `Hi ${property.landlordName}, I am very interested in acquiring this room! Can we chat details?`
  );
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    onInquire(property.id, inquiryMessage);
    setShowInquiryForm(false);
  };

  const getStatusBadge = () => {
    switch (property.status) {
      case 'acquired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <Check className="w-3.5 h-3.5" /> Acquired / Leased
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Under Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Instant Booking Available
          </span>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="property-detail-overlay"
      className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex justify-end"
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        id="property-detail-container"
        className="w-full max-w-md glass-panel h-full flex flex-col shadow-2xl relative overflow-hidden text-slate-100"
      >
        {/* Sticky Header Actions */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
          <button 
            id="close-property-detail"
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/60 transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {currentUserRole === 'tenant' && (
              <button 
                id="save-property"
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-colors border border-white/10 ${
                  isSaved ? 'bg-rose-500 text-white' : 'bg-black/45 text-white hover:bg-black/60'
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Main Hero Image */}
          <div className="relative h-64 w-full">
            <img 
              src={property.imageUrl} 
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-purple-600 border border-purple-400/30 text-white rounded bg-opacity-95 mb-1.5 inline-block">
                  {property.type}
                </span>
                <h1 className="text-xl font-bold font-display text-white tracking-tight drop-shadow-md">
                  {property.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Pricing & Info Header */}
          <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div id="price-container">
                <span className="text-2xl font-extrabold text-glow text-purple-300">
                  {property.price.toLocaleString()} ugshs
                </span>
                <span className="text-xs text-slate-350 font-medium">
                  /month
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/50">Security Deposit</div>
                <div className="text-sm font-bold text-white">{property.deposit.toLocaleString()} ugshs</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
              <div id="property-status-badge">
                {getStatusBadge()}
              </div>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-3 gap-2 p-4 bg-transparent">
            <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <Bed className="w-5 h-5 text-purple-400 mb-1" />
              <div className="text-sm font-bold text-white">{property.beds} Bedrooms</div>
              <div className="text-[10px] text-white/55 uppercase tracking-wider">Private Sleep</div>
            </div>
            <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <Bath className="w-5 h-5 text-pink-400 mb-1" />
              <div className="text-sm font-bold text-white">{property.baths} Bathrooms</div>
              <div className="text-[10px] text-white/55 uppercase tracking-wider">Bath facilities</div>
            </div>
            <div className="glass-card p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <Layers className="w-5 h-5 text-blue-400 mb-1" />
              <div className="text-sm font-bold text-white">{property.sqft} Sq Ft</div>
              <div className="text-[10px] text-white/55 uppercase tracking-wider">Total area</div>
            </div>
          </div>

          {/* Landlord Contact Card */}
          <div className="mx-4 my-2 p-3 glass-card rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={property.landlordAvatar} 
                alt={property.landlordName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/20"
              />
              <div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Listed By Landlord</div>
                <h4 className="text-sm font-bold text-white">{property.landlordName}</h4>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5 animate-pulse">
                  <ShieldCheck className="w-3 h-3" /> Verified landlord
                </p>
              </div>
            </div>
            
            {currentUserRole === 'tenant' && (
              <button 
                id="message-landlord-btn"
                onClick={() => onOpenChat(property.id)}
                className="p-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors flex items-center gap-1 text-xs font-semibold border border-white/10"
              >
                <MessageSquare className="w-4 h-4 text-purple-400" /> Message
              </button>
            )}
          </div>

          {/* Description */}
          <div className="p-4">
            <h3 className="text-xs font-bold text-white/50 mb-2 uppercase tracking-widest">
              Property Description
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {property.description}
            </p>
          </div>

          {/* Amenities list */}
          <div className="p-4 border-t border-white/10">
            <h3 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-widest">
              Included Amenities
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {property.amenities.map((amenity, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-xs text-slate-200 glass-card py-2 px-3 rounded-lg"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Persistent Drawer / Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
          {currentUserRole === 'tenant' ? (
            <div className="flex flex-col gap-2">
              {hasApplied ? (
                <div className="p-3 bg-black/30 rounded-lg flex items-center justify-between border border-white/10">
                  <div className="flex items-center gap-2">
                    {applicationStatus === 'approved' ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    ) : applicationStatus === 'rejected' ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    )}
                    <div>
                      <div className="text-xs font-bold text-white">
                        {applicationStatus === 'approved' ? 'Acquisition Pre-Approved!' : 
                         applicationStatus === 'rejected' ? 'Application Closed' : 'Lease Inquiry Active'}
                      </div>
                      <div className="text-[10px] text-white/60">
                        {applicationStatus === 'approved' ? 'The landlord approved your acquisition. Start lease chat!' : 
                         applicationStatus === 'rejected' ? 'This room is no longer taking inquiries.' : 'Awaiting feedback from landlord'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    applicationStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    applicationStatus === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {applicationStatus || 'pending'}
                  </span>
                </div>
              ) : property.status === 'acquired' ? (
                <div className="p-3 bg-black/30 rounded-lg text-center font-semibold text-xs text-white/40 border border-white/5">
                  This listing is currently leased to another tenant.
                </div>
              ) : showInquiryForm ? (
                <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-widest mb-1">
                      Inquiry Message
                    </label>
                    <textarea
                      id="inquiry-message-input"
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 rounded-lg glass-input focus:glass-input-focus"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      id="cancel-inquiry-btn"
                      type="button"
                      onClick={() => setShowInquiryForm(false)}
                      className="flex-1 py-2 text-xs font-semibold glass-btn-secondary hover:glass-btn-secondary-hover rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      id="submit-inquiry-btn"
                      type="submit"
                      className="flex-1 py-2 text-xs font-semibold glass-btn-primary hover:glass-btn-primary-hover rounded-lg"
                    >
                      Send Final Inquiry
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  id="acquire-now-btn"
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full py-3 px-4 glass-btn-primary hover:glass-btn-primary-hover rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  Acquire This Room / Apply Now <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            // Landlord actions
            <div className="flex gap-1.5 justify-between items-center text-xs text-white/60">
              <div className="flex flex-col">
                <span className="font-semibold text-white">Listing Management</span>
                <span className="text-[10px] text-white/55">Active landlord dashboard views are tracking inquiries.</span>
              </div>
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded font-bold text-white/80">
                Landlord Mode
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
