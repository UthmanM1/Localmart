// lib/geo.ts
// Location-based listing queries using Firestore + geohash

import {
  collection, query, where, getDocs, orderBy, limit,
} from 'firebase/firestore';
import { geohashQueryBounds, distanceBetween } from 'geofire-common';
import { db } from './firebase';

export interface GeoListing {
  id: string;
  title: string;
  price: number;
  category: string;
  photos: string[];
  lat: number;
  lng: number;
  distanceMiles: number;
  sellerId: string;
  status: 'active' | 'sold';
  createdAt: Date;
}

/**
 * Fetch listings within a given radius of the user's coordinates.
 * Uses Firestore geohash range queries for efficient spatial search.
 *
 * @param lat - User's latitude
 * @param lng - User's longitude
 * @param radiusMiles - Search radius in miles
 * @param category - Optional category filter
 */
export async function getListingsNearby(
  lat: number,
  lng: number,
  radiusMiles: number,
  category?: string
): Promise<GeoListing[]> {
  const radiusKm = radiusMiles * 1.60934;
  const center: [number, number] = [lat, lng];

  // Get geohash bounds for the radius
  const bounds = geohashQueryBounds(center, radiusKm * 1000); // metres

  const promises = bounds.map(b => {
    let q = query(
      collection(db, 'listings'),
      where('status', '==', 'active'),
      where('geohash', '>=', b[0]),
      where('geohash', '<=', b[1]),
      orderBy('geohash'),
      limit(50)
    );
    return getDocs(q);
  });

  const snapshots = await Promise.all(promises);
  const results: GeoListing[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      const data = doc.data();

      // Filter by category if provided
      if (category && category !== 'All' && data.category !== category) continue;

      // Calculate exact distance and filter
      const distKm = distanceBetween([data.lat, data.lng], center);
      const distMiles = distKm / 1.60934;

      if (distMiles <= radiusMiles) {
        results.push({
          id: doc.id,
          ...data,
          distanceMiles: Math.round(distMiles * 10) / 10,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        } as GeoListing);
      }
    }
  }

  // Sort by distance
  return results.sort((a, b) => a.distanceMiles - b.distanceMiles);
}
