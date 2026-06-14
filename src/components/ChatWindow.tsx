import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Property, User } from '../types';
import { 
  Send, ArrowLeft, ShieldAlert, CheckCircle, Image, FileText, 
  Check, Paperclip, Globe, RefreshCw, Unlink, ExternalLink, 
  Settings, MessageSquare, AlertCircle
} from 'lucide-react';
import { 
  getAccessToken, setAccessToken, initiateGoogleOAuth, 
  listGoogleChatSpaces, postMessageToGoogleChat, logoutGoogle, 
  GoogleChatSpace, checkUrlForAccessToken, fetchGoogleUserInfo
} from '../lib/googleAuth';

interface ChatWindowProps {
  property: Property;
  partner: User;
  currentUser: User;
  messages: Message[];
  onSendMessage: (propertyId: string, messageText: string, syncToGoogleChatSpace?: string | null) => void;
  onClose: () => void;
  onAcquireProperty?: (propertyId: string) => void;
  hasApplied: boolean;
  applicationStatus?: 'pending' | 'approved' | 'rejected';
}

const TENANT_QUICK_REPLIES = [
  'Is this room still available?',
  'When is the earliest I can do a physical walkthrough?',
  'I am ready to sign the lease agreement!',
  'Does the rent price include electricity/heat utilities?'
];

const LANDLORD_QUICK_REPLIES = [
  'Yes, the property is still open for viewing!',
  'Could you share your monthly income details and status?',
  'I have pre-approved your inquiry. Feel free to book a walkthrough!',
  'Perfect! Let us finalize the security deposit and key handover.'
];

const SIMULATED_SPACES: GoogleChatSpace[] = [
  { name: 'spaces/greenwood_studio_sync', displayName: 'Greenwood Studio Negotiations', type: 'ROOM' },
  { name: 'spaces/modern_loft_discuss', displayName: 'Modern Loft Lease Chat', type: 'ROOM' },
  { name: 'spaces/sh_room_alex_sarah', displayName: 'Shared Villa - Suite A Roommates', type: 'ROOM' }
];

