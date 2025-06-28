export interface User {
  id: number;
  email: string;
  role: 'mentor' | 'mentee';
  profile: Profile;
}

export interface Profile {
  name: string;
  bio: string;
  imageUrl: string;
  skills?: string[];
}

export interface Mentor extends User {
  role: 'mentor';
  profile: Profile & {
    skills: string[];
  };
}

export interface Mentee extends User {
  role: 'mentee';
}

export interface MatchRequest {
  id: number;
  mentorId: number;
  menteeId: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at?: string;
  mentor?: {
    id?: number;
    user?: {
      name?: string;
      email?: string;
    };
    skills?: string;
    experience_years?: number;
  };
  mentee?: {
    id?: number;
    user?: {
      name?: string;
      email?: string;
    };
    interests?: string;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  name: string;
  role: 'mentor' | 'mentee';
}

export interface ProfileUpdateData {
  id: number;
  name: string;
  role: 'mentor' | 'mentee';
  bio: string;
  image?: string;
  skills?: string[];
}