'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clapperboard } from "lucide-react";
import { useAuth } from "@/firebase";
import { initiateGoogleSignIn } from "@/firebase/non-blocking-login";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/firebase/auth/use-user";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = () => {
    initiateGoogleSignIn(auth);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
             <Clapperboard className="h-10 w-10 text-accent" />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to CineView</CardTitle>
          <CardDescription>Sign in to access your watchlist and recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