export default function ChatWindow({
  property,
  partner,
  currentUser,
  messages,
  onSendMessage,
  onClose,
  onAcquireProperty,
  hasApplied,
  applicationStatus,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Google Chat States
  const [googleToken, setGoogleToken] = useState<string | null>(getAccessToken());
  const [googleSpaces, setGoogleSpaces] = useState<GoogleChatSpace[]>(SIMULATED_SPACES);
  const [googleUser, setGoogleUser] = useState<{ name: string; picture: string } | null>(null);
  const [isSimulatedGoogleChat, setIsSimulatedGoogleChat] = useState<boolean>(true);
  const [linkedSpace, setLinkedSpace] = useState<string | null>(() => 
    localStorage.getItem(`gchat_space_${property.id}_${currentUser.role}`)
  );
  
  const [customTokenInput, setCustomTokenInput] = useState('');
  const [showSyncSettings, setShowSyncSettings] = useState(false);
  const [gchatError, setGchatError] = useState<string | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  // Filters messages specific to this selected conversation (combination of sender, receiver, and property)
  const conversationMessages = messages.filter(
    (msg) => 
      msg.propertyId === property.id &&
      ((msg.senderId === currentUser.id && msg.receiverId === partner.id) ||
       (msg.senderId === partner.id && msg.receiverId === currentUser.id))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages.length]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(property.id, inputText.trim(), linkedSpace);
    setInputText('');

    if (!isSimulatedGoogleChat && googleToken && linkedSpace) {
      postMessageToGoogleChat(googleToken, linkedSpace, `[Rental App: ${currentUser.name}] ${inputText.trim()}`)
        .then(() => console.log('Successfully posted message to live Google Chat Space!'))
        .catch(err => {
          console.error('Google Chat post failed:', err);
          setGchatError('Unable to post message automatically to Google Chat. OAuth token is expired.');
        });
    }
  };

  const handleQuickReplyClick = (reply: string) => {
    onSendMessage(property.id, reply, linkedSpace);

    if (!isSimulatedGoogleChat && googleToken && linkedSpace) {
      postMessageToGoogleChat(googleToken, linkedSpace, `[Rental App: ${currentUser.name}] ${reply}`)
        .then(() => console.log('Successfully posted quick reply to live Google Chat Space!'))
        .catch(err => {
          console.error('Google Chat post failed:', err);
          setGchatError('Unable to post reply. Google Chat authentication failed.');
        });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="chat-window-overlay"
      className="absolute inset-0 z-50 glass-panel flex flex-col h-full text-slate-100"
    >
      {/* Chat Navigation Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg text-white">
        <div className="flex items-center gap-3">
          <button 
            id="close-chat-window"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img 
                src={partner.avatar} 
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div>
              <div className="text-[10px] text-white/50 font-bold tracking-wider uppercase">
                {partner.role === 'landlord' ? 'Verified Landlord' : 'Interested Tenant'}
              </div>
              <h3 className="text-sm font-bold font-display text-white leading-tight">
                {partner.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Small property mini-card for navigation reference */}
        <div className="hidden sm:flex items-center gap-2 bg-white/5 p-1.5 rounded-lg border border-white/10 max-w-[140px]">
          <img src={property.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
          <div className="truncate text-[10px]">
            <div className="font-bold text-white truncate">{property.title}</div>
            <div className="text-purple-400 font-medium">{property.price.toLocaleString()} ugshs/mo</div>
          </div>
        </div>
      </div>

      {/* Property Context Banner */}
      <div id="chat-property-banner" className="bg-purple-950/30 px-4 py-1.5 border-b border-purple-500/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-purple-200">
          <span className="font-bold">Listing:</span>
          <span className="truncate max-w-[200px]">{property.title}</span>
          <span className="font-semibold text-pink-400">({property.price.toLocaleString()} ugshs/mo)</span>
        </div>
        
        {/* Simple booking integration right inside custom chat banner */}
        {currentUser.role === 'tenant' && (
          <div>
            {hasApplied ? (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30`}>
                App: {applicationStatus}
              </span>
            ) : property.status === 'available' && onAcquireProperty ? (
              <button
                id="chat-acquire-btn"
                onClick={() => onAcquireProperty(property.id)}
                className="px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-650 hover:to-pink-650 text-white rounded text-[10px] font-extrabold shadow-sm transition-all"
              >
                Acquire Room
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Google Chat Sync Header and Settings Drawer */}
      <div className="bg-slate-900/80 border-b border-purple-500/15 px-4 py-2 flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Globe className={`w-3.5 h-3.5 ${linkedSpace ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-bold text-white tracking-wide">Google Chat Link</span>
            <span className={`text-[8px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide ${
              linkedSpace ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/20' : 'bg-white/5 text-slate-400 border border-transparent'
            }`}>
              {linkedSpace ? 'Active Sync' : 'Not Linked'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSyncSettings(!showSyncSettings)}
            className="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3 h-3" />
            <span>Connect Settings</span>
          </button>
        </div>

        {linkedSpace && !showSyncSettings && (
          <div className="flex items-center justify-between text-[10px] text-white/50 bg-white/5 px-2 py-1 rounded border border-white/5">
            <span className="truncate max-w-[220px]">
              Streaming to Chat: <b className="text-purple-300 font-sans">
                {googleSpaces.find(s => s.name === linkedSpace)?.displayName || 'Custom Chat Space'}
              </b>
            </span>
            {isSimulatedGoogleChat ? (
              <span className="text-blue-400 text-[9px] font-bold">Simulator Active</span>
            ) : (
              <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Workspace API live</span>
            )}
          </div>
        )}

        {showSyncSettings && (
          <div className="p-2.5 mt-1.5 rounded-lg bg-black/40 border border-white/5 space-y-2 text-xs">
            {/* Sandbox Mode Switcher */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className="font-bold text-white uppercase tracking-wider text-[10px]">Google Environment</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulatedGoogleChat(true);
                    setGoogleSpaces(SIMULATED_SPACES);
                  }}
                  className={`px-2 py-0.5 text-[9px] font-black rounded uppercase transition-colors cursor-pointer ${
                    isSimulatedGoogleChat ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Simulator
                </button>
                <button
                  type="button"
                  onClick={() => setIsSimulatedGoogleChat(false)}
                  className={`px-2 py-0.5 text-[9px] font-black rounded uppercase transition-colors cursor-pointer ${
                    !isSimulatedGoogleChat ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  OAuth API
                </button>
              </div>
            </div>

            {/* Custom token if OAuth is active */}
            {!isSimulatedGoogleChat && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60">Google OAuth state</span>
                  {googleToken ? (
                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" /> Signed In
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold text-[10px]">Requires Token</span>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      initiateGoogleOAuth();
                      // Watch callback token
                      const timer = setInterval(() => {
                        const token = getAccessToken();
                        if (token) {
                          setGoogleToken(token);
                          clearInterval(timer);
                          fetchGoogleUserInfo(token).then(usr => {
                            if (usr) setGoogleUser(usr);
                          });
                        }
                      }, 1000);
                    }}
                    className="flex-1 py-1 px-2.5 bg-white text-slate-950 font-bold rounded hover:bg-slate-250 transition-colors flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Authorize Google Workspace API</span>
                  </button>

                  {googleToken && (
                    <button
                      type="button"
                      onClick={() => {
                        logoutGoogle();
                        setGoogleToken(null);
                        setLinkedSpace(null);
                      }}
                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                      title="Disconnect Profile"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Direct developer token input */}
                <div className="space-y-1">
                  <label className="text-[9px] text-white/40 block">Developer Access Token Manual Paste</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={customTokenInput}
                      onChange={(e) => setCustomTokenInput(e.target.value)}
                      placeholder="ya29.a0Acv..."
                      className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-0.5 text-[9px] text-white font-mono placeholder-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customTokenInput.trim()) {
                          setAccessToken(customTokenInput.trim());
                          setGoogleToken(customTokenInput.trim());
                          setIsLoadingSpaces(true);
                          listGoogleChatSpaces(customTokenInput.trim())
                            .then(spaces => {
                              setGoogleSpaces(spaces);
                              setGchatError(null);
                            })
                            .catch(err => {
                              setGchatError('Invalid token or insufficient scope permissions.');
                            })
                            .finally(() => setIsLoadingSpaces(false));
                        }
                      }}
                      className="px-2 py-0.5 bg-purple-600 rounded font-bold text-[9px] cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Select Google Chat Target Space */}
            <div className="space-y-1">
              <label className="text-[10px] text-white/50 block">Select Target Google Chat Space / Room</label>
              <div className="flex gap-1">
                <select
                  value={linkedSpace || ''}
                  onChange={(e) => {
                    const space = e.target.value || null;
                    setLinkedSpace(space);
                    if (space) {
                      localStorage.setItem(`gchat_space_${property.id}_${currentUser.role}`, space);
                    } else {
                      localStorage.removeItem(`gchat_space_${property.id}_${currentUser.role}`);
                    }
                  }}
                  className="flex-1 bg-black/40 border border-white/10 text-white text-[10px] rounded px-1.5 py-0.5"
                >
                  <option value="">-- No Linked Space --</option>
                  {googleSpaces.map(sp => (
                    <option key={sp.name} value={sp.name}>{sp.displayName}</option>
                  ))}
                </select>

                {linkedSpace && (
                  <button
                    type="button"
                    onClick={() => {
                      setLinkedSpace(null);
                      localStorage.removeItem(`gchat_space_${property.id}_${currentUser.role}`);
                    }}
                    className="p-1 hover:bg-white/10 rounded text-red-400 cursor-pointer"
                    title="Remove space link"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {gchatError && (
              <p className="text-[9px] text-red-400 font-bold">{gchatError}</p>
            )}
          </div>
        )}
      </div>

      {/* Interactive Messages Stream */}
      <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent">
        {conversationMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="p-3 bg-purple-500/20 rounded-full text-purple-300">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-white">
              Protected Secure Chat Initiated
            </p>
            <p className="text-xs text-white/60 max-w-xs leading-relaxed">
              This space handles rentals directly. Feel free to schedule walkthroughs, send documents, and discuss lease terms directly below.
            </p>
          </div>
        ) : (
          conversationMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                    isMe 
                      ? 'bg-purple-600/75 backdrop-blur-md text-white rounded-tr-none border border-purple-500/20' 
                      : 'bg-white/5 backdrop-blur-md text-white rounded-tl-none border border-white/10'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line font-sans">{msg.message}</p>
                </div>
                
                <span className="text-[9px] text-white/40 mt-1 px-1 flex items-center gap-1.5">
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && <span className="text-purple-400 font-bold">&#10003; Sent</span>}
                  {linkedSpace && (
                    <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded-sm uppercase font-extrabold tracking-wider border border-emerald-500/10" title="Simulated Google Chat message sync active">
                      G-Chat
                    </span>
                  )}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Grid */}
      <div id="quick-replies-panel" className="px-4 py-2 bg-black/20 border-t border-white/5 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
        {(currentUser.role === 'tenant' ? TENANT_QUICK_REPLIES : LANDLORD_QUICK_REPLIES).map((reply, i) => (
          <button
            key={i}
            onClick={() => handleQuickReplyClick(reply)}
            className="inline-block px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full text-[11px] font-medium border border-white/5 transition-all cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Message Form */}
      <form 
        onSubmit={handleSend} 
        className="p-3 bg-black/30 border-t border-white/5 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => {
            const files = ['rental_application_pdf.zip', 'background_screen.pdf', 'agreement_signed.pdf'];
            const chosen = files[Math.floor(Math.random() * files.length)];
            const text = `📎 Uploaded Document: [${chosen}]`;
            onSendMessage(property.id, text, linkedSpace);

            if (!isSimulatedGoogleChat && googleToken && linkedSpace) {
              postMessageToGoogleChat(googleToken, linkedSpace, `[Rental App: ${currentUser.name}] ${text}`)
                .then(() => console.log('Successfully posted attachment to live Google Chat Space!'))
                .catch(err => console.error(err));
            }
          }}
          title="Attach files (Proof of income, rental applications)"
          className="p-2 hover:bg-white/15 text-white/50 hover:text-white rounded-full transition-colors flex-shrink-0 cursor-pointer"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input 
          id="chat-message-input"
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Write a message or use quick reply..."
          className="flex-1 glass-input focus:glass-input-focus rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30"
        />

        <button 
          id="send-message-btn"
          type="submit"
          className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
