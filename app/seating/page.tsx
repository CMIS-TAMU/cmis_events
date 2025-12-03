'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface Seat {
  id: string;
  row_number: number;
  seat_number: number;
  seat_label: string;
  is_available: boolean;
  is_accessible: boolean;
}

export default function SeatingLayoutPage() {
  const router = useRouter();
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Demo layout - 10 rows x 10 seats
  const rows = 10;
  const seatsPerRow = 10;

  // Generate seats
  const seatsByRow: { [key: number]: Seat[] } = {};
  for (let row = 1; row <= rows; row++) {
    seatsByRow[row] = [];
    for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
      const rowLetter = String.fromCharCode(64 + row);
      seatsByRow[row].push({
        id: `${row}-${seatNum}`,
        row_number: row,
        seat_number: seatNum,
        seat_label: `${rowLetter}${seatNum}`,
        is_available: true,
        is_accessible: seatNum === 1 || seatNum === seatsPerRow, // First and last seats are accessible
      });
    }
  }

  const getSeatColor = (seat: Seat) => {
    if (!seat.is_available) return 'bg-gray-400 cursor-not-allowed';
    if (seat.is_accessible) return 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer border-2 border-blue-700';
    return 'bg-blue-400 hover:bg-blue-500 text-white cursor-pointer';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Seating Layout</h1>
        <p className="text-muted-foreground">
          View the room layout and available seats
        </p>
      </div>

      {/* Legend */}
      <Card className="mb-6 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-700 rounded"></div>
              <span className="text-sm">Accessible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage/Front indicator */}
      <div className="text-center mb-4">
        <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded-t-lg">
          <span className="font-semibold">STAGE / FRONT</span>
        </div>
      </div>

      {/* Seating Grid */}
      <div className="bg-gray-100 p-6 rounded-lg mb-6 overflow-x-auto flex justify-center">
        <div className="inline-block">
          {Object.keys(seatsByRow)
            .map(Number)
            .sort((a, b) => a - b)
            .map((rowNum) => (
              <div key={rowNum} className="flex items-center gap-2 mb-2 justify-center">
                <div className="w-12 text-center font-semibold text-sm">
                  Row {String.fromCharCode(64 + rowNum)}
                </div>
                <div className="flex gap-1 justify-center">
                  {seatsByRow[rowNum]
                    .sort((a, b) => a.seat_number - b.seat_number)
                    .map((seat) => {
                      const isHovered = hoveredSeat === seat.id;
                      return (
                        <div
                          key={seat.id}
                          onMouseEnter={() => setHoveredSeat(seat.id)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`
                            w-10 h-10 rounded text-xs font-medium
                            transition-all duration-200
                            ${getSeatColor(seat)}
                            ${isHovered ? 'scale-110' : ''}
                            flex items-center justify-center
                          `}
                          title={
                            seat.is_accessible
                              ? `Seat ${seat.seat_label} (Accessible)`
                              : `Seat ${seat.seat_label}`
                          }
                        >
                          {seat.seat_number}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Layout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-center">
            <p>
              <strong>Total Seats:</strong> {rows * seatsPerRow}
            </p>
            <p>
              <strong>Rows:</strong> {rows} (A through {String.fromCharCode(64 + rows)})
            </p>
            <p>
              <strong>Seats per Row:</strong> {seatsPerRow}
            </p>
            <p>
              <strong>Layout Type:</strong> Grid
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

