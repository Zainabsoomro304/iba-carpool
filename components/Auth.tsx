import React, { useState } from 'react';
import { User, PageView } from '../types';
import * as DB from '../services/db';
import { UserPlus, LogIn, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

// --- LOGIN ---
interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: PageView) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await DB.findUserByEmail(email);
      if (user && user.password === password) {
        onLoginSuccess(user);
      } else {
        setError('Incorrect email or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => onNavigate('forgot-password')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : <><LogIn className="mr-2 h-4 w-4" /> Sign In</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- SIGNUP ---

export const Signup: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [formData, setFormData] = useState({
    erp_id: '',
    email: '',
    password: '',
    name: '',
    gender: 'Male',
    graduating_year: new Date().getFullYear(),
    contact_number: '',
    sec_question_1: "What is your mother's maiden name?",
    sec_answer_1: '',
    sec_question_2: "What was the name of your first pet?",
    sec_answer_2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What is the name of the city you were born in?",
    "What is your favorite food?",
    "What is the name of your high school?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.erp_id || !formData.email || !formData.password || !formData.sec_answer_1 || !formData.sec_answer_2) {
        setError("Please fill all fields");
        return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await DB.createUser({
        ...formData,
        role: 'student',
        graduating_year: Number(formData.graduating_year)
      });
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-slate-800 text-center mb-8">Create Account</h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Col 1 */}
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input name="name" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">ERP ID</label>
              <input name="erp_id" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input name="password" type="password" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700">Contact Number</label>
              <input name="contact_number" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          {/* Col 2 */}
          <div className="space-y-4">
             <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <select name="gender" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border rounded-md">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Graduating Year</label>
              <input name="graduating_year" type="number" value={formData.graduating_year} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            
            <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Security Questions</p>
                <div>
                <label className="block text-xs text-slate-600 mb-1">Question 1</label>
                <select name="sec_question_1" onChange={handleChange} className="block w-full text-sm border rounded-md p-1.5 mb-2">
                    {securityQuestions.slice(0, 3).map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input name="sec_answer_1" placeholder="Answer" onChange={handleChange} required className="block w-full px-3 py-2 border rounded-md text-sm" />
                </div>
                <div className="mt-2">
                <label className="block text-xs text-slate-600 mb-1">Question 2</label>
                <select name="sec_question_2" onChange={handleChange} className="block w-full text-sm border rounded-md p-1.5 mb-2">
                     {securityQuestions.slice(3).map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input name="sec_answer_2" placeholder="Answer" onChange={handleChange} required className="block w-full px-3 py-2 border rounded-md text-sm" />
                </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-50">
              {loading ? 'Creating Account...' : <><UserPlus className="mr-2 h-5 w-5" /> Sign Up</>}
            </button>
             <p className="mt-4 text-center text-sm text-slate-500">
                Already have an account? <button type="button" onClick={() => onNavigate('login')} className="font-medium text-blue-600">Log in</button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- FORGOT PASSWORD ---

export const ForgotPassword: React.FC<{ onNavigate: (page: PageView) => void }> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [erpId, setErpId] = useState('');
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [answers, setAnswers] = useState({ ans1: '', ans2: '' });
  const [newPassword, setNewPassword] = useState({ pass: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Find User
  const handleFindUser = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await DB.findUserByERP(erpId);
      if (user) {
        setFoundUser(user);
        setStep(2);
      } else {
        setError('No user found with this ERP ID.');
      }
    } catch (e) { setError('Error occurred.'); }
    finally { setLoading(false); }
  };

  // Step 2: Verify Answers
  const handleVerify = () => {
    if (!foundUser) return;
    const a1 = answers.ans1.trim().toLowerCase();
    const a2 = answers.ans2.trim().toLowerCase();
    const sa1 = foundUser.sec_answer_1.trim().toLowerCase();
    const sa2 = foundUser.sec_answer_2.trim().toLowerCase();

    if (a1 === sa1 && a2 === sa2) {
      setStep(3);
      setError('');
    } else {
      setError('Incorrect answers. Please try again.');
    }
  };

  // Step 3: Reset Password
  const handleReset = async () => {
    if (newPassword.pass !== newPassword.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!newPassword.pass) {
        setError('Password cannot be empty');
        return;
    }

    setLoading(true);
    try {
      if (foundUser) {
        await DB.updateUserPassword(foundUser.id, newPassword.pass);
        setSuccess('Password has been reset successfully.');
        setTimeout(() => onNavigate('login'), 2000);
      }
    } catch (e) { setError('Failed to reset password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Password Recovery</h2>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm flex items-center"><CheckCircle2 className="h-4 w-4 mr-2"/> {success}</div>}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Enter your ERP ID to find your account.</p>
            <input 
              placeholder="ERP ID" 
              value={erpId} 
              onChange={e => setErpId(e.target.value)} 
              className="block w-full px-3 py-2 border rounded-md"
            />
            <button onClick={handleFindUser} disabled={loading} className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800">
              {loading ? 'Searching...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 2 && foundUser && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Answer your security questions to verify identity.</p>
            
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">{foundUser.sec_question_1}</label>
                <input 
                placeholder="Answer 1" 
                value={answers.ans1} 
                onChange={e => setAnswers({...answers, ans1: e.target.value})} 
                className="block w-full px-3 py-2 border rounded-md bg-white"
                />
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">{foundUser.sec_question_2}</label>
                <input 
                placeholder="Answer 2" 
                value={answers.ans2} 
                onChange={e => setAnswers({...answers, ans2: e.target.value})} 
                className="block w-full px-3 py-2 border rounded-md bg-white"
                />
            </div>

            <button onClick={handleVerify} className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-800">Verify Answers</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
             <p className="text-sm text-slate-600 text-center">Set your new password.</p>
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword.pass} 
              onChange={e => setNewPassword({...newPassword, pass: e.target.value})} 
              className="block w-full px-3 py-2 border rounded-md"
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={newPassword.confirm} 
              onChange={e => setNewPassword({...newPassword, confirm: e.target.value})} 
              className="block w-full px-3 py-2 border rounded-md"
            />
            <button onClick={handleReset} disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">
               {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}
        
        {step === 1 && (
            <div className="mt-4 text-center">
                <button onClick={() => onNavigate('login')} className="text-sm text-slate-500 hover:text-slate-700">Back to Login</button>
            </div>
        )}
      </div>
    </div>
  );
};
