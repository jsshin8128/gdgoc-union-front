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

const Index = () => {
  const [selectedArtistIds, setSelectedArtistIds] = useState<number[]>([]);
  const [subscribedArtistIds, setSubscribedArtistIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 선택된 아티스트가 없으면 빈 배열 (아무것도 표시 안 함)
  const eventDates = selectedArtistIds.length > 0
    ? getAllEventDates() // 선택된 아티스트들의 일정은 Calendar에서 필터링
    : [];
  
  // 선택된 날짜의 이벤트 가져오기
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

    const handleSubscriptionChange = () => {
      loadSubscriptions();
    };

    window.addEventListener('subscriptionChanged', handleSubscriptionChange);
    return () => {
      window.removeEventListener('subscriptionChanged', handleSubscriptionChange);
    };
  }, []);

  const handleArtistToggle = (artistId: number) => {
    setSelectedArtistIds((prev) => {
      if (prev.includes(artistId)) {
        return prev.filter((id) => id !== artistId);
      } else {
        return [...prev, artistId];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedArtistIds([]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
      <BottomNav />
    </div>
  );
};

export default Index;
