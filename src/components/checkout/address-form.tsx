"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  label: z.string().optional(),
  line1: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter valid 6-digit pincode"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddressFormProps {
  onSubmitAddress?: (values: FormValues) => Promise<void> | void;
  submitLabel?: string;
  initialValues?: Partial<FormValues>;
}

export function AddressForm({
  onSubmitAddress,
  submitLabel = "Save address",
  initialValues,
}: AddressFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "Home", line1: "", city: "", state: "", pincode: "", phone: "" },
  });

  useEffect(() => {
    form.reset({
      label: initialValues?.label ?? "Home",
      line1: initialValues?.line1 ?? "",
      city: initialValues?.city ?? "",
      state: initialValues?.state ?? "",
      pincode: initialValues?.pincode ?? "",
      phone: initialValues?.phone ?? "",
    });
  }, [form, initialValues]);

  const onSubmit = async (values: FormValues) => {
    if (onSubmitAddress) {
      await onSubmitAddress(values);
      return;
    }
    console.log("address", values);
  };

  const {
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Input placeholder="Label (Home/Office)" {...form.register("label")} />
        {errors.label ? <p className="text-xs text-red-600">{errors.label.message}</p> : null}
      </div>
      <div className="space-y-1.5">
        <Input placeholder="Address line 1" {...form.register("line1")} />
        {errors.line1 ? <p className="text-xs text-red-600">{errors.line1.message}</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Input placeholder="City" {...form.register("city")} />
          {errors.city ? <p className="text-xs text-red-600">{errors.city.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Input placeholder="State" {...form.register("state")} />
          {errors.state ? <p className="text-xs text-red-600">{errors.state.message}</p> : null}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Input placeholder="Pincode" {...form.register("pincode")} />
          {errors.pincode ? <p className="text-xs text-red-600">{errors.pincode.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Input placeholder="Phone" {...form.register("phone")} />
          {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
        </div>
      </div>
      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
