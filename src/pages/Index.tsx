import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArtistCarousel from "@/components/ArtistCarousel";
import Calendar from "@/components/Calendar";
import EventList from "@/components/EventList";
import BottomNav from "@/components/BottomNav";
import { getAllEventDates } from "@/data/artistSchedules";
import { getSubscriptions } from "@/lib/api/subscription";
import { getEventsByDate } from "@/data/artistEvents";
import { CalendarEvent } from "@/types/calendarEvent";
import MyArtistProfile from "./MyArtistProfile";
import { Loader2 } from "lucide-react";

const FanHome = () => {
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [subscribedArtistIds, setSubscribedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const eventDates = selectedArtistIds.length > 0 ? getAllEventDates() : [];
  const selectedDateEvents: CalendarEvent[] = selectedDate && selectedArtistIds.length > 0
    ? getEventsByDate(selectedDate, selectedArtistIds)
    : [];

  useEffect(() => {
    const loadSubscriptions = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setSubscribedArtistIds([]);
        return;
      }
      try {
        const subscriptions = await getSubscriptions();
        const subscribedIds = subscriptions.map(s => s.artiProfileId);
        setSubscribedArtistIds(subscribedIds);
      } catch (error) {
        console.error('구독 목록 로드 실패:', error);
        setSubscribedArtistIds([]);
      }
    };

    loadSubscriptions();
    window.addEventListener('subscriptionChanged', loadSubscriptions);
    return () => {
      window.removeEventListener('subscriptionChanged', loadSubscriptions);
    };
  }, []);

  const handleArtistToggle = (artistId: number) => {
    setSelectedArtistIds((prev) => prev.includes(artistId) ? prev.filter((id) => id !== artistId) : [...prev, artistId]);
  };

  const handleClearSelection = () => {
    setSelectedArtistIds([]);
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-xl mx-auto">
        <ArtistCarousel 
          onArtistToggle={handleArtistToggle} 
          selectedArtistIds={selectedArtistIds} 
        />
        <Calendar 
          eventDates={eventDates} 
          selectedArtistIds={selectedArtistIds}
          onClearSelection={handleClearSelection}
          subscribedArtistIds={subscribedArtistIds}
          onDateSelect={setSelectedDate}
        />
        <div className="h-4 bg-muted/30" />
        <EventList events={selectedDateEvents} />
      </main>
    </>
  );
};

const Index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {userRole === 'ARTIST' ? <MyArtistProfile /> : <FanHome />}
      <BottomNav />
    </div>
  );
};

export default Index;
