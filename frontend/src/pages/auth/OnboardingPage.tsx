import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

const GENERIC_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'protonmail.com'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [status, setStatus] = useState<'checking' | 'creating_org' | 'joining_org' | 'done' | 'error'>('checking');
  const [message, setMessage] = useState('Setting up your account...');
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Redirect if user already has an org
  useEffect(() => {
    if (!loading && profile?.org_id) {
      navigate('/', { replace: true });
    }
  }, [loading, profile?.org_id, navigate]);

  const processOnboarding = useCallback(async () => {
    if (!user?.email || processed) return;
    setProcessed(true);

    try {
      const domain = user.email.split('@')[1];
      const isGenericDomain = GENERIC_DOMAINS.includes(domain);

      // Check if an organization with this domain already exists
      let matchingOrg: { id: string; name: string } | null = null;
      if (!isGenericDomain) {
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id, name')
          .eq('domain', domain)
          .limit(1);
        if (orgs && orgs.length > 0) {
          matchingOrg = orgs[0];
        }
      }

      if (matchingOrg) {
        // Domain exists → auto-join as employee
        setStatus('joining_org');
        setMessage(`Joining ${matchingOrg.name}...`);

        // Create profile linked to existing org
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            org_id: matchingOrg.id,
            full_name: fullName,
            email: user.email,
          });
        if (profileError && !profileError.message.includes('duplicate')) throw profileError;

        // Assign employee role (default with view-only)
        const { data: employeeRole } = await supabase
          .from('roles' as any)
          .select('id')
          .eq('org_id', matchingOrg.id)
          .eq('slug', 'employee')
          .maybeSingle();

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            org_id: matchingOrg.id,
            role: 'employee' as any,
            role_id: (employeeRole as any)?.id || null,
          });
        if (roleError && !roleError.message.includes('duplicate')) throw roleError;

        // Create admin notification about new user
        await supabase
          .from('admin_notifications')
          .insert({
            org_id: matchingOrg.id,
            type: 'new_user_joined',
            title: 'New User Joined',
            message: `${fullName} (${user.email}) has joined your organization with default employee permissions. Please review and assign appropriate roles.`,
            metadata: { user_id: user.id, email: user.email, full_name: fullName },
            created_by: user.id,
          });

        // Send admin email notification via edge function
        try {
          await supabase.functions.invoke('notify-admin-email', {
            body: {
              org_id: matchingOrg.id,
              new_user_name: fullName,
              new_user_email: user.email,
              notification_type: 'new_user_joined',
            },
          });
        } catch (emailErr) {
          console.warn('Admin email notification failed (non-critical):', emailErr);
        }

        setStatus('done');
        setMessage(`Welcome to ${matchingOrg.name}! You've been added with employee access.`);
      } else {
        // Domain doesn't exist → auto-create organization
        setStatus('creating_org');
        const orgName = isGenericDomain
          ? `${fullName}'s Organization`
          : domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
        setMessage(`Creating organization "${orgName}"...`);

        // Create organization
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName,
            domain: isGenericDomain ? null : domain,
          })
          .select()
          .single();
        if (orgError) throw orgError;

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            org_id: org.id,
            full_name: fullName,
            email: user.email,
          });
        if (profileError) throw profileError;

        // Look up admin role
        const { data: adminRole } = await supabase
          .from('roles' as any)
          .select('id')
          .eq('org_id', org.id)
          .eq('slug', 'admin')
          .maybeSingle();

        // Assign admin role to creator
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            org_id: org.id,
            role: 'admin' as any,
            role_id: (adminRole as any)?.id || null,
          });
        if (roleError) throw roleError;

        setStatus('done');
        setMessage(`Organization "${orgName}" created! You're the admin.`);
      }

      // Refresh profile and redirect
      await refreshProfile();
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      console.error('Onboarding error:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to set up your account');
    }
  }, [user, processed, fullName, refreshProfile, navigate]);

  // Auto-process when user is available
  useEffect(() => {
    if (!loading && user && !profile?.org_id && !processed) {
      processOnboarding();
    }
  }, [loading, user, profile?.org_id, processed, processOnboarding]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            {status === 'done' ? (
              <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
            ) : status === 'error' ? (
              <AlertCircle className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Building2 className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'done' ? 'All Set!' : status === 'error' ? 'Setup Error' : `Welcome, ${fullName}!`}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {error && (
            <Alert variant="destructive" className="mb-4 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status !== 'done' && status !== 'error' && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {status === 'done' && (
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          )}

          {status === 'error' && (
            <button
              onClick={() => { setProcessed(false); setError(null); setStatus('checking'); }}
              className="mt-4 text-sm text-primary underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
