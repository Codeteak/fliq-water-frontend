"use client";

import { useEffect, useState } from "react";
import { CreditCard, MapPinHouse, PencilLine, Trash2, Wallet } from "lucide-react";
import { AddressForm } from "@/components/checkout/address-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addAddress, deleteAddress, listAddresses, updateAddress } from "@/features/addresses/api";
import { getWalletBalance, topUpWallet } from "@/features/deposits/api";
import { useAuth } from "@/hooks/use-auth";
import type { Address } from "@/types/address";
import { normalizeError } from "@/lib/error";

export default function AccountPage() {
  const { userName } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [topUpAmount, setTopUpAmount] = useState("200");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loadData = async () => {
    try {
      const [addressData, wallet] = await Promise.all([listAddresses(), getWalletBalance()]);
      setAddresses(addressData);
      setWalletBalance(wallet.balance);
    } catch (err) {
      setError(normalizeError(err, "Unable to load account data").message);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleAddAddress = async (values: {
    label?: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
  }) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, values);
        setEditingAddress(null);
        setStatus("Address updated");
      } else {
        await addAddress(values);
        setStatus("Address added");
      }
      await loadData();
    } catch (err) {
      setError(normalizeError(err, "Unable to save address").message);
    }
  };

  const handleTopUp = async () => {
    try {
      const next = await topUpWallet({ amount: Number(topUpAmount), note: "Customer top-up" });
      setWalletBalance(next.balance);
      setStatus("Wallet top-up successful");
    } catch (err) {
      setError(normalizeError(err, "Wallet top-up failed").message);
    }
  };

  const handleDeleteAddress = async (address: Address) => {
    const shouldDelete = window.confirm(
      `Delete ${address.label ?? "this"} address? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    try {
      setDeletingAddressId(address.id);
      await deleteAddress(address.id);
      if (editingAddress?.id === address.id) {
        setEditingAddress(null);
      }
      setStatus("Address deleted");
      setError("");
      await loadData();
    } catch (err) {
      setError(normalizeError(err, "Unable to delete address").message);
    } finally {
      setDeletingAddressId(null);
    }
  };

  const userInitials = (userName || "CU")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="container mx-auto px-4 py-5 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <Card className="rounded-2xl border bg-background/95 py-0 shadow-sm">
          <CardContent className="px-4 py-5 sm:px-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar size="lg" className="size-14 sm:size-16">
                <AvatarFallback>{userInitials || "CU"}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Customer profile</p>
                <h1 className="truncate text-2xl font-semibold text-foreground">
                  {userName || "Welcome to Fliq"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">Manage wallet and saved addresses</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline">Active account</Badge>
                  <Badge variant="secondary">COD enabled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {status ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {status}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList
            variant="line"
            className="h-12 w-full justify-start gap-4 overflow-x-auto rounded-none border-b bg-transparent px-0"
          >
            <TabsTrigger value="wallet" className="h-11 min-w-[120px] justify-start text-sm">
              <Wallet className="size-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="addresses" className="h-11 min-w-[120px] justify-start text-sm">
              <MapPinHouse className="size-4" />
              Addresses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="mt-4">
            <Card className="rounded-2xl border py-0">
              <CardContent className="space-y-5 px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3">
                  <div>
                    <p className="text-xs text-sky-700">Deposit wallet balance</p>
                    <p className="mt-1 text-3xl font-semibold text-sky-900">Rs. {walletBalance}</p>
                  </div>
                  <CreditCard className="size-6 text-sky-700" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="walletTopup" className="text-sm font-medium text-foreground">
                    Add amount
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="walletTopup"
                      inputMode="numeric"
                      className="h-11 sm:w-48"
                      value={topUpAmount}
                      onChange={(event) => setTopUpAmount(event.target.value)}
                    />
                    <Button type="button" className="h-11 sm:min-w-[180px]" onClick={handleTopUp}>
                      Top-up wallet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="mt-4 space-y-4">
            <Card className="rounded-2xl border py-0">
              <CardContent className="px-4 py-5 sm:px-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    {editingAddress ? "Edit address" : "Add new address"}
                  </h2>
                  {editingAddress ? (
                    <Button variant="ghost" type="button" className="h-9" onClick={() => setEditingAddress(null)}>
                      Cancel edit
                    </Button>
                  ) : null}
                </div>
                <AddressForm
                  onSubmitAddress={handleAddAddress}
                  submitLabel={editingAddress ? "Update address" : "Save address"}
                  initialValues={editingAddress ?? undefined}
                />
              </CardContent>
            </Card>

            <div className="space-y-3">
              {addresses.length === 0 ? (
                <Card className="rounded-2xl border py-0">
                  <CardContent className="px-4 py-4 text-sm text-muted-foreground">
                    No saved addresses yet. Add your first address to speed up checkout.
                  </CardContent>
                </Card>
              ) : null}

              {addresses.map((address) => (
                <Card key={address.id} className="rounded-2xl border py-0">
                  <CardContent className="flex items-start justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{address.label ?? "Address"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {address.line1}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.phone ? (
                        <p className="mt-1 text-xs text-muted-foreground">Phone: {address.phone}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 min-w-[100px]"
                        onClick={() => setEditingAddress(address)}
                      >
                        <PencilLine className="size-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="h-10 min-w-[100px]"
                        disabled={deletingAddressId === address.id}
                        onClick={() => void handleDeleteAddress(address)}
                      >
                        <Trash2 className="size-4" />
                        {deletingAddressId === address.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
