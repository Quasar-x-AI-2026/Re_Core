import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, TrendingUp, GraduationCap, Download } from 'lucide-react';
import { UNIVERSITY_DATA, PREFERENCE_CRITERIA } from '@/data/universityData';
import { generatePreferenceList } from '@/engine/preferenceEngine';
import { exportPreferencesCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

const BRANCHES = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Electronics',
  'Civil Engineering',
  'Chemical Engineering',
  'Information Technology'
];

const INSTITUTE_TYPES = ['IIT', 'NIT', 'IIIT', 'Private', 'State University'];

export const UniversitySearchPage = ({ user }) => {
  const navigate = useNavigate();
  const [weights, setWeights] = useState({
    ranking: 7,
    placementRate: 8,
    averagePackage: 6,
    researchOutput: 5,
    facultyRatio: 4,
    infrastructure: 5,
    homeState: 3,
    instituteType: 6
  });
  const [branchPreferences, setBranchPreferences] = useState([
    'Computer Science',
    'Information Technology',
    'Electrical Engineering'
  ]);
  const [instituteTypeOrder, setInstituteTypeOrder] = useState([
    'IIT',
    'NIT',
    'IIIT',
    'Private',
    'State University'
  ]);
  const [preferenceList, setPreferenceList] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateList = async () => {
    let result;
    try {
      result = generatePreferenceList(
        UNIVERSITY_DATA,
        weights,
        branchPreferences,
        instituteTypeOrder,
        user.homeState,
        user.category?.toLowerCase() || 'general'
      );

      setPreferenceList(result.preferenceList);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating list locally:', error);
      toast.error('Failed to generate list');
      return;
    }

    // 2. Save to Backend
    try {
      const userIdStr = String(user.id);

      // Save Preferences
      const prefResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/university/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdStr,
          weights,
          branchPreferences,
          instituteTypeOrder
        })
      });

      if (!prefResponse.ok) {
        throw new Error(`Failed to save preferences: ${prefResponse.statusText}`);
      }

      // Save Generated List
      const listResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/university/preferences/${userIdStr}/list`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.preferenceList)
        }
      );

      if (!listResponse.ok) {
        throw new Error(`Failed to save list: ${listResponse.statusText}`);
      }

      toast.success('Preference list generated and saved!');
    } catch (saveError) {
      console.error('Error saving to backend:', saveError);
      toast.warning('List generated, but failed to save to profile');
    }
  };

  const handleBranchToggle = (branch) => {
    if (branchPreferences.includes(branch)) {
      setBranchPreferences(branchPreferences.filter(b => b !== branch));
    } else {
      setBranchPreferences([...branchPreferences, branch]);
    }
  };

  const moveBranchUp = (index) => {
    if (index === 0) return;
    const newPrefs = [...branchPreferences];
    [newPrefs[index - 1], newPrefs[index]] = [newPrefs[index], newPrefs[index - 1]];
    setBranchPreferences(newPrefs);
  };

  const moveBranchDown = (index) => {
    if (index === branchPreferences.length - 1) return;
    const newPrefs = [...branchPreferences];
    [newPrefs[index], newPrefs[index + 1]] = [newPrefs[index + 1], newPrefs[index]];
    setBranchPreferences(newPrefs);
  };

  if (showResults) {
    return (
      <div
        data-testid="university-results-page"
        className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8"
      >
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowResults(false)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Modify Preferences
          </Button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Counseling Preference List
              </h1>
              <p className="text-gray-600">
                Ranked based on your criteria weights and preferences
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => exportPreferencesCSV(preferenceList)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="space-y-4">
            {preferenceList.map((option, idx) => (
              <Card
                key={idx}
                data-testid={`preference-${idx}`}
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg">
                        {option.rank}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {option.universityName}
                        </h3>
                        <p className="text-lg text-gray-700 mb-2">{option.branch}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Badge variant="secondary">{option.instituteType}</Badge>
                          <span>{option.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {option.totalScore}
                      </div>
                      <Badge variant={
                        option.estimatedAdmissionChance === 'High' ? 'default' :
                          option.estimatedAdmissionChance === 'Moderate' ? 'secondary' : 'outline'
                      }>
                        {option.estimatedAdmissionChance} Chance
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{option.explanation}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
                    {Object.entries(option.scoreBreakdown).map(([key, data]) => {
                      if (key === 'branchPreference') return null;
                      const label = PREFERENCE_CRITERIA.find(c => c.id === key)?.label || key;
                      return (
                        <div key={key} className="text-sm">
                          <p className="text-gray-500">{label}</p>
                          <p className="font-semibold text-gray-900">
                            {data.rawScore?.toFixed(0) || 0}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This list is generated based on your criteria weights and preferences.
                Cutoff ranks are estimates. Always verify current admission criteria on official websites.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="university-search-page"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">University Search</h1>
          <p className="text-gray-600">
            Set your preference weights to generate a counseling-ready list
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Criteria Weights */}
          <Card className="shadow-lg" data-testid="criteria-weights-card">
            <CardHeader>
              <CardTitle>Criteria Weights</CardTitle>
              <CardDescription>
                Adjust sliders to prioritize what matters most to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {PREFERENCE_CRITERIA.map(criterion => (
                <div key={criterion.id}>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">{criterion.label}</Label>
                    <span className="text-sm font-bold text-blue-600">
                      {weights[criterion.id]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{criterion.description}</p>
                  <Slider
                    data-testid={`weight-${criterion.id}`}
                    value={[weights[criterion.id]]}
                    onValueChange={(val) => setWeights({ ...weights, [criterion.id]: val[0] })}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branch & Institute Preferences */}
          <div className="space-y-6">
            <Card className="shadow-lg" data-testid="branch-preferences-card">
              <CardHeader>
                <CardTitle>Branch Preferences</CardTitle>
                <CardDescription>Select and order your preferred branches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {branchPreferences.map((branch, idx) => (
                    <div
                      key={branch}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Badge>{idx + 1}</Badge>
                        <span className="font-medium">{branch}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveBranchUp(idx)}
                          disabled={idx === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveBranchDown(idx)}
                          disabled={idx === branchPreferences.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBranchToggle(branch)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Add more branches:</p>
                  <div className="flex flex-wrap gap-2">
                    {BRANCHES.filter(b => !branchPreferences.includes(b)).map(branch => (
                      <Button
                        key={branch}
                        size="sm"
                        variant="outline"
                        onClick={() => handleBranchToggle(branch)}
                      >
                        + {branch}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg" data-testid="institute-type-card">
              <CardHeader>
                <CardTitle>Institute Type Priority</CardTitle>
                <CardDescription>Drag to reorder (highest priority first)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {instituteTypeOrder.map((type, idx) => (
                    <div
                      key={type}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Badge variant="secondary">{idx + 1}</Badge>
                      <span className="font-medium flex-1">{type}</span>
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6 shadow-lg">
          <CardContent className="pt-6">
            <Button
              data-testid="generate-list-btn"
              onClick={handleGenerateList}
              size="lg"
              className="w-full"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Generate Preference List
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UniversitySearchPage;

