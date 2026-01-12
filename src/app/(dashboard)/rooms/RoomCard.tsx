"use client";

import { useState } from "react";
import { Room } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import BookingModal from "./BookingModal";
import { Users, Wifi, Monitor, Calendar } from "lucide-react";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getEquipmentIcon = (equipment: string) => {
    const lower = equipment.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="w-4 h-4" />;
    if (lower.includes("écran") || lower.includes("projecteur") || lower.includes("vidéo")) return <Monitor className="w-4 h-4" />;
    return null;
  };

  return (
    <>
      <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary-200 overflow-hidden">
        {/* Image placeholder */}
        <div className="h-48 bg-gradient-to-br from-primary-500 to-secondary-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl font-bold opacity-20">{room.name.charAt(0)}</div>
            </div>
          </div>
          {room.image_url && (
            <img 
              src={room.image_url} 
              alt={room.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-2xl">{room.name}</CardTitle>
            <div className="flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">{room.capacity}</span>
            </div>
          </div>
          {room.description && (
            <CardDescription className="text-base">{room.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {room.equipments && room.equipments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Équipements disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {room.equipments.map((equipment, index) => (
                  <div 
                    key={index}
                    className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-primary-200"
                  >
                    {getEquipmentIcon(equipment)}
                    {equipment}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 border-t">
          <Button 
            className="w-full group/btn shadow-md hover:shadow-xl transition-all" 
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            <Calendar className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
            Réserver cette salle
          </Button>
        </CardFooter>
      </Card>

      <BookingModal
        room={room}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
