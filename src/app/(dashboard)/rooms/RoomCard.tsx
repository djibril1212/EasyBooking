"use client";

import { useState } from "react";
import { Room } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import BookingModal from "./BookingModal";

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
            <Badge variant="default">{room.capacity} places</Badge>
          </div>
        </CardHeader>

        <CardContent>
          {room.description && (
            <p className="text-gray-600 mb-4">{room.description}</p>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Équipements :</p>
            <div className="flex flex-wrap gap-2">
              {room.equipments && room.equipments.length > 0 ? (
                room.equipments.map((equipment, index) => (
                  <Badge key={index} variant="success">
                    {equipment}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Aucun équipement</span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={() => setIsModalOpen(true)}>
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
