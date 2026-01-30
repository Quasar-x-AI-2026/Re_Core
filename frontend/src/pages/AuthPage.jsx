import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const AuthPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
  if (!email || !name) {
    toast.error('Please fill all fields');
    return;
  }

  setLoading(true);

  // 🔹 LOCAL DEV BYPASS (no backend auth)
  const userData = {
    id: 1,
    name,
    email,
    role: "local-user"
  };

  toast.success(`Welcome, ${name}!`);
  setUser(userData);
  setLoading(false);
};


  return (
    <div 
      data-testid="auth-page"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            RECORE
          </CardTitle>
          <CardDescription className="text-base mt-4">
            Trajectory Inference Engine for Adaptive Learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                data-testid="name-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              data-testid="auth-submit-btn"
              onClick={handleAuth}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
          <p className="text-xs text-center mt-6 text-gray-500">
            No passwords. No tests. Just behavioral intelligence.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
