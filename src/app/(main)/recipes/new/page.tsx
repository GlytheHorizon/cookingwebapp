'use client';

import { useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/recipe-form';
import { useAuth } from '@/hooks/use-auth';
import { USER_ROLES } from '@/lib/constants';

export default function NewRecipePage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Loading...</div>;
  }

  if (!userProfile) {
    router.replace('/auth');
    return null;
  }
  
  if (userProfile.role !== USER_ROLES.MAMA) {
     router.replace('/');
     return <div className="container mx-auto p-8 text-center">Access Denied. Redirecting...</div>;
  }

  return <RecipeForm />;
}
