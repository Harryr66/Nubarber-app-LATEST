"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const { user, db: defaultDb } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugInfo = async () => {
    if (!user || !defaultDb) return;
    
    setIsLoading(true);
    try {
      // Get user's shop document
      const shopDocRef = doc(defaultDb, "shops", user.uid);
      const shopDoc = await getDoc(shopDocRef);
      
      // Get all shops to see what's in the database
      const shopsRef = collection(defaultDb, "shops");
      const allShopsSnapshot = await getDocs(shopsRef);
      
      const allShops = allShopsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDebugInfo({
        user: {
          uid: user.uid,
          email: user.email
        },
        userShop: shopDoc.exists() ? shopDoc.data() : null,
        allShops: allShops,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Debug fetch error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Database Debug Page</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>
              Check what's actually stored in your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDebugInfo} disabled={isLoading}>
              {isLoading ? "Loading..." : "Fetch Debug Info"}
            </Button>
          </CardContent>
        </Card>

        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Database State</CardTitle>
              <CardDescription>
                Current database contents as of {debugInfo.timestamp}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">User Info:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.user, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Your Shop Document:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.userShop, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">All Shops in Database:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(debugInfo.allShops, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 