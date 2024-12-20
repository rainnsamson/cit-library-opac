import { Timestamp } from 'firebase/firestore';  // Import Timestamp from Firestore

export interface Book {
  id: string;
  title: string;
  author: string;
  callNumber: string;
  copyright: string;
  location: string;
  availability: number;
  imageUrl: string;
  createdAt: Timestamp;  // Use Timestamp here
}
