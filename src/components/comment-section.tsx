'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDistanceToNow } from 'date-fns';

import type { Comment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { addComment } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';

const commentSchema = z.object({
  teksto: z.string().min(1, 'Comment cannot be empty.'),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  recipeId: string;
  comments: Comment[];
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('');
}

export function CommentSection({ recipeId, comments: initialComments }: CommentSectionProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormValues) => {
    if (!user || !userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to comment.' });
      return;
    }
    setIsLoading(true);
    const result = await addComment(recipeId, user.uid, userProfile.pangalan, data.teksto);
    if (result.success) {
      toast({ title: 'Success!', description: 'Comment posted.' });
      form.reset();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  };
  
  const sortedComments = [...initialComments].sort((a, b) => b.petsaGawa.toMillis() - a.petsaGawa.toMillis());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mga Komento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {user && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
              {...form.register('teksto')}
              placeholder="Mag-iwan ng komento, tanong, o tip..."
              rows={3}
            />
            {form.formState.errors.teksto && <p className="text-sm text-destructive">{form.formState.errors.teksto.message}</p>}
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                I-post ang Komento
            </Button>
          </form>
        )}
        <Separator />
        <div className="space-y-6">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>{getInitials(comment.userPangalan)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{comment.userPangalan}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.petsaGawa.toDate(), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-foreground">{comment.teksto}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Wala pang komento. Maging una!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
