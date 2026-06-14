import { Property, Message, Inquiry, User } from './types';

export const SIMULATED_TENANT: User = {
  id: 'tenant_alex',
  name: 'Alex Rivera',
  role: 'tenant',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  email: 'alex.rivera@example.com',
  phone: '+1 (555) 019-2834'
};

export const SIMULATED_LANDLORD: User = {
  id: 'landlord_sarah',
  name: 'Sarah Jenkins',
  role: 'landlord',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  email: 's.jenkins@livingspaces.net',
  phone: '+1 (555) 022-8941'
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop_1',
    title: 'Modern Loft with City View',
    description: 'A stunning industrial-style loft featuring double-height ceilings, premium concrete finishes, and a wall of windows offering panoramic skyline views. Perfect for young professionals seeking urban elegance. Outfitted with high-speed fiber internet, full smart home integration, and energy-efficient climate control.',
    price: 1850000,
    deposit: 1500000,
    location: 'Downtown Arts District, Sector 4',
    type: 'Apartment',
    beds: 1,
    baths: 1,
    sqft: 780,
    amenities: ['High-speed Wi-Fi', 'In-unit Laundry', 'Rooftop Lounge', '24/7 Security', 'Gym Access', 'Pet Friendly'],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    landlordId: 'landlord_sarah',
    landlordName: 'Sarah Jenkins',
    landlordAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'available',
    tenantId: null
  },
  {
    id: 'prop_2',
    title: 'Cozy Mid-Century Modern Studio',
    description: 'Beautifully curated studio apartment steps away from the central park and metro line. Complete with bespoke oak cabinetry, premium built-in appliances, and a secluded private balcony surrounded by jasmine trellises. Rent includes hot water, trash removal, and underground bike storage.',
    price: 1200000,
    deposit: 1000000,
    location: 'Greenwood Heights, Block 12',
    type: 'Studio',
    beds: 1,
    baths: 1,
    sqft: 450,
    amenities: ['Balcony', 'Bike Storage', 'Near Public Transit', 'Hardwood Floors', 'Dishwasher'],
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    landlordId: 'landlord_sarah',
    landlordName: 'Sarah Jenkins',
    landlordAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'available',
    tenantId: null
  },
  {
    id: 'prop_3',
    title: 'Spacious Bedroom in Shared Villa',
    description: 'Looking to sublease a generous 220 sqft private bedroom in a gorgeous colonial-style shared house. Shared areas include a premium chef\'s kitchen with marble countertops, a beautifully landscaped garden with a brick barbecue hearth, and an expansive living room with a limestone fireplace.',
    price: 850000,
    deposit: 500000,
    location: 'Oakridge Suburbs, Lane 5',
    type: 'Room',
    beds: 1,
    baths: 2, // Shared total
    sqft: 220,
    amenities: ['Private Walk-in Closet', 'Landscaped Garden', 'Parking Space', 'Chef\'s Kitchen', 'Furnished'],
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800',
    landlordId: 'landlord_sarah',
    landlordName: 'Sarah Jenkins',
    landlordAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'available',
    tenantId: null
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_1',
    propertyId: 'prop_2',
    propertyName: 'Cozy Mid-Century Modern Studio',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    tenantId: 'tenant_alex',
    tenantName: 'Alex Rivera',
    tenantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    landlordId: 'landlord_sarah',
    status: 'pending',
    message: 'Hello Sarah! I absolute love this cozy studio. It looks incredibly sunny, and its close to my work. Can we schedule a viewing or proceed with the lease inquiry?',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString() // 4 hours ago
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    propertyId: 'prop_2',
    senderId: 'tenant_alex',
    senderName: 'Alex Rivera',
    receiverId: 'landlord_sarah',
    message: 'Hello Sarah, I submitted an application for the Greenwood Heights Cozy Studio. Is there any chance we could arrange a brief walkthrough?',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'msg_2',
    propertyId: 'prop_2',
    senderId: 'landlord_sarah',
    senderName: 'Sarah Jenkins',
    receiverId: 'tenant_alex',
    message: 'Hi Alex! Thanks for reaching out. Yes, the studio is getting plenty of interest, but your background looks fantastic. I am hosting tours tomorrow afternoon around 2 PM. How does that sound?',
    createdAt: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString()
  },
  {
    id: 'msg_3',
    propertyId: 'prop_2',
    senderId: 'tenant_alex',
    senderName: 'Alex Rivera',
    receiverId: 'landlord_sarah',
    message: 'That would be excellent! I can absolutely make 2 PM work. I will bring my verification documents.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

export const PROPERTY_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    label: 'Modern Minimalist Apt'
  },
  {
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
    label: 'Cozy Mid-Century Studio'
  },
  {
    url: 'https://images.unsplash.com/photo-1502672019681-9955fa1e5809?auto=format&fit=crop&q=80&w=800',
    label: 'Sunlit Urban Bedroom'
  },
  {
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
    label: 'Stylish Premium Parlor'
  },
  {
    url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
    label: 'Elegant Family Kitchen'
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    label: 'Luxurious Contemporary Villa'
  }
];
