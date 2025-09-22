import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'mama' | 'bagitong_kusinero';

export interface UserProfile {
  id: string;
  pangalan: string;
  email: string;
  role: UserRole;
}

export interface RecipeCategory {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  pamagat: string;
  kategorya: string;
  sangkap: string[];
  hakbang: string[];
  ginawaNi: string; // userId
  ginawaNiPangalan: string;
  petsaGawa: Timestamp;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userPangalan: string;
  teksto: string;
  petsaGawa: Timestamp;
}
