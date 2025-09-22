'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ChromeIcon } from 'lucide-react';

import { auth, db } from '@/lib/firebase';
import { COLLECTIONS, USER_ROLES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { LutongBahayLogo } from '@/components/icons';
import type { UserRole } from '@/lib/types';

const signUpSchema = z.object({
  name: z.string().min(2, 'Pangalan ay kailangan'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['mama', 'bagitong_kusinero'], {
    required_error: 'Pumili ng role',
  }),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignUpValues = z.infer<typeof signUpSchema>;
type SignInValues = z.infer<typeof signInSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const signUpForm = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });
  const signInForm = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  const handleSignUp = async (values: SignUpValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        pangalan: values.name,
        email: values.email,
        role: values.role,
        petsaGawa: serverTimestamp(),
      });
      toast({ title: 'Success!', description: 'Account created successfully.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: SignInValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Success!', description: 'Logged in successfully.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async (role?: UserRole) => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // For Google Sign-In, we need to ensure the role is set.
      // If a user signs in via Google on the Sign Up tab, they will have selected a role.
      // If on Sign In tab, we can't know their role if they are new.
      // A better UX would be to redirect new Google users to a role selection page.
      // For now, we will default to 'bagitong_kusinero' if they are new and no role is passed.
      const selectedRole = role || USER_ROLES.NEWBIE;

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        pangalan: user.displayName,
        email: user.email,
        role: selectedRole,
      }, { merge: true }); // Merge to not overwrite role if they already exist

      toast({ title: "Success!", description: "Logged in with Google." });
      router.push('/');

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8">
        <LutongBahayLogo />
      </div>
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Mag-login</TabsTrigger>
          <TabsTrigger value="signup">Gumawa ng Account</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Mag-login</CardTitle>
              <CardDescription>Ilagay ang iyong account details para makapasok.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" type="email" {...signInForm.register('email')} />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" type="password" {...signInForm.register('password')} />
                   {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Naglologin...' : 'Mag-login'}
                </Button>
              </form>
               <Button variant="outline" className="mt-4 w-full" onClick={() => handleGoogleSignIn()} disabled={isLoading}>
                  <ChromeIcon className="mr-2 h-4 w-4" />
                  Mag-login gamit ang Google
               </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Gumawa ng Account</CardTitle>
              <CardDescription>Punan ang form para makapagsimula.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Pangalan</Label>
                  <Input id="signup-name" {...signUpForm.register('name')} />
                   {signUpForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" {...signUpForm.register('email')} />
                   {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" {...signUpForm.register('password')} />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                    <Label>Ano ang role mo?</Label>
                    <RadioGroup
                        onValueChange={(value) => signUpForm.setValue('role', value as 'mama' | 'bagitong_kusinero')}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.MAMA} id="role-mama" />
                            <Label htmlFor="role-mama">Mama (Gagawa ng Recipe)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value={USER_ROLES.NEWBIE} id="role-newbie" />
                            <Label htmlFor="role-newbie">Bagitong Kusinero</Label>
                        </div>
                    </RadioGroup>
                    {signUpForm.formState.errors.role && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.role.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Gumagawa...' : 'Gumawa ng Account'}
                </Button>
              </form>
               <Button variant="outline" className="mt-4 w-full" onClick={() => handleGoogleSignIn(signUpForm.getValues('role'))} disabled={isLoading}>
                  <ChromeIcon className="mr-2 h-4 w-4" />
                  Mag-sign up gamit ang Google
               </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
