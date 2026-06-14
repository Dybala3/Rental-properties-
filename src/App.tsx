import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, Message, Inquiry, User } from './types';
import { 
  SIMULATED_TENANT, 
  SIMULATED_LANDLORD, 
  INITIAL_PROPERTIES, 
  INITIAL_INQUIRIES, 
  INITIAL_MESSAGES 
} from './data';
import PropertyDetail from './components/PropertyDetail';
import AddPropertyModal from './components/AddPropertyModal';
import ChatWindow from './components/ChatWindow';

import { 
  Home, Search, MessageSquare, Plus, User as UserIcon, 
  MapPin, DollarSign, Bed, Bath, Layers, 
  CheckCircle, Clock, X, Send, SlidersHorizontal, 
  Sparkles, ShieldAlert, FileText, ChevronRight,
  TrendingUp, House, Key, CheckCircle2, UserCheck, Inbox,
  AlertCircle, Users, Bookmark, FileKey
} from 'lucide-react';

// Main App Controller
export default function App() {
  // State loaded from localStorage or fallback defaults
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('rp_properties');
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('rp_inquiries');
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('rp_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Current simulation user (defaults to tenant so user can explore listings)
  const [currentRole, setCurrentRole] = useState<'landlord' | 'tenant'>('tenant');
  const currentUser = currentRole === 'tenant' ? SIMULATED_TENANT : SIMULATED_LANDLORD;

  // Navigation Tabs
  // For Tenant: 'explore' | 'inquiries' | 'chats' | 'my-room'
  // For Landlord: 'listings' | 'inquiries-rcvd' | 'chats-rcvd' | 'dashboard'
  const [tenantTab, setTenantTab] = useState<'explore' | 'inquiries' | 'chats' | 'my-room'>('explore');
  const [landlordTab, setLandlordTab] = useState<'listings' | 'inquiries-rcvd' | 'chats-rcvd' | 'dashboard'>('listings');

  // Filters & Searching
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<number>(5000000); // Max Slider
  const [showFilters, setShowFilters] = useState(false);

  // Active Modals & Views
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeChatProperty, setActiveChatProperty] = useState<Property | null>(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [activeNotification, setActiveNotification] = useState<{
    id: string;
    senderName: string;
    senderAvatar: string;
    message: string;
    propertyId: string;
  } | null>(null);

  // Persistence Synchronizer
  useEffect(() => {
    localStorage.setItem('rp_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('rp_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('rp_messages', JSON.stringify(messages));
  }, [messages]);

  // Handle Tenant Inquiring / Applying for a Room
  const handleInquire = (propertyId: string, customMessage: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    // Check if inquiry already exists
    const exists = inquiries.some(iq => iq.propertyId === propertyId && iq.tenantId === SIMULATED_TENANT.id);
    if (exists) return;

    const newInquiry: Inquiry = {
      id: `inq_${Date.now()}`,
      propertyId,
      propertyName: property.title,
      propertyImage: property.imageUrl,
      tenantId: SIMULATED_TENANT.id,
      tenantName: SIMULATED_TENANT.name,
      tenantAvatar: SIMULATED_TENANT.avatar,
      landlordId: property.landlordId,
      status: 'pending',
      message: customMessage,
      createdAt: new Date().toISOString()
    };

    const initialInquiryMessage: Message = {
      id: `msg_inq_${Date.now()}`,
      propertyId,
      senderId: SIMULATED_TENANT.id,
      senderName: SIMULATED_TENANT.name,
      receiverId: property.landlordId,
      message: `📝 Acquisition Inquiry Submitted:\n"${customMessage}"`,
      createdAt: new Date().toISOString()
    };

    // Update States
    setInquiries(prev => [newInquiry, ...prev]);
    setMessages(prev => [...prev, initialInquiryMessage]);
    
    // Set property status to pending/under-review
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: 'pending' } : p));
    
    // Update active visual detailed modal
    setSelectedProperty(prev => prev && prev.id === propertyId ? { ...prev, status: 'pending' } : prev);
  };

  // Direct landlord-tenant real-time message relay
  const handleSendMessage = (propertyId: string, messageText: string, syncToGoogleChatSpace?: string | null) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    const isCurrentLandlord = currentRole === 'landlord';
    const receiverId = isCurrentLandlord ? SIMULATED_TENANT.id : property.landlordId;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      propertyId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId,
      message: messageText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    // Handle automated simulated reply inside the demo sandbox to trigger real-time notification alerts
    setTimeout(() => {
      const automaticReplies = [
        "Sounds perfect! I have updated the room's reservation calendar guidelines.",
        "Thanks for confirming. Let me know if you would like me to draft the contract.",
        "That works nicely! Let us coordinate for the security deposit details.",
        "Sure, please share any additional reference documents if possible.",
        "Got it! Let me double-check work space schedules and reply soon."
      ];
      const randomReply = automaticReplies[Math.floor(Math.random() * automaticReplies.length)];

      const replyMsg: Message = {
        id: `msg_auto_${Date.now()}`,
        propertyId,
        senderId: receiverId,
        senderName: isCurrentLandlord ? SIMULATED_TENANT.name : property.landlordName,
        receiverId: currentUser.id,
        message: randomReply,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => {
        const nextMessages = [...prev, replyMsg];
        
        // Push notification alert if the tenant is active elsewhere or listing detail was opened
        if (!activeChatProperty || activeChatProperty.id !== propertyId) {
          setActiveNotification({
            id: replyMsg.id,
            senderName: isCurrentLandlord ? SIMULATED_TENANT.name : property.landlordName,
            senderAvatar: isCurrentLandlord ? SIMULATED_TENANT.avatar : property.landlordAvatar,
            message: randomReply,
            propertyId: propertyId
          });

          // Play elegant chime/pulse browser sound using synthesiser
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch (e) {
            console.log("Audio notification skipped");
          }
        }
        return nextMessages;
      });
    }, 2500);
  };

  // Landlord saving new property listing to library
  const handleAddProperty = (newPropertyData: Omit<Property, 'id' | 'landlordId' | 'landlordName' | 'landlordAvatar' | 'status' | 'tenantId'>) => {
    const newProperty: Property = {
      ...newPropertyData,
      id: `prop_${Date.now()}`,
      landlordId: SIMULATED_LANDLORD.id,
      landlordName: SIMULATED_LANDLORD.name,
      landlordAvatar: SIMULATED_LANDLORD.avatar,
      status: 'available',
      tenantId: null
    };

    setProperties(prev => [newProperty, ...prev]);
  };

  // Landlord approving application (Acquires the room for tenant)
  const handleApproveInquiry = (inquiryId: string) => {
    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) return;

    // Approve the Inquiry
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: 'approved' } : i));

    // Lease the property officially
    setProperties(prev => prev.map(p => p.id === inq.propertyId ? { 
      ...p, 
      status: 'acquired', 
      tenantId: inq.tenantId 
    } : p));

    // If detail modal is open, sync status
    setSelectedProperty(prev => prev && prev.id === inq.propertyId ? {
      ...prev,
      status: 'acquired',
      tenantId: inq.tenantId
    } : prev);

    // Auto-generate system message inside landlord chat to tenant
    const approvalMessage: Message = {
      id: `msg_sys_${Date.now()}`,
      propertyId: inq.propertyId,
      senderId: SIMULATED_LANDLORD.id,
      senderName: SIMULATED_LANDLORD.name,
      receiverId: inq.tenantId,
      message: `🎉 Congratulations Alex! Your acquisition inquiry has been APPROVED.\nI've reserved the room for you. Let's arrange key delivery and finalize details below.`,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, approvalMessage]);
  };

  const handleRejectInquiry = (inquiryId: string) => {
    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) return;

    // Reject the inquiry
    setInquiries(prev => prev.map(i => i.id === inquiryId ? { ...i, status: 'rejected' } : i));

    // Release the property back to available if no other pending properties
    const hasOtherPendingInquiries = inquiries.some(i => i.id !== inquiryId && i.propertyId === inq.propertyId && i.status === 'pending');
    if (!hasOtherPendingInquiries) {
      setProperties(prev => prev.map(p => p.id === inq.propertyId ? { ...p, status: 'available' } : p));
      setSelectedProperty(prev => prev && prev.id === inq.propertyId ? { ...prev, status: 'available' } : prev);
    }
  };

  // Filter listings based on query parameters
  const filteredProperties = properties.filter(prop => {
    const matchSearch = prop.title.toLowerCase().includes(searchText.toLowerCase()) || 
                        prop.location.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === 'all' || prop.type === filterType;
    const matchPrice = prop.price <= filterPrice;
    return matchSearch && matchType && matchPrice;
  });

  // Check if tenant has already made an inquiry for currently viewed property
  const checkTenantApplied = (propId: string) => {
    return inquiries.some(iq => iq.propertyId === propId && iq.tenantId === SIMULATED_TENANT.id);
  };

  const getTenantApplicationStatus = (propId: string) => {
    const found = inquiries.find(iq => iq.propertyId === propId && iq.tenantId === SIMULATED_TENANT.id);
    return found ? found.status : undefined;
  };

  // Active leased room for current tenant (Alex)
  const myLeasedRoom = properties.find(p => p.status === 'acquired' && p.tenantId === SIMULATED_TENANT.id);

  // Unread badge calculators (simulated visual fidelity)
  const unreadMessagesCount = 1;
  const pendingInquiriesCount = inquiries.filter(i => i.status === 'pending').length;

  return (
    <div id="full-workspace-view" className="min-h-screen glass-bg flex flex-col items-center py-6 px-4 font-sans antialiased text-white">
      
      {/* Simulation Controller Top Banner */}
      <div id="simulation-banner" className="w-full max-w-md glass-card rounded-2xl p-4 mb-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50 font-display">Sandbox Simulator</h2>
          </div>
          <span className="text-[10px] glass-badge text-purple-350 px-2 py-0.5 rounded-full font-bold">
            Simulated Node Environment
          </span>
        </div>

        <p className="text-xs text-white/70 leading-relaxed mb-3">
          This single screen lets you test both landlord and tenant capabilities. Toggle roles below to upload a property as <strong>Sarah</strong>, then switch to <strong>Alex</strong> to inquire and chat in real-time!
        </p>

        <div className="grid grid-cols-2 gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
          <button 
            id="role-switch-tenant"
            onClick={() => {
              setCurrentRole('tenant');
              setTenantTab('explore');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'tenant' 
                ? 'glass-btn-primary shadow-lg' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" /> Tenant (Alex)
          </button>
          
          <button 
            id="role-switch-landlord"
            onClick={() => {
              setCurrentRole('landlord');
              setLandlordTab('listings');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'landlord' 
                ? 'glass-btn-primary shadow-lg' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Landlord (Sarah)
          </button>
        </div>
      </div>

      {/* Main Simulated Phone Device Container */}
      <div 
        id="simulated-phone-frame" 
        className="w-full max-w-md glass-panel rounded-[3.2rem] shadow-[0_32px_80px_rgba(0,0,0,0.6)] border-[10px] border-white/10 h-[800px] flex flex-col overflow-hidden relative"
      >
        {/* Phone Notch/Status Header */}
        <div className="bg-black/30 text-white/50 pt-7 pb-2 px-6 flex justify-between items-center text-[10px] font-bold select-none border-b border-white/5 flex-shrink-0 relative">
          <span className="font-mono text-white/70">09:41 AM</span>
          <div className="w-24 h-4 bg-white/10 rounded-full mx-auto absolute left-1/2 transform -translate-x-1/2 top-1.5" />
          <div className="flex items-center gap-1 text-white/70">
            <span>5G</span>
            <div className="w-4 h-2.5 border border-white/30 rounded-xs flex items-center p-px"><div className="w-full h-full bg-white/75 rounded-2xs" /></div>
          </div>
        </div>

        {/* Dynamic App Content Body */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950/20">
          
          {/* Active Push In-App Toast Alert */}
          <AnimatePresence>
            {activeNotification && (
              <motion.div
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 8, opacity: 1 }}
                exit={{ y: -70, opacity: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                id="interactive-push-notification"
                className="absolute top-1 inset-x-3 z-[100] bg-black/90 backdrop-blur-md rounded-2xl p-3 border border-purple-500/30 flex items-center justify-between gap-3 shadow-2xl cursor-pointer hover:bg-slate-900/90"
                onClick={() => {
                  const propertyMatch = properties.find(p => p.id === activeNotification.propertyId);
                  if (propertyMatch) {
                    setActiveChatProperty(propertyMatch);
                    if (currentRole === 'tenant') {
                      setTenantTab('chats');
                    } else {
                      setLandlordTab('chats-rcvd');
                    }
                  }
                  setActiveNotification(null);
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <img src={activeNotification.senderAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-purple-305 font-extrabold tracking-wider uppercase">New Message Alert</p>
                    <p className="text-xs font-bold text-white truncate">{activeNotification.senderName}</p>
                    <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">{activeNotification.message}</p>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNotification(null);
                  }}
                  className="p-1 text-white/40 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* ========================================================= */}
          {/*                    TENANT PERSPECTIVE                     */}
          {/* ========================================================= */}
          {currentRole === 'tenant' && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* HEADER */}
              <div className="bg-white/5 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Find Your Sanctuary</p>
                  <h1 className="text-base font-extrabold font-display text-white">Explore Rooms</h1>
                </div>
                <div className="flex items-center gap-2">
                  <img 
                    src={SIMULATED_TENANT.avatar} 
                    alt="My Avatar" 
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                  />
                </div>
              </div>

              {/* NAV TAB LAYOUT SCROLLER */}
              <div className="flex-1 overflow-y-auto pb-16">
                
                {/* EXPLORE REVOLUTION ACTION */}
                {tenantTab === 'explore' && (
                  <div className="p-4 space-y-4">
                    {/* Search & Filter Trigger */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 glass-card rounded-xl px-3.5 py-2.5 flex items-center gap-2 shadow opacity-90">
                          <Search className="w-4 h-4 text-white/50" />
                          <input 
                            id="search-listings-input"
                            type="text" 
                            placeholder="Search district, style, title..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="bg-transparent border-none text-xs text-white placeholder-white/30 focus:outline-none w-full"
                          />
                          {searchText && (
                            <button id="clear-search-btn" onClick={() => setSearchText('')}>
                              <X className="w-3.5 h-3.5 text-white/50 hover:text-white" />
                            </button>
                          )}
                        </div>
                        <button 
                          id="toggle-filters-btn"
                          onClick={() => setShowFilters(!showFilters)}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                            showFilters ? 'bg-purple-650 text-white border-purple-500' : 'bg-white/5 border-white/10 text-white/80'
                          }`}
                        >
                          <SlidersHorizontal className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      {/* Expandable Advanced Filters */}
                      <AnimatePresence>
                        {showFilters && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            id="advanced-filters-panel"
                            className="glass-card p-3 rounded-xl space-y-3 overflow-hidden text-xs"
                          >
                            <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                              <span className="font-bold text-white font-display">Filter Properties</span>
                              <button 
                                onClick={() => {
                                  setFilterType('all');
                                  setFilterPrice(5000000);
                                }}
                                className="text-[10px] text-purple-400 font-bold hover:underline cursor-pointer"
                              >
                                Reset filters
                              </button>
                            </div>

                            {/* Property Type Radio Badge */}
                            <div>
                              <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">Type</span>
                              <div className="flex flex-wrap gap-1">
                                {['all', 'Apartment', 'Studio', 'Room', 'Shared Room'].map((t) => (
                                  <button
                                    key={t}
                                    id={`filter-type-${t}`}
                                    onClick={() => setFilterType(t)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                      filterType === t 
                                        ? 'bg-purple-600 text-white border-transparent' 
                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    }`}
                                  >
                                    {t === 'all' ? 'All Formats' : t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Rent Budget Slider */}
                            <div>
                              <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                                <span>Max Monthly Rent</span>
                                <span className="text-purple-400 font-extrabold text-xs text-glow">{filterPrice.toLocaleString()} ugshs</span>
                              </div>
                              <input 
                                id="rent-filter-slider"
                                type="range" 
                                min={100000} 
                                max={5000000} 
                                step={50000}
                                value={filterPrice}
                                onChange={(e) => setFilterPrice(Number(e.target.value))}
                                className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Listings Stream */}
                    <div className="space-y-3">
                      {filteredProperties.length === 0 ? (
                        <div className="p-8 text-center glass-card rounded-xl border border-dashed border-white/10">
                          <AlertCircle className="w-8 h-8 text-white/40 mx-auto mb-2" />
                          <p className="text-sm font-bold text-white">No rooms match queries</p>
                          <p className="text-xs text-white/60">Try cleaning your search query or reset price sliders.</p>
                        </div>
                      ) : (
                        filteredProperties.map((prop) => (
                          <div 
                            key={prop.id}
                            id={`property-card-${prop.id}`}
                            onClick={() => setSelectedProperty(prop)}
                            className="glass-card rounded-xl overflow-hidden hover:glass-card-hover transition-all duration-300 cursor-pointer flex flex-col group"
                          >
                            <div className="relative h-40 bg-white/5 overflow-hidden">
                              <img 
                                src={prop.imageUrl} 
                                alt={prop.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-2 left-2 flex gap-1.5">
                                <span className="px-2 py-0.5 text-[9px] font-bold bg-black/60 backdrop-blur-md text-white rounded">
                                  {prop.type}
                                </span>
                              </div>
                              <div className="absolute top-2 right-2">
                                <span className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                  prop.status === 'acquired' ? 'bg-emerald-500/80 text-white shadow-sm' :
                                  prop.status === 'pending' ? 'bg-amber-500/85 text-white animate-pulse shadow-sm' :
                                  'bg-purple-600/85 text-white shadow-sm'
                                }`}>
                                  {prop.status === 'available' ? 'instant key' : prop.status}
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded backdrop-blur-md border border-white/15">
                                <p className="text-xs font-bold text-glow text-purple-300">{prop.price.toLocaleString()} ugshs<span className="text-[10px] font-normal text-white/70">/mo</span></p>
                              </div>
                            </div>

                            <div className="p-3">
                              <h3 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                                {prop.title}
                              </h3>
                              <div className="flex items-center gap-1 text-[10px] text-white/60 mt-1 truncate">
                                <MapPin className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                                <span>{prop.location}</span>
                              </div>
                              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[10px] text-white/50">
                                <div className="flex gap-2">
                                  <span className="flex items-center gap-0.5"><Bed className="w-3 h-3 text-white/40" /> {prop.beds} Beds</span>
                                  <span className="flex items-center gap-0.5"><Bath className="w-3 h-3 text-white/40" /> {prop.baths} Baths</span>
                                </div>
                                <span className="font-mono text-purple-400/80">{prop.sqft} sqft</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* MY APPLICATIONS STATUS INQUIRIES */}
                {tenantTab === 'inquiries' && (
                  <div className="p-4 space-y-4">
                    <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">My Rent Inquiries ({inquiries.length})</h2>
                    <div className="space-y-3">
                      {inquiries.length === 0 ? (
                        <div className="text-center p-8 glass-card rounded-xl border border-dashed border-white/5">
                          <Clock className="w-8 h-8 text-white/40 mx-auto mb-2" />
                          <p className="text-sm font-bold text-white">No active applications</p>
                          <p className="text-xs text-white/60">Click a property and apply to show listings here.</p>
                        </div>
                      ) : (
                        inquiries.map((inq) => {
                          const associatedProperty = properties.find(p => p.id === inq.propertyId);
                          return (
                            <div 
                              key={inq.id}
                              id={`inquiry-card-${inq.id}`}
                              className="glass-card rounded-xl p-3 shadow-xs space-y-3"
                            >
                              <div className="flex gap-3">
                                <img src={inq.propertyImage} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
                                <div className="min-w-0 flex-1">
                                  <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                                    inq.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                    inq.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/10' :
                                    'bg-amber-500/20 text-amber-400 border border-amber-500/10'
                                  }`}>
                                    {inq.status}
                                  </span>
                                  <h4 className="text-xs font-bold text-white truncate mt-1">
                                    {inq.propertyName}
                                  </h4>
                                  <p className="text-[10px] text-white/50">Submitted {new Date(inq.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="p-2.5 bg-black/30 rounded-lg text-[11px] text-white/80 italic leading-relaxed border border-white/5">
                                &ldquo;{inq.message}&rdquo;
                              </div>

                              <div className="flex gap-2 justify-end pt-1">
                                {associatedProperty && (
                                  <button
                                    id={`view-inquiry-prop-${inq.propertyId}`}
                                    onClick={() => setSelectedProperty(associatedProperty)}
                                    className="text-[10px] text-purple-300 font-bold hover:text-white transition-colors cursor-pointer"
                                  >
                                    View Room details
                                  </button>
                                )}
                                <span className="text-white/20">|</span>
                                <button
                                  id={`chat-inquiry-btn-${inq.id}`}
                                  onClick={() => {
                                    if (associatedProperty) {
                                      setActiveChatProperty(associatedProperty);
                                    }
                                  }}
                                  className="text-[10px] text-pink-300 font-bold hover:text-white transition-colors cursor-pointer"
                                >
                                  Open Landlord Chat
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* MY MESSAGES LISTS */}
                {tenantTab === 'chats' && (
                  <div className="p-4 space-y-4">
                    <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">Landlord Inbox</h2>
                    <div id="chats-list" className="space-y-2">
                      {properties.map(prop => {
                        const hasChat = messages.some(m => m.propertyId === prop.id);
                        if (!hasChat) return null;
                        
                        const conversation = messages.filter(m => m.propertyId === prop.id);
                        const lastMsg = conversation[conversation.length - 1];

                        return (
                          <div 
                            key={prop.id}
                            id={`chat-item-${prop.id}`}
                            onClick={() => setActiveChatProperty(prop)}
                            className="glass-card p-3 rounded-xl flex items-center justify-between cursor-pointer hover:glass-card-hover transition-all duration-300"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative">
                                <img src={prop.landlordAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{prop.landlordName}</h4>
                                <p className="text-[11px] text-white/60 truncate max-w-[200px] mt-0.5">
                                  {lastMsg ? lastMsg.message : 'Chat details about room...'}
                                </p>
                                <span className="text-[9px] text-purple-300 font-semibold">{prop.title}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* MY SECURE LEASED ACQUIRED ROOM */}
                {tenantTab === 'my-room' && (
                  <div className="p-4 space-y-4">
                    <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">Active Lease Agreement</h2>
                    
                    {myLeasedRoom ? (
                      <div className="space-y-4">
                        {/* Lease Card */}
                        <div className="glass-card p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-xl text-white">
                          <div className="absolute top-0 right-0 p-8 bg-purple-500/10 rounded-full blur-2xl" />
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="px-2 py-0.5 bg-emerald-550/20 text-emerald-405 border border-emerald-500/20 rounded text-[8px] font-extrabold uppercase tracking-wide">
                                Active Contracted
                              </span>
                              <h3 className="text-base font-bold tracking-tight mt-1.5 truncate max-w-[220px]">
                                {myLeasedRoom.title}
                              </h3>
                              <p className="text-[10px] text-purple-305 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-pink-400" /> {myLeasedRoom.location}
                              </p>
                            </div>
                            <FileText className="w-8 h-8 text-purple-300 flex-shrink-0" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-white/10 text-xs">
                            <div>
                              <div className="text-white/50 text-[9px] uppercase tracking-wider">Lease Holder</div>
                              <div className="font-bold text-white">{SIMULATED_TENANT.name}</div>
                            </div>
                            <div>
                              <div className="text-white/50 text-[9px] uppercase tracking-wider">Owner Landlord</div>
                              <div className="font-bold text-white">{myLeasedRoom.landlordName}</div>
                            </div>
                            <div>
                              <div className="text-white/50 text-[9px] uppercase tracking-wider">Monthly Rent</div>
                              <div className="font-black text-purple-300 text-glow">{myLeasedRoom.price.toLocaleString()} ugshs</div>
                            </div>
                            <div>
                              <div className="text-white/50 text-[9px] uppercase tracking-wider">Security Deposit</div>
                              <div className="font-bold text-white">{myLeasedRoom.deposit.toLocaleString()} ugshs (Held)</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard Lease Verified</span>
                            <span className="font-mono text-[9px] text-white/45">ID: LSE-{myLeasedRoom.id.toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Quick Checklist */}
                        <div className="glass-card p-4 rounded-xl space-y-3">
                          <h3 className="text-xs font-extrabold text-white/70 uppercase tracking-wider">Move-In Checklist</h3>
                          
                          <div className="space-y-2 text-xs text-white/80">
                            <div className="flex items-center gap-2.5 p-1">
                              <span className="w-4 h-4 rounded-full bg-emerald-550/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">✓</span>
                              <span className="text-white/40 line-through">Security Deposit Cleared</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-1">
                              <span className="w-4 h-4 rounded-full bg-emerald-550/20 text-emerald-400 flex items-center justify-center text-[9px] font-bold">✓</span>
                              <span className="text-white/40 line-through">Tenant Screening Approved</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-1">
                              <span className="w-4 h-4 rounded-full bg-purple-550/25 text-purple-300 flex items-center justify-center text-[9px] font-bold">3</span>
                              <span className="text-white/90 font-medium">Verify Utilities Setup & Wi-Fi Link</span>
                            </div>
                            <div className="flex items-center gap-2.5 p-1">
                              <span className="w-4 h-4 rounded bg-white/5 text-white/50 flex items-center justify-center text-[9px] font-bold">4</span>
                              <span className="text-white/70">Schedule Physical Key Pickup with Sarah</span>
                            </div>
                          </div>
                          
                          <button
                            id="my-room-chat-sarah"
                            onClick={() => setActiveChatProperty(myLeasedRoom)}
                            className="w-full mt-2 py-2.5 glass-btn-primary hover:glass-btn-primary-hover rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                          >
                            Chat Sarah About Key Pickup
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 glass-card rounded-xl border border-dashed border-white/5">
                        <Key className="w-10 h-10 text-white/30 mx-auto mb-2" />
                        <h4 className="text-sm font-bold text-white">No rooms acquired yet</h4>
                        <p className="text-xs text-white/60 max-w-xs mx-auto mt-1">
                          Browse properties, make an inquiry, message the landlord, and once they approve, your active lease contract will generate here!
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* BOTTOM NAVIGATION TAB BAR */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-black/60 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 z-10">
                <button 
                  id="tab-tenant-explore"
                  onClick={() => setTenantTab('explore')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                    tenantTab === 'explore' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <House className="w-5 h-5" />
                  <span>Rooms</span>
                </button>
                <button 
                  id="tab-tenant-inquiries"
                  onClick={() => setTenantTab('inquiries')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer relative ${
                    tenantTab === 'inquiries' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <span>Applied</span>
                </button>
                <button 
                  id="tab-tenant-chats"
                  onClick={() => setTenantTab('chats')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer relative ${
                    tenantTab === 'chats' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Inbox</span>
                  <span className="absolute top-2 right-6 bg-purple-600 text-[8px] text-white font-extrabold h-4 w-4 rounded-full flex items-center justify-center shadow">1</span>
                </button>
                <button 
                  id="tab-tenant-myroom"
                  onClick={() => setTenantTab('my-room')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer relative ${
                    tenantTab === 'my-room' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Key className="w-5 h-5" />
                  <span>My Lease</span>
                  {myLeasedRoom && <span className="absolute top-2 right-6 bg-emerald-500 h-2 w-2 rounded-full" />}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/*                   LANDLORD PERSPECTIVE                  */}
          {/* ========================================================= */}
          {currentRole === 'landlord' && (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* HEADER */}
              <div className="bg-black/40 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Properties Dashboard</p>
                  <h1 className="text-base font-black tracking-tight text-white">Landlord Panel</h1>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    id="trigger-add-property"
                    onClick={() => setShowAddProperty(true)}
                    className="p-1.5 px-2.5 rounded-lg glass-btn-primary hover:glass-btn-primary-hover shadow-lg flex items-center gap-1 text-xs font-bold cursor-pointer transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" /> Add Room
                  </button>
                </div>
              </div>

              {/* BODY NAV TABLE SCROLLER */}
              <div className="flex-1 overflow-y-auto pb-16">
                
                {/* ACTIVE LISTINGS */}
                {landlordTab === 'listings' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">My Listings ({properties.length})</h2>
                      <span className="text-[10px] text-white/40 font-medium">Click to preview details</span>
                    </div>

                    <div className="space-y-3">
                      {properties.map((prop) => (
                        <div 
                          key={prop.id}
                          id={`landlord-property-row-${prop.id}`}
                          onClick={() => setSelectedProperty(prop)}
                          className="glass-card rounded-xl p-2.5 flex gap-3 shadow-xs hover:glass-card-hover cursor-pointer transition-all duration-300"
                        >
                          <img src={prop.imageUrl} className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-slate-900" alt="" />
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="text-xs font-bold text-white truncate pr-2">{prop.title}</h3>
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                  prop.status === 'acquired' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' :
                                  prop.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' :
                                  'bg-purple-500/20 text-purple-300 border border-purple-500/10'
                                }`}>
                                  {prop.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-purple-300 font-bold mt-0.5">{prop.price.toLocaleString()} ugshs/mo</p>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-white/60">
                              <span>{prop.beds} Beds &bull; {prop.baths} Baths</span>
                              <span className="truncate max-w-[120px]">{prop.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* INQUIRIES RECEIVED FROM ACTIVE CANDIDATES */}
                {landlordTab === 'inquiries-rcvd' && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">Applications Pending ({pendingInquiriesCount})</h2>
                    </div>

                    <div className="space-y-3">
                      {inquiries.filter(i => i.status === 'pending').length === 0 ? (
                        <div className="text-center p-8 glass-card rounded-xl border border-dashed border-white/5">
                          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                          <p className="text-sm font-bold text-white">All caught up!</p>
                          <p className="text-xs text-white/60 mt-1">There are no pending room applications currently waiting for approval.</p>
                        </div>
                      ) : (
                        inquiries.filter(i => i.status === 'pending').map((inq) => {
                          const associatedProperty = properties.find(p => p.id === inq.propertyId);
                          return (
                            <div 
                              key={inq.id}
                              id={`landlord-inq-card-${inq.id}`}
                              className="glass-card rounded-xl p-3.5 shadow-xs space-y-3"
                            >
                              {/* Applicant details */}
                              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                  <img src={inq.tenantAvatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                                  <div>
                                    <h4 className="text-xs font-bold text-white">{inq.tenantName}</h4>
                                    <p className="text-[9px] text-white/50">Applicant Candidate</p>
                                  </div>
                                </div>
                                <span className="text-[9px] text-white/40">{new Date(inq.createdAt).toLocaleDateString()}</span>
                              </div>

                              {/* Target Room */}
                              <div className="bg-black/30 p-2 rounded-lg flex gap-2.5 items-center border border-white/5">
                                <img src={inq.propertyImage} className="w-10 h-10 rounded object-cover flex-shrink-0" alt="" />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-white/40">Inquiry Target Room:</p>
                                  <p className="text-xs font-bold text-white/90 truncate">{inq.propertyName}</p>
                                </div>
                              </div>

                              {/* Message */}
                              <div className="p-2.5 bg-purple-500/5 text-[11px] text-white/95 italic rounded-lg leading-relaxed border border-white/5">
                                &ldquo;{inq.message}&rdquo;
                              </div>

                              {/* Interactive Actions */}
                              <div className="flex gap-2 pt-1.5">
                                <button
                                  id={`landlord-chat-inq-${inq.id}`}
                                  onClick={() => {
                                    if (associatedProperty) {
                                      setActiveChatProperty(associatedProperty);
                                    }
                                  }}
                                  className="flex-1 py-1.5 text-center text-xs font-bold rounded-lg text-white bg-white/5 border border-white/15 hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                  Chat Applicant
                                </button>
                                <button
                                  id={`landlord-reject-btn-${inq.id}`}
                                  onClick={() => handleRejectInquiry(inq.id)}
                                  className="px-3.5 py-1.5 text-center text-xs font-bold text-rose-400 hover:text-rose-350 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 rounded-lg cursor-pointer transition-all"
                                >
                                  Decline
                                </button>
                                <button
                                  id={`landlord-approve-btn-${inq.id}`}
                                  onClick={() => handleApproveInquiry(inq.id)}
                                  className="px-4 py-1.5 text-center glass-btn-primary hover:glass-btn-primary-hover font-extrabold rounded-lg text-xs cursor-pointer transition-all duration-300"
                                >
                                  Approve Acquisition
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* MESSAGES RECEIVED */}
                {landlordTab === 'chats-rcvd' && (
                  <div className="p-4 space-y-4">
                    <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">Inbound Tenant Chats</h2>
                    <div id="landlord-chats-list" className="space-y-2">
                      {properties.map(prop => {
                        const hasChat = messages.some(m => m.propertyId === prop.id);
                        if (!hasChat) return null;
                        
                        const conversation = messages.filter(m => m.propertyId === prop.id);
                        const lastMsg = conversation[conversation.length - 1];

                        return (
                          <div 
                            key={prop.id}
                            id={`landlord-chat-item-${prop.id}`}
                            onClick={() => setActiveChatProperty(prop)}
                            className="glass-card p-3 rounded-xl flex items-center justify-between cursor-pointer hover:glass-card-hover transition-all duration-350"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative">
                                <img src={SIMULATED_TENANT.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{SIMULATED_TENANT.name}</h4>
                                <p className="text-[11px] text-white/60 truncate max-w-[200px] mt-0.5">
                                  {lastMsg ? lastMsg.message : 'Open to chat about leasing details...'}
                                </p>
                                <span className="text-[9px] text-purple-300 font-semibold">{prop.title}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* METRICS & FINANCES DASHBOARD */}
                {landlordTab === 'dashboard' && (
                  <div className="p-4 space-y-4">
                    <h2 className="text-xs font-extrabold tracking-widest uppercase text-white/50">Operational Health</h2>
                    
                    {/* Stats Tiles */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-4 rounded-xl flex flex-col justify-between shadow-lg">
                        <span className="text-xs font-bold text-teal-400">UGX</span>
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-black tracking-wider mt-2">Active Income</p>
                          <h3 className="text-xs font-black mt-1 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-300 text-glow">
                            {properties.filter(p => p.status === 'acquired').reduce((acc, current) => acc + current.price, 0).toLocaleString()} ugshs/mo
                          </h3>
                        </div>
                      </div>

                      <div className="glass-card p-4 rounded-xl flex flex-col justify-between shadow-lg">
                        <TrendingUp className="w-6 h-6 text-purple-300" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase font-black tracking-wider mt-2">Occupancy rate</p>
                          <h3 className="text-lg font-black mt-1 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-350 to-pink-300 text-glow">
                            {Math.round((properties.filter(p => p.status === 'acquired').length / properties.length) * 100)}%
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Quick Tenant Logs */}
                    <div className="glass-card p-4 rounded-xl space-y-3 shadow-lg">
                      <h3 className="text-xs font-extrabold text-white/80 uppercase tracking-wider">Active Tenant Registry</h3>
                      
                      <div className="space-y-2 text-xs">
                        {properties.some(p => p.status === 'acquired') ? (
                          properties.filter(p => p.status === 'acquired').map(p => (
                            <div key={p.id} className="flex justify-between items-center bg-black/30 p-2.5 rounded-lg border border-white/5">
                              <div className="flex items-center gap-2">
                                <img src={SIMULATED_TENANT.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />
                                <div>
                                  <h4 className="font-bold text-white">{SIMULATED_TENANT.name}</h4>
                                  <p className="text-[10px] text-white/50">Leases: {p.title}</p>
                                </div>
                              </div>
                              <span className="font-extrabold text-emerald-400">{p.price.toLocaleString()} ugshs/mo</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-white/40 text-center py-4">No active leased rooms. Approve inquiries to let tenants acquire properties!</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* BOTTOM NAVIGATION TAB BAR */}
              <div className="absolute bottom-0 inset-x-0 h-16 bg-black/60 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-2 z-10">
                <button 
                  id="tab-landlord-listings"
                  onClick={() => setLandlordTab('listings')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                    landlordTab === 'listings' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <House className="w-5 h-5" />
                  <span>My Rooms</span>
                </button>
                <button 
                  id="tab-landlord-inquiries"
                  onClick={() => setLandlordTab('inquiries-rcvd')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer relative ${
                    landlordTab === 'inquiries-rcvd' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Applicants</span>
                  {pendingInquiriesCount > 0 && (
                    <span className="absolute top-2 right-6 bg-purple-600 text-[8px] text-white font-extrabold h-4 w-4 rounded-full flex items-center justify-center shadow">
                      {pendingInquiriesCount}
                    </span>
                  )}
                </button>
                <button 
                  id="tab-landlord-chats"
                  onClick={() => setLandlordTab('chats-rcvd')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer relative ${
                    landlordTab === 'chats-rcvd' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                  <span className="absolute top-2 right-6 bg-purple-600 text-[8px] text-white font-extrabold h-4 w-4 rounded-full flex items-center justify-center shadow">1</span>
                </button>
                <button 
                  id="tab-landlord-dashboard"
                  onClick={() => setLandlordTab('dashboard')}
                  className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                    landlordTab === 'dashboard' ? 'text-purple-300 text-glow' : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/*                      MODAL LAYERS                         */}
          {/* ========================================================= */}
          <AnimatePresence>
            {selectedProperty && (
              <PropertyDetail
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
                currentUserRole={currentRole}
                onInquire={handleInquire}
                onOpenChat={(propId) => {
                  const property = properties.find(p => p.id === propId);
                  if (property) {
                    setActiveChatProperty(property);
                  }
                }}
                hasApplied={checkTenantApplied(selectedProperty.id)}
                applicationStatus={getTenantApplicationStatus(selectedProperty.id)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAddProperty && (
              <AddPropertyModal 
                onClose={() => setShowAddProperty(false)}
                onSave={handleAddProperty}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {activeChatProperty && (
              <ChatWindow
                property={activeChatProperty}
                partner={currentRole === 'tenant' ? SIMULATED_LANDLORD : SIMULATED_TENANT}
                currentUser={currentUser}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClose={() => setActiveChatProperty(null)}
                hasApplied={checkTenantApplied(activeChatProperty.id)}
                applicationStatus={getTenantApplicationStatus(activeChatProperty.id)}
                onAcquireProperty={currentRole === 'tenant' ? (propId) => handleInquire(propId, "Hi Sarah! I am ready to acquire this room. Let's arrange walk-through!") : undefined}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
