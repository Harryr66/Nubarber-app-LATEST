
"use client";

import { useState, useEffect, useRef } from 'react';
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { Copy, Eye, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadLogoFile } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PublicSitePage() {
  const { user, db: defaultDb } = useAuth(); // 'shops' is in the default db
  const { toast } = useToast();
  const [siteSettings, setSiteSettings] = useState({
    headline: "Book your next appointment with us",
    description: "Easy and fast booking, available 24/7."
  });
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");
  const [origin, setOrigin] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Ensure window is defined (runs only on client)
    if (typeof window !== 'undefined') {
        setOrigin(window.location.origin);
    }

    const fetchSiteSettings = async () => {
      if (!user || !defaultDb) {
          setIsLoading(false);
          return;
      };

      setIsLoading(true);
      setPublicUrl(`/barbers/${user.uid}`);
      try {
        const shopDocRef = doc(defaultDb, "shops", user.uid);
        const shopDoc = await getDoc(shopDocRef);
        if (shopDoc.exists()) {
          const data = shopDoc.data();
          setSiteSettings({
            headline: data.headline || "Book your next appointment with us",
            description: data.description || "Easy and fast booking, available 24/7."
          });
          setLogoUrl(data.logoUrl || "");
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
        toast({ title: "Error", description: "Could not load site settings.", variant: "destructive" });
      }
      setIsLoading(false);
    };

    if (user) {
      fetchSiteSettings();
    } else {
        setIsLoading(false);
    }
  }, [user, defaultDb, toast]);

  const handleLogoUpload = async (file: File) => {
    if (!user || !defaultDb) {
      toast({ title: "Error", description: "You must be logged in to upload a logo.", variant: "destructive" });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    
    // Validate file size (max 2MB for better performance)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Please select an image smaller than 2MB for faster upload.", variant: "destructive" });
      return;
    }
    
    // Add a simple fallback for very small files (skip optimization)
    const shouldSkipOptimization = file.size < 100 * 1024; // Skip optimization for files under 100KB
    
    setIsUploading(true);
    let retryCount = 0;
    const maxRetries = 2;
    
        // Add overall timeout protection
    const uploadTimeout = setTimeout(() => {
      setIsUploading(false);
      toast({ 
        title: "Upload Timeout", 
        description: "Upload took too long. Please try again with a smaller image.", 
        variant: "destructive" 
      });
    }, 30000); // 30 second timeout
    
    try {
      while (retryCount <= maxRetries) {
        try {
          let fileToUpload = file;
          
          // Try to optimize image, but fallback to original if it fails
          if (shouldSkipOptimization) {
            console.log('Skipping optimization for small file');
            fileToUpload = file;
          } else {
            try {
              fileToUpload = await optimizeImage(file);
              console.log('Image optimization successful');
            } catch (optimizeError) {
              console.warn('Image optimization failed, using original file:', optimizeError);
              fileToUpload = file;
            }
          }
          
          // Generate unique filename with timestamp
          const timestamp = Date.now();
          const fileExtension = file.name.split('.').pop();
          const fileName = `logo_${timestamp}.${fileExtension}`;
          const path = `logos/${user.uid}/${fileName}`;
          
          console.log('Starting upload to path:', path);
          
          // Upload with progress tracking
          const downloadURL = await uploadLogoFile(fileToUpload, path);
          
          console.log('Upload successful, download URL:', downloadURL);
          
          // Clean up old logo file if it exists
          if (logoUrl && logoUrl !== downloadURL) {
            try {
              await deleteOldLogo(logoUrl);
            } catch (error) {
              console.warn('Could not delete old logo:', error);
              // Continue even if cleanup fails
            }
          }
          
          setLogoUrl(downloadURL);
          
          // Save to Firestore
          const shopDocRef = doc(defaultDb, "shops", user.uid);
          await setDoc(shopDocRef, { logoUrl: downloadURL }, { merge: true });
          
          toast({
            title: "Success!",
            description: "Logo uploaded successfully.",
          });
          
          clearTimeout(uploadTimeout);
          setIsUploading(false);
          return; // Success, exit function
          
        } catch (error) {
          retryCount++;
          console.error(`Error uploading logo (attempt ${retryCount}):`, error);
          
          if (retryCount > maxRetries) {
            toast({ 
              title: "Upload Failed", 
              description: "Could not upload logo after multiple attempts. Please try again.", 
              variant: "destructive" 
            });
            break;
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast({ 
        title: "Upload Error", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      clearTimeout(uploadTimeout);
      setIsUploading(false);
    }
  };

  // Delete old logo file from storage
  const deleteOldLogo = async (oldLogoUrl: string) => {
    if (!user) return;
    
    try {
      const { getFirebaseStorage } = await import('@/lib/firebase');
      const storage = getFirebaseStorage();
      const { ref, deleteObject } = await import('firebase/storage');
      
      // Extract the path from the URL
      const urlParts = oldLogoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const path = `logos/${user.uid}/${fileName}`;
      
      const oldLogoRef = ref(storage, path);
      await deleteObject(oldLogoRef);
    } catch (error) {
      console.error('Error deleting old logo:', error);
      throw error;
    }
  };

  // Image optimization function with proper error handling
  const optimizeImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Add timeout protection
      const timeout = setTimeout(() => {
        reject(new Error('Image optimization timeout'));
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        try {
          clearTimeout(timeout);
          
          // Calculate optimal dimensions (max 500x500 for logos)
          const maxSize = 500;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const optimizedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(optimizedFile);
              } else {
                console.warn('Canvas toBlob failed, using original file');
                resolve(file); // Fallback to original if optimization fails
              }
            }, 'image/jpeg', 0.8); // 80% quality for good balance
          } else {
            console.warn('Canvas context not available, using original file');
            resolve(file);
          }
        } catch (error) {
          console.error('Error during image optimization:', error);
          resolve(file); // Fallback to original file
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.warn('Image failed to load, using original file');
        resolve(file); // Fallback to original if image loading fails
      };
      
      // Set crossOrigin to avoid CORS issues
      img.crossOrigin = 'anonymous';
      img.src = URL.createObjectURL(file);
    });
  };



  const handleSave = async () => {
    if (!user || !defaultDb) {
      toast({ title: "Not Authenticated", description: "You must be logged in to save settings.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const shopDocRef = doc(defaultDb, "shops", user.uid);
      await setDoc(shopDocRef, { 
        headline: siteSettings.headline,
        description: siteSettings.description,
        logoUrl: logoUrl,
      }, { merge: true });

      toast({
        title: "Success!",
        description: "Your public site has been updated.",
      });
    } catch (error) {
       console.error("Error saving site settings:", error);
       toast({ title: "Error", description: "Could not save your settings.", variant: "destructive" });
    }
    setIsSaving(false);
  };

  return (
    <div>
      <PageHeader title="Public Site" actionButton={<Button onClick={handleSave} disabled={isSaving || isLoading}>{isSaving ? "Saving..." : "Save Changes"}</Button>} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Booking Page</CardTitle>
              <CardDescription>
                This is what your clients will see when they visit your booking page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Logo Upload Section */}
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <Label className="text-base font-semibold">Shop Logo</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-2 border-border">
                        <AvatarImage src={logoUrl} alt="Shop logo" />
                        <AvatarFallback className="text-lg font-semibold">
                          {siteSettings.headline?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {logoUrl ? "Change Logo" : "Upload Logo"}
                              </>
                            )}
                          </Button>
                          {logoUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoUrl("");
                                if (defaultDb && user) {
                                  const shopDocRef = doc(defaultDb, "shops", user.uid);
                                  setDoc(shopDocRef, { logoUrl: "" }, { merge: true });
                                }
                              }}
                              disabled={isUploading}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload your shop logo (max 2MB). This will be displayed prominently on your public booking page.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended: Square image, 500x500 pixels or smaller for best performance.
                        </p>
                        {isUploading && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Processing image and uploading...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              This may take a few moments for larger images...
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleLogoUpload(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input 
                      id="headline" 
                      value={siteSettings.headline}
                      onChange={(e) => setSiteSettings({...siteSettings, headline: e.target.value})}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      value={siteSettings.description}
                      onChange={(e) => setSiteSettings({...siteSettings, description: e.target.value})}
                      disabled={isSaving}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
           <Card>
            <CardHeader>
              <CardTitle>Your Booking URL</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-2">Share this link with your clients:</p>
                  <div className="flex items-center space-x-2">
                    <Input readOnly value={`${origin}${publicUrl}`} />
                    <Button variant="secondary" onClick={() => {
                      navigator.clipboard.writeText(`${origin}${publicUrl}`);
                      toast({title: "Copied to clipboard"});
                    }}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button asChild className="w-full mt-4">
                      <Link href={publicUrl} target="_blank">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Website
                      </Link>
                    </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
