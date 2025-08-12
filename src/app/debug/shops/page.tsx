"use client";

import { useState, useEffect } from "react";
import { getFirebase } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopData {
  id: string;
  name: string;
  subdomain?: string;
  address?: string;
  ownerId?: string;
}

export default function DebugShopsPage() {
  const [shops, setShops] = useState<ShopData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const { defaultDb } = getFirebase();
      
      if (!defaultDb) {
        console.error('Database connection failed');
        return;
      }

      const shopsRef = collection(defaultDb, "shops");
      const shopsSnapshot = await getDocs(shopsRef);
      
      const shopsData = shopsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ShopData[];
      
      setShops(shopsData);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubdomains = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/shops/update-subdomains', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update result:', result);
        // Refresh the shops list
        await fetchShops();
      } else {
        console.error('Failed to update subdomains');
      }
    } catch (error) {
      console.error('Error updating subdomains:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Debug: Shops Database</h1>
          <Button onClick={updateSubdomains} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Missing Subdomains"}
          </Button>
        </div>

        <div className="grid gap-4">
          {shops.map((shop) => (
            <Card key={shop.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{shop.name}</span>
                  <span className="text-sm text-gray-500">ID: {shop.id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Subdomain:</strong> {shop.subdomain ? shop.subdomain : <span className="text-red-500">MISSING</span>}
                  </div>
                  <div>
                    <strong>Address:</strong> {shop.address || "Not set"}
                  </div>
                  <div>
                    <strong>Owner ID:</strong> {shop.ownerId || "Not set"}
                  </div>
                  <div>
                    <strong>Public URL:</strong> {shop.subdomain ? `/${shop.subdomain}` : `/barbers/${shop.id}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {shops.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No shops found in database</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 