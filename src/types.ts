export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'farmer' | 'owner' | 'admin';
  photoURL?: string;
  createdAt: any;
}

export interface Equipment {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  category: string;
  description: string;
  pricePerHour: number;
  location: string;
  images: string[];
  availability: boolean;
  rating: number;
  createdAt: any;
}

export interface Booking {
  id: string;
  farmerId: string;
  ownerId: string;
  equipmentId: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'pending' | 'accepted' | 'in-use' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  createdAt: any;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}
