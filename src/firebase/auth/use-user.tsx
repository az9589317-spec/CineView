'use client';

import { useEffect } from 'react';
import { useFirebase, useUser as useFirebaseUser } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '../non-blocking-updates';

export function useUser() {
  const { user, isUserLoading, userError } = useFirebaseUser();
  const { firestore } = useFirebase();

  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      
      const userData = {
        id: user.uid,
        googleId: user.providerData.find(p => p.providerId === 'google.com')?.uid || user.uid,
        username: user.displayName,
        email: user.email,
        joinDate: user.metadata.creationTime || new Date().toISOString(),
      };
      
      setDocumentNonBlocking(userRef, userData, { merge: true });
    }
  }, [user, firestore]);

  return { user, isUserLoading, userError };
}
