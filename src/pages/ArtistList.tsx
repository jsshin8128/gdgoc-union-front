import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import { Artist, ArtistsApiResponse } from "@/types/artist";

const ArtistList = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await apiClient.get<ArtistsApiResponse>('/api/artists');
        if (response.data.success) {
          setArtists(response.data.data.artists);
        } else {
          console.error("Failed to fetch artists:", response.data.message);
        }
      } catch (error) {
        console.error("An error occurred while fetching artists:", error);
      }
    };

    fetchArtists();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">나의 아티스트 추가</h1>
          <Button variant="ghost" onClick={() => navigate("/search")}>
            완료
          </Button>
        </div>
      </header>

      <main className="px-6 py-6">
        <p className="text-sm text-muted-foreground mb-6">
          추가하고 싶은 아티스트를 선택하세요.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {artists.map((artist) => (
            <button
              key={artist.artistId}
              onClick={() => navigate(`/artist/${artist.artistId}`)}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-full aspect-square rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                {artist.profileImageUrl ? (
                  <img src={artist.profileImageUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-secondary-foreground">
                    {artist.name}
                  </span>
                )}
              </div>
              <span className="text-sm text-foreground truncate w-full text-center">
                {artist.name}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ArtistList;
