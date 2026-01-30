import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const GRADES = [
  '8', '9', '10', '11', '12', 'College 1st Year', 'College 2nd Year',
  'College 3rd Year', 'College 4th Year'
];

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export const OnboardingPage = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    homeState: '',
    grade: '',
    board: 'CBSE',
    category: 'General'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!formData.homeState || !formData.grade) {
    toast.error('Please complete all required fields');
    return;
  }

  setLoading(true);

  // 🔹 LOCAL DEV MODE (no backend yet)
  const userData = {
    ...user,
    ...formData
  };

  console.log("Profile saved locally:", userData);
  toast.success("Profile saved");

  setLoading(false);
  navigate('/questionnaire', { state: { user: userData } });
};


  return (
    <div 
      data-testid="onboarding-page"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Complete Your Profile</CardTitle>
          <p className="text-gray-600 mt-2">
            This helps us understand your context, not judge you.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="homeState">Home State *</Label>
              <Select value={formData.homeState} onValueChange={(val) => setFormData(prev => ({ ...prev, homeState: val }))}>
                <SelectTrigger data-testid="home-state-select">
                  <SelectValue placeholder="Select your home state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">Grade / Year *</Label>
              <Select value={formData.grade} onValueChange={(val) => setFormData(prev => ({ ...prev, grade: val }))}>
                <SelectTrigger data-testid="grade-select">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="board">Board</Label>
              <Select value={formData.board} onValueChange={(val) => setFormData(prev => ({ ...prev, board: val }))}>
                <SelectTrigger data-testid="board-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map(board => (
                    <SelectItem key={board} value={board}>{board}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                <SelectTrigger data-testid="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-testid="onboarding-submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Saving...' : 'Continue to Questions'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
