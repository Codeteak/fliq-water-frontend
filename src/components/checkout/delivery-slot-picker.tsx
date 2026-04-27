"use client";

import { useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const SLOTS = ["07:00 - 09:00", "09:00 - 11:00", "18:00 - 20:00"];

interface DeliverySlotPickerProps {
  onChange?: (payload: { dateISO: string; slot: string }) => void;
}

export function DeliverySlotPicker({ onChange }: DeliverySlotPickerProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slot, setSlot] = useState<string>(SLOTS[0] ?? "");

  const updateSelection = (nextDate: Date | undefined, nextSlot: string) => {
    if (!nextDate) return;
    onChange?.({ dateISO: nextDate.toISOString(), slot: nextSlot });
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">Choose delivery slot</h3>
      <Calendar
        mode="single"
        selected={date}
        locale={enUS}
        onSelect={(nextDate) => {
          setDate(nextDate);
          updateSelection(nextDate, slot);
        }}
      />
      <div className="flex flex-wrap gap-2">
        {SLOTS.map((value) => (
          <Button
            key={value}
            variant={slot === value ? "default" : "outline"}
            onClick={() => {
              setSlot(value);
              updateSelection(date, value);
            }}
          >
            {value}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Selected: {date ? format(date, "PPP") : "No date"} - {slot}
      </p>
    </section>
  );
}
