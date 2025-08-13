"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, ExternalLink, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import PageHeader from "@/components/page-header";

function SettingsContent() {
  const { user, db: defaultDb } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();

  const [shopDetails, setShopDetails] = useState({ name: "", address: "", stripeAccountId: "" });
  const [stripeConnected, setStripeConnected] = useState(false);
  const [gmbConnected, setGmbConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stripeKeys, setStripeKeys] = useState({ publishableKey: "" });
  const [gmbKeys, setGmbKeys] = useState({ clientId: "", redirectUri: "" });

  useEffect(() => {
    if (searchParams.get('stripe_connected')) {
      setStripeConnected(true);
      toast({ title: "Success!", description: "Your Stripe account has been connected." });
      if (user && defaultDb) {
        updateDoc(doc(defaultDb, "shops", user.uid), { stripeConnected: true });
      }
    }
    if (searchParams.get('gmb_connected')) {
      setGmbConnected(true);
      toast({ title: "Success!", description: "Your Google My Business account has been connected." });
    }
    if (searchParams.get('error')) {
      toast({ title: "Connection Failed", description: "Could not connect to an external service.", variant: "destructive" });
    }

    const fetchShopDetails = async () => {
      if (!user || !defaultDb) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const shopDocRef = doc(defaultDb, "shops", user.uid);
        const shopDoc = await getDoc(shopDocRef);
        if (shopDoc.exists()) {
          const data = shopDoc.data();
          setShopDetails({ name: data.name || "", address: data.address || "", stripeAccountId: data.stripeAccountId || "" });
          setStripeConnected(data.stripeConnected || false);
          setGmbConnected(!!data.gmbAccessToken || !!searchParams.get('gmb_connected'));
        } else {
          console.log("No such document! Creating one for the user.");
          setShopDetails({ name: "My Barbershop", address: "", stripeAccountId: "" });
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
        toast({ title: "Error", description: "Could not load shop details.", variant: "destructive" });
      }
      setIsLoading(false);
    };
    if (user) {
      fetchShopDetails();
    } else {
      setIsLoading(false);
    }
  }, [user, defaultDb, toast, searchParams]);

  const handleSave = async () => {
    if (!user || !defaultDb) {
      toast({ title: "Error", description: "You must be logged in to save.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const shopDocRef = doc(defaultDb, "shops", user.uid);
      await setDoc(shopDocRef, { name: shopDetails.name, address: shopDetails.address }, { merge: true });
      toast({ title: "Success", description: "Shop details saved successfully." });
    } catch (error) {
      console.error("Error saving shop details:", error);
      toast({ title: "Error", description: "Could not save shop details.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  const handleStripeConnect = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          publishableKey: stripeKeys.publishableKey
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to get Stripe Connect URL");
      }
      
      // Only save the publishable key (safe to store)
      if (defaultDb) {
        const shopDocRef = doc(defaultDb, "shops", user.uid);
        await setDoc(shopDocRef, { 
          stripePublishableKey: stripeKeys.publishableKey,
          stripeConnected: true
        }, { merge: true });
      }
      
      window.location.href = data.url;
    } catch (error) {
      console.error('Stripe connect error:', error);
      toast({ 
        title: "Stripe Connection Failed", 
        description: "Could not connect to Stripe. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGmbConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/gmb/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: gmbKeys.clientId,
          redirectUri: gmbKeys.redirectUri
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get Google My Business auth URL');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Only save the client ID and redirect URI (safe to store)
      if (defaultDb && user) {
        const shopDocRef = doc(defaultDb, "shops", user.uid);
        await setDoc(shopDocRef, { 
          gmbClientId: gmbKeys.clientId,
          gmbRedirectUri: gmbKeys.redirectUri,
          gmbConnected: true
        }, { merge: true });
      }
      
      window.location.href = data.url;
    } catch (error) {
      console.error('GMB connect error:', error);
      toast({ 
        title: "Google Connection Failed", 
        description: "Could not connect to Google. Please ensure API credentials are set up correctly.", 
        variant: "destructive" 
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" />
      
      {/* Help Section */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">🔧 Integration Setup Guide</h3>
        <p className="text-sm text-blue-700 mb-3">
          Set up your business integrations to accept payments and manage your online presence. 
          Each integration has step-by-step instructions below.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-600">
          <div>
            <strong>💳 Stripe:</strong> Accept online payments for bookings
          </div>
          <div>
            <strong>🌐 Google My Business:</strong> Sync business information and manage reviews
          </div>
        </div>
        <div className="mt-3">
          <a 
            href="/setup-guide" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
            target="_blank"
          >
            📖 View Detailed Setup Guide
          </a>
        </div>
      </div>
      
      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shop" className="text-xs sm:text-sm">Shop Details</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm">Appearance</TabsTrigger>
          <TabsTrigger value="stripe" className="text-xs sm:text-sm">Stripe</TabsTrigger>
          <TabsTrigger value="gmb" className="text-xs sm:text-sm">Google My Business</TabsTrigger>
        </TabsList>
        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Update your barbershop's information here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input
                      id="shopName"
                      value={shopDetails.name}
                      onChange={(e) => setShopDetails({ ...shopDetails, name: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shopDetails.address}
                      onChange={(e) => setShopDetails({ ...shopDetails, address: e.target.value })}
                      disabled={isSaving}
                    />
                  </div>
                  <Button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button variant="outline" onClick={() => setTheme("light")}><Sun className="mr-2" />Light</Button>
                <Button variant="outline" onClick={() => setTheme("dark")}><Moon className="mr-2" />Dark</Button>
                <Button variant="outline" onClick={() => setTheme("system")}><Monitor className="mr-2" />System</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle>Stripe Connection</CardTitle>
              <CardDescription>Manage your Stripe integration for secure payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? <Skeleton className="h-10 w-48" /> : stripeConnected ? (
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">✅ Stripe Connected Successfully!</p>
                    <p className="text-sm text-green-700 mb-2">You can now accept online payments for bookings.</p>
                    <div className="space-y-1 text-xs text-green-600">
                      <p>• Customers can pay online when booking</p>
                      <p>• Secure payment processing</p>
                      <p>• Automatic payment collection</p>
                    </div>
                    <Button variant="link" asChild className="p-0 h-auto mt-2 text-green-800">
                      <a href={`https://dashboard.stripe.com/connect/accounts/${shopDetails.stripeAccountId}`} target="_blank" rel="noopener noreferrer">
                        Go to Stripe Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">🚀 Set Up Stripe Payments</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>Step 1:</strong> Get your Stripe API keys from your Stripe dashboard</p>
                      <p><strong>Step 2:</strong> Enter your keys below</p>
                      <p><strong>Step 3:</strong> Click "Connect with Stripe"</p>
                      <p><strong>Step 4:</strong> Start accepting online payments!</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">💳 What You'll Get</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Secure credit card processing</li>
                      <li>• Automatic payment collection</li>
                      <li>• Professional checkout experience</li>
                      <li>• 24/7 payment acceptance</li>
                    </ul>
                  </div>
                  
                  <div>
                    <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                    <Input
                      id="stripePublishableKey"
                      placeholder="pk_live_... or pk_test_..."
                      value={stripeKeys.publishableKey}
                      onChange={(e) => setStripeKeys({...stripeKeys, publishableKey: e.target.value})}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in your Stripe Dashboard → Developers → API keys
                    </p>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your Stripe API keys to start accepting online payments. 
                    You can get these from your <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-blue-600 hover:underline">Stripe Dashboard</a>.
                  </p>
                  
                  <Button onClick={handleStripeConnect} disabled={isConnecting || isLoading || !stripeKeys.publishableKey} className="w-full">
                    {isConnecting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : "Connect with Stripe"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gmb">
          <Card>
            <CardHeader>
              <CardTitle>Google My Business</CardTitle>
              <CardDescription>Sync your business info and manage reviews.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gmbConnected ? (
                <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="max-w-full break-words text-green-800">
                    <p className="font-semibold">✅ Google My Business Connected Successfully!</p>
                    <p className="text-sm mb-2">Your business information can now be synced automatically.</p>
                    <div className="space-y-1 text-xs text-green-600">
                      <p>• Business info automatically updated</p>
                      <p>• Review management enabled</p>
                      <p>• Hours and location sync</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">🌐 Set Up Google My Business</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>Step 1:</strong> Get your Google API credentials from Google Cloud Console</p>
                      <p><strong>Step 2:</strong> Enter your credentials below</p>
                      <p><strong>Step 3:</strong> Click "Connect with Google"</p>
                      <p><strong>Step 4:</strong> Sync your business information!</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">📱 What You'll Get</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Automatic business info sync</li>
                      <li>• Review management</li>
                      <li>• Business hours updates</li>
                      <li>• Location and contact sync</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gmbClientId">Google Client ID</Label>
                      <Input
                        id="gmbClientId"
                        placeholder="your_client_id.apps.googleusercontent.com"
                        value={gmbKeys.clientId}
                        onChange={(e) => setGmbKeys({...gmbKeys, clientId: e.target.value})}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Find this in Google Cloud Console → APIs & Services → Credentials
                      </p>
                    </div>
                    

                    
                    <div>
                      <Label htmlFor="gmbRedirectUri">Redirect URI</Label>
                      <Input
                        id="gmbRedirectUri"
                        placeholder="https://yourdomain.com/api/gmb/callback"
                        value={gmbKeys.redirectUri}
                        onChange={(e) => setGmbKeys({...gmbKeys, redirectUri: e.target.value})}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Set this in your Google Cloud Console OAuth 2.0 settings
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter your Google API credentials to sync your business information. 
                    You can get these from <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a>.
                  </p>
                  
                  <Button onClick={handleGmbConnect} disabled={isConnecting || isLoading || !gmbKeys.clientId || !gmbKeys.redirectUri} className="w-full">
                    {isConnecting ? "Connecting..." : "Connect with Google"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-full justify-center items-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}