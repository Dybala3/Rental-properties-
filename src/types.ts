export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  deposit: number;
  location: string;
  type: 'Apartment' | 'Studio' | 'Room' | 'Shared Room';
  beds: number;
  baths: number;
  sqft: number;
  amenities: string[];
  imageUrl: string;
  landlordId: string;
  landlordName: string;
  landlordAvatar: string;
  status: 'available' | 'pending' | 'acquired';
  tenantId: string | null;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  tenantId: string;
  tenantName: string;
  tenantAvatar: string;
  landlordId: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  createdAt: string;
}

export interface Message {
  id: string;
  propertyId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: 'landlord' | 'tenant';
  avatar: string;
  email: string;
  phone: string;
}
