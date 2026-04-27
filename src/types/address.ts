export interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
