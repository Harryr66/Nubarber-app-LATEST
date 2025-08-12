import { NextRequest, NextResponse } from 'next/server';
import { getFirebase } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface ShopUpdate {
  shopId: string;
  subdomain: string;
  currentData: any;
}

export async function POST(request: NextRequest) {
  try {
    const { defaultDb } = getFirebase();
    
    if (!defaultDb) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Get all shops
    const shopsRef = collection(defaultDb, "shops");
    const shopsSnapshot = await getDocs(shopsRef);
    
    const updates: ShopUpdate[] = [];
    
    shopsSnapshot.forEach(shopDoc => {
      const shopData = shopDoc.data();
      
      // If shop doesn't have a subdomain, generate one
      if (!shopData.subdomain && shopData.name) {
        const subdomain = shopData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '') // Remove special characters
          .substring(0, 20); // Limit length
        
        updates.push({
          shopId: shopDoc.id,
          subdomain: subdomain,
          currentData: shopData
        });
      }
    });
    
    // Update shops with missing subdomains
    for (const update of updates) {
      const shopDocRef = doc(defaultDb, "shops", update.shopId);
      await updateDoc(shopDocRef, { subdomain: update.subdomain });
    }
    
    return NextResponse.json({ 
      message: `Updated ${updates.length} shops with subdomains`,
      updates: updates 
    });
    
  } catch (error) {
    console.error('Error updating shop subdomains:', error);
    return NextResponse.json({ error: 'Failed to update shop subdomains' }, { status: 500 });
  }
} 