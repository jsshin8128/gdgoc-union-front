export interface SnsLink {
  platform: string;
  url: string;
}

export interface ArtistDetail {
  artistId: number;
  name: string;
<<<<<<< HEAD
  profileImageUrl: string;
  description: string;
  genre: string[];
=======
  profileImageUrl?: string;
  description?: string;
  genre?: string[];
>>>>>>> js
  sns: SnsLink[];
}

export interface Artist {
<<<<<<< HEAD
  artistId: number;
=======
  id: number;
>>>>>>> js
  name: string;
  profileImageUrl: string;
  createdAt: string;
}

export interface ArtistsApiResponse {
  success: boolean;
  data: {
    artists: Artist[];
  };
  message: string;
}
<<<<<<< HEAD
=======

>>>>>>> js
