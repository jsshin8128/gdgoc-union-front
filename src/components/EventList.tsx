import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CalendarEvent } from "@/types/calendarEvent";
import { useMemo } from "react";
import { format } from "date-fns";

const getTicketSiteName = (url?: string): string | null => {
  if (!url) return null;
  if (url.includes("tickets.interpark.com")) return "NOL 티켓";
  if (url.includes("ticket.yes24.com")) return "YES24";
  if (url.includes("ticket.melon.com")) return "멜론 티켓";
  if (url.includes("ticketlink.co.kr")) return "티켓링크";
  return null;
};

interface EventListProps {
  events: CalendarEvent[];
}

const EventList = ({ events }: EventListProps) => {
  const navigate = useNavigate();

  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      if (!acc[event.artistId]) {
        acc[event.artistId] = {
          artistId: event.artistId,
          artistName: event.artistName,
          artistProfileImageUrl: event.artistProfileImageUrl, 
          events: [],
        };
      }
      acc[event.artistId].events.push(event);
      return acc;
    }, {} as Record<number, { artistId: number; artistName: string; artistProfileImageUrl: string; events: CalendarEvent[] }>);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="px-6 py-10 text-center">
        <p className="text-muted-foreground">선택된 날짜에 일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-6">
      {Object.values(groupedEvents).map((group) => (
        <div key={group.artistId}>
          <div 
            className="flex items-center gap-2 mb-4 cursor-pointer"
            onClick={() => navigate(`/artist/${group.artistId}`)}
          >
            <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors">
              {group.artistName}
            </h3>
          </div>
          <div className="space-y-4">
            {group.events.map((event) => {
              const ticketSite = getTicketSiteName(event.bookingUrl);
              const locationText = event.type === 'booking' 
                ? `예매 일정 ${ticketSite ? `| ${ticketSite}` : ''}`
                : event.place;
              
              return (
                <Card 
                  key={`${event.concertId}-${event.type}-${event.scheduleId || event.dateTime}`} 
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="w-20 h-20 rounded-lg object-cover bg-muted flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.type === 'booking' ? '예매' : '공연'} | {format(new Date(event.dateTime), 'MM.dd (E) HH:mm')}
                      </p>
                      <h4 className="font-semibold text-foreground mb-1 truncate">
                        {event.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {locationText}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;