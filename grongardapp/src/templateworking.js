import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, CheckCircle, Loader, CreditCard, Smartphone, Search, Clipboard, Star, MessageCircle, Calendar, DollarSign, ShieldCheck, Clock, FileText, Users, BarChart, ThumbsUp, ThumbsDown, Flag, Mail, Phone, Lock, Unlock, Eye, EyeOff, Filter, RefreshCw, ArrowUpDown, ChevronDown, ChevronUp, Bell, X, User, Settings, LogOut, Plus, ArrowDownUp, Send /* other icons */ } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Checkbox } from "./components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { Switch } from "./components/ui/switch";
import { Slider } from "./components/ui/slider";
import { Progress } from "./components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { Toast } from "./components/ui/toast";
import { Toaster } from "./components/ui/toaster";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import ErrorBoundary from './components/ErrorBoundary';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./components/ui/dropdown-menu";
import { Badge } from "./components/ui/badge";
import { supabase } from './supabaseClient.js';   

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => new Date(date).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
const formatCurrency = (amount) => new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(amount);

// Enhanced mock data
const mockUsers = [ 
  { id: 'u1', name: 'Anna Svensson', type: 'customer', email: 'anna@example.com', phone: '0701234567', rating: 4.5, balance: 1000, created: '2024-01-15', lastActive: '2024-08-01', preferences: { notifications: true, language: 'sv' } },
  { id: 'u2', name: 'Erik Johansson', type: 'provider', email: 'erik@example.com', phone: '0709876543', rating: 4.8, specialties: ['Gräsklippning', 'Trädgårdsskötsel', 'Häckklippning'], balance: 2500, created: '2023-11-20', lastActive: '2024-08-02', preferences: { notifications: true, language: 'sv' } },
  { id: 'u3', name: 'Maria Larsson', type: 'customer', email: 'maria@example.com', phone: '0703456789', rating: 4.2, balance: 750, created: '2024-03-10', lastActive: '2024-07-30', preferences: { notifications: false, language: 'en' } },
  { id: 'u4', name: 'Anders Karlsson', type: 'provider', email: 'anders@example.com', phone: '0706543210', rating: 4.9, specialties: ['Gräsklippning', 'Ogräsrensning', 'Plantering'], balance: 3000, created: '2023-09-05', lastActive: '2024-08-01', preferences: { notifications: true, language: 'sv' } },
  { id: 'u5', name: 'Eva Nilsson', type: 'customer', email: 'eva@example.com', phone: '0708765432', rating: 4.7, balance: 1200, created: '2024-02-28', lastActive: '2024-07-29', preferences: { notifications: true, language: 'sv' } },
];

const mockJobs = [
  { id: 'j1', customerId: 'u1', providerId: null, description: 'Gräsklippning 200 kvm', status: 'open', price: 500, created: '2024-08-01', deadline: '2024-08-10', complexity: 'medium', estimatedHours: 3, location: 'Stockholm', tags: ['gräsklippning', 'trädgård'] },
  { id: 'j2', customerId: 'u1', providerId: 'u2', description: 'Gräsklippning 150 kvm', status: 'matched', price: 400, created: '2024-07-28', deadline: '2024-08-05', complexity: 'low', estimatedHours: 2, location: 'Göteborg', tags: ['gräsklippning', 'liten yta'] },
  { id: 'j3', customerId: 'u3', providerId: 'u4', description: 'Omfattande trädgårdsarbete', status: 'in_progress', price: 1500, created: '2024-07-25', deadline: '2024-08-15', complexity: 'high', estimatedHours: 10, location: 'Malmö', tags: ['trädgårdsarbete', 'omfattande'] },
  { id: 'j4', customerId: 'u5', providerId: null, description: 'Häckklippning 20 meter', status: 'open', price: 600, created: '2024-08-02', deadline: '2024-08-20', complexity: 'medium', estimatedHours: 4, location: 'Uppsala', tags: ['häckklippning'] },
  { id: 'j5', customerId: 'u3', providerId: 'u2', description: 'Plantering av sommarblommor', status: 'completed', price: 800, created: '2024-07-10', deadline: '2024-07-20', complexity: 'low', estimatedHours: 5, location: 'Örebro', tags: ['plantering', 'sommarblommor'] },
];

const mockPayments = [
  { id: 'p1', jobId: 'j2', amount: 400, status: 'pending', method: 'SWIFT', transactionId: 'SWIFT123456', initiatedDate: '2024-08-02', completedDate: null, fromId: 'u1', toId: 'u2' },
  { id: 'p2', jobId: 'j5', amount: 800, status: 'completed', method: 'Swish', transactionId: 'SWISH789012', initiatedDate: '2024-07-21', completedDate: '2024-07-22', fromId: 'u3', toId: 'u2' },
  { id: 'p3', jobId: 'j3', amount: 750, status: 'in_escrow', method: 'Credit Card', transactionId: 'CC345678', initiatedDate: '2024-07-26', completedDate: null, fromId: 'u3', toId: 'u4' },
];

const mockFeedback = [
  { id: 'f1', jobId: 'j2', fromId: 'u1', toId: 'u2', rating: 5, comment: 'Utmärkt arbete, mycket nöjd!', created: '2024-08-03', response: null },
  { id: 'f2', jobId: 'j5', fromId: 'u3', toId: 'u2', rating: 4, comment: 'Bra jobb, men lite försenat.', created: '2024-07-23', response: 'Tack för feedbacken! Vi ska förbättra vår tidshållning.' },
  { id: 'f3', jobId: 'j5', fromId: 'u2', toId: 'u3', rating: 5, comment: 'Mycket trevlig kund, clear instruktioner.', created: '2024-07-23', response: null },
];

const mockDisputes = [
  { id: 'd1', jobId: 'j3', initiatorId: 'u3', respondentId: 'u4', reason: 'Incomplete work', description: 'Jobbet var inte helt färdigt när tiden var ute.', status: 'open', created: '2024-08-04', resolution: null, evidence: ['photo1.jpg', 'photo2.jpg'] },
  { id: 'd2', jobId: 'j5', initiatorId: 'u2', respondentId: 'u3', reason: 'Late payment', description: 'Betalningen var försenad med 3 dagar.', status: 'resolved', created: '2024-07-24', resolution: 'Customer agreed to pay a late fee.', evidence: ['chat_log.txt'] },
];

const GronGardPlatform = () => {
  // Comprehensive state management
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState('welcome');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', type: 'customer', specialties: [], preferences: { notifications: true, language: 'sv' } });
  const [jobFilters, setJobFilters] = useState({ status: 'open', minPrice: 0, maxPrice: 10000, complexity: [], location: '', tags: [], sortBy: 'created', sortOrder: 'desc' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [disputeForm, setDisputeForm] = useState({ reason: '', description: '', evidence: [] });
  const [statistics, setStatistics] = useState({ totalJobs: 0, completedJobs: 0, averageRating: 0, totalEarnings: 0, disputeResolutionRate: 0 });
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [userPreferences, setUserPreferences] = useState({ theme: 'light', fontSize: 'medium', notifications: { email: true, sms: false, push: true } });

  
  // Supabase API functions
  const supabaseAPI = {
    register: async (userData) => {
      try {
        const { user, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              type: userData.type,
              specialties: userData.specialties,
              preferences: userData.preferences,
              balance: 0,
              rating: 0,
            }
          }
        });
        if (error) throw error;
        return user;
      } catch (error) {
        if (error.message === 'Email rate limit exceeded') {
          // Handle rate limit error
          console.error('Registration attempts exceeded. Please try again later.');
          // You might want to show a user-friendly message here
        } else {
          // Handle other errors
          console.error('Registration error:', error.message);
        }
        throw error;
      }
    }, 
  
    login: async (email, password) => {
      const { user, error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      return user;
    },
  
    createJob: async (jobData) => {
      const { email, name, ...jobFields } = jobData; // Remove email and name from jobData
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobFields])
        .single();
      if (error) throw error;
      return data;
    },
  
    findJobs: async (filters) => {
      let query = supabase
        .from('jobs')
        .select('*');
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.minPrice) query = query.gte('price', filters.minPrice);
      if (filters.maxPrice) query = query.lte('price', filters.maxPrice);
      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.tags && filters.tags.length > 0) query = query.contains('tags', filters.tags);
    
      query = query.order(filters.sortBy || 'created_at', { ascending: filters.sortOrder === 'asc' });
    
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  
    acceptJob: async (jobId, providerId) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'matched', providerId })
        .eq('id', jobId)
        .single();
      if (error) throw error;
      return data;
    },
  
    startJob: async (jobId) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', jobId)
        .single();
      if (error) throw error;
      return data;
    },
  
    completeJob: async (jobId) => {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'completed', completedDate: new Date().toISOString() })
        .eq('id', jobId)
        .single();
      if (error) throw error;
      return data;
    },

    submitFeedback: async (feedbackData) => {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          job_id: feedbackData.jobId,
          from_id: feedbackData.fromId,
          to_id: feedbackData.toId,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
          created: new Date().toISOString()
        }])
        .single();
      if (error) throw error;
      return data;
    },
  
    processPayment: async (jobId, method, amount) => {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          jobId,
          amount,
          status: 'processing',
          method,
          transactionId: `${method}${Date.now()}`,
          initiatedDate: new Date().toISOString(),
        }])
        .single();
      if (error) throw error;
      return data;
    },
  
    completePayment: async (paymentId) => {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .update({ status: 'completed', completedDate: new Date().toISOString() })
        .eq('id', paymentId)
        .single();
      if (paymentError) throw paymentError;
  
      // Update user balances
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('customerId, providerId, price')
        .eq('id', payment.jobId)
        .single();
      if (jobError) throw jobError;
  
      const { error: balanceError } = await supabase.rpc('update_balances', {
        customer_id: job.customerId,
        provider_id: job.providerId,
        amount: job.price
      });
      if (balanceError) throw balanceError;
  
      return payment;
    },
  
    submitFeedback: async (feedbackData) => {
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...feedbackData,
          created: new Date().toISOString(),
        }])
        .single();
      if (error) throw error;
      return data;
    },
  
    respondToFeedback: async (feedbackId, response) => {
      const { data, error } = await supabase
        .from('feedback')
        .update({ response, responseDate: new Date().toISOString() })
        .eq('id', feedbackId)
        .single();
      if (error) throw error;
      return data;
    },
  
    initiateDispute: async (disputeData) => {
      const { data, error } = await supabase
        .from('disputes')
        .insert([{
          ...disputeData,
          status: 'open',
          created: new Date().toISOString(),
        }])
        .single();
      if (error) throw error;
      return data;
    },
  
    resolveDispute: async (disputeId, resolution) => {
      const { data, error } = await supabase
        .from('disputes')
        .update({ status: 'resolved', resolution, resolvedDate: new Date().toISOString() })
        .eq('id', disputeId)
        .single();
      if (error) throw error;
      return data;
    },
  
    getStatistics: async (userId) => {
      const { data, error } = await supabase.rpc('get_user_statistics', { user_id: userId });
      if (error) throw error;
      return data;
    },
  
    updateUserPreferences: async (userId, preferences) => {
      const { data, error } = await supabase
        .from('users')
        .update({ preferences })
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
  
    getChatMessages: async (jobId) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('jobId', jobId)
        .order('sent_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  
    sendChatMessage: async (messageData) => {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          ...messageData,
          sent_at: new Date().toISOString(),
        }])
        .single();
      if (error) throw error;
      return data;
    },
  };
      // useEffect hooks for data fetching and state management
      useEffect(() => {
        if (user) {
          setView('dashboard');
          refreshData();
        }
      }, [user]);
    
      useEffect(() => {
        const timer = setInterval(() => {
          if (user) {
            refreshData();
          }
        }, 60000); // Refresh data every minute
        return () => clearInterval(timer);
      }, [user]);
    
      useEffect(() => {
        if (selectedJob) {
          supabaseAPI.getChatMessages(selectedJob.id)
            .then(messages => setChatMessages(prevMessages => ({
              ...prevMessages,
              [selectedJob.id]: messages
            })))
            .catch(err => setError('Failed to load chat messages'));
        }
      }, [selectedJob]);
    
      // Helper functions


      const renderBackButton = () => (
        <Button 
          onClick={() => setView('dashboard')} 
          variant="outline" 
          className="mb-4"
        >
          Tillbaka till Dashboard
        </Button>
      );

      const refreshData = useCallback(async () => {
        setLoading(true);
        try {
          const [fetchedJobs, fetchedPayments, fetchedFeedback, fetchedDisputes, userStats] = await Promise.all([
            user.type === 'customer'
              ? supabaseAPI.findJobs({ ...jobFilters, customerId: user.id })
              : supabaseAPI.findJobs(jobFilters),
            supabaseAPI.getPayments(user.id),
            supabaseAPI.getFeedback(user.id),
            supabaseAPI.getDisputes(user.id),
            supabaseAPI.getStatistics(user.id)
          ]);
    
          setJobs(fetchedJobs);
          setPayments(fetchedPayments);
          setFeedback(fetchedFeedback);
          setDisputes(fetchedDisputes);
          setStatistics(userStats);
    
          // Check for new notifications
          const newNotifications = [
            ...fetchedJobs.filter(job => job.status === 'completed' && job.completedDate > user.lastActive).map(job => ({
              id: generateId(),
              type: 'job_completed',
              message: `Job "${job.description}" has been marked as completed.`,
              jobId: job.id
            })),
            ...fetchedPayments.filter(payment => payment.status === 'completed' && payment.completedDate > user.lastActive).map(payment => ({
              id: generateId(),
              type: 'payment_received',
              message: `Payment of ${formatCurrency(payment.amount)} has been received for job #${payment.jobId}.`,
              paymentId: payment.id
            })),
            ...fetchedFeedback.filter(f => f.created > user.lastActive && f.toId === user.id).map(f => ({
              id: generateId(),
              type: 'new_feedback',
              message: `You have received new feedback for job #${f.jobId}.`,
              feedbackId: f.id
            })),
            ...fetchedDisputes.filter(d => d.created > user.lastActive && d.respondentId === user.id).map(d => ({
              id: generateId(),
              type: 'new_dispute',
              message: `A new dispute has been opened for job #${d.jobId}.`,
              disputeId: d.id
            }))
          ];
    
          setNotifications(prevNotifications => [...prevNotifications, ...newNotifications]);
    
        } catch (err) {
          setError('Kunde inte hämta data. Försök igen.');
        }
        setLoading(false);
      }, [user, jobFilters]);
    
      const handleAction = async (action, data = {}) => {
        console.log(`handleAction called with action: ${action}`, data);
        setLoading(true);
        setError('');
        setSuccess('');
        try {
          switch (action) {
            case 'register':  
            const { user: newUser, error: registerError } = await supabase.auth.signUp({
              email: data.email,
              password: data.password,
              options: {
                data: {
                  name: data.name,
                  phone: data.phone,
                  type: data.type,
                  specialties: data.specialties,
                  preferences: data.preferences
                }
              }
            });
            if (registerError) throw registerError;
    
            // Insert additional user data into the users table
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                { 
                  id: newUser.id, 
                  name: data.name,
                  phone: data.phone,
                  user_type: data.type,
                  specialties: data.specialties,
                  preferences: data.preferences,
                  balance: 0,
                  rating: 0
                }
              ]);
            if (insertError) throw insertError;
    
            setSuccess('Registrering lyckades! Kontrollera din e-post för verifieringslänken.');
            setView('login');
            break;
            case 'login':
              try {
                const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
                  email: data.email,
                  password: data.password,
                });
                if (loginError) throw loginError;
            
                if (!authData || !authData.user) {
                  throw new Error('Inloggningen lyckades men ingen användardata returnerades.');
                }
            
                // Fetch additional user data
                let { data: profileData, error: profileError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', authData.user.id)
                  .single();
                
                if (profileError) {
                  if (profileError.code === 'PGRST116') {
                    // No user found in the custom users table, we might need to create one
                    const { data: newUserData, error: insertError } = await supabase
                      .from('users')
                      .insert([
                        { 
                          id: authData.user.id, 
                          email: authData.user.email,
                          name: authData.user.user_metadata.name || 'Användare',
                          phone: authData.user.user_metadata.phone || '',
                          user_type: authData.user.user_metadata.type || 'customer',
                          preferences: authData.user.user_metadata.preferences || {},
                          balance: 0,
                          rating: 0
                        }
                      ])
                      .single();
            
                    if (insertError) throw insertError;
                    profileData = newUserData;
                  } else {
                    throw profileError;
                  }
                }
                
                setUser({ ...authData.user, ...profileData });
                setSuccess('Inloggning lyckades!');
                setView('dashboard');
              } catch (err) {
                console.error('Login error:', err);
                setError(`Inloggning misslyckades: ${err.message}`);
              }
              break;
              try {
                const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
                  email: data.email,
                  password: data.password,
                });
                if (loginError) throw loginError;
            
                if (!authData || !authData.user) {
                  throw new Error('Inloggningen lyckades men ingen användardata returnerades.');
                }
            
                // Fetch additional user data
                let { data: profileData, error: profileError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', authData.user.id)
                  .single();
                
                if (profileError) {
                  if (profileError.code === 'PGRST116') {
                    // No user found in the custom users table, we might need to create one
                    const { data: newUserData, error: insertError } = await supabase
                      .from('users')
                      .insert([
                        { 
                          id: authData.user.id, 
                          email: authData.user.email,
                          name: authData.user.user_metadata.name || '',
                          phone: authData.user.user_metadata.phone || '',
                          user_type: authData.user.user_metadata.type || 'customer',
                          preferences: authData.user.user_metadata.preferences || {},
                          balance: 0,
                          rating: 0
                        }
                      ])
                      .single();
            
                    if (insertError) throw insertError;
                    profileData = newUserData;
                  } else {
                    throw profileError;
                  }
                }
                
                setUser({ ...authData.user, ...profileData });
                setSuccess('Inloggning lyckades!');
                setView('dashboard');
              } catch (err) {
                console.error('Login error:', err);
                setError(`Inloggning misslyckades: ${err.message}`);
              }
              break;
            try {
              const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
              });
              if (loginError) throw loginError;
          
              if (!authData || !authData.user) {
                throw new Error('Inloggningen lyckades men ingen användardata returnerades.');
              }
          
              // Fetch additional user data
              const { data: profileData, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authData.user.id)
                .single();
              
              if (profileError) {
                if (profileError.code === 'PGRST116') {
                  // No user found in the custom users table, we might need to create one
                  const { data: newUserData, error: insertError } = await supabase
                    .from('users')
                    .insert([
                      { 
                        id: authData.user.id, 
                        email: authData.user.email,
                        name: authData.user.user_metadata.name || '',
                        phone: authData.user.user_metadata.phone || '',
                        user_type: authData.user.user_metadata.type || 'customer',
                        preferences: authData.user.user_metadata.preferences || {},
                        balance: 0,
                        rating: 0
                      }
                    ])
                    .single();
          
                  if (insertError) throw insertError;
                  profileData = newUserData;
                } else {
                  throw profileError;
                }
              }
              
              setUser({ ...authData.user, ...profileData });
              setSuccess('Inloggning lyckades!');
              setView('dashboard');
            } catch (err) {
              console.error('Login error:', err);
              setError(`Inloggning misslyckades: ${err.message}`);
            }
            break;
            const { data: userData, error: loginError } = await supabase.auth.signInWithPassword({
              email: data.email,
              password: data.password,
            });
            if (loginError) throw loginError;
            
            // Fetch additional user data
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userData.user.id)
              .single();
            
            if (profileError) throw profileError;
            
            setUser({ ...userData.user, ...profileData });
            setSuccess('Inloggning lyckades!');
            setView('dashboard');
            break; 
            case 'logout':
                  const { error: logoutError } = await supabase.auth.signOut();
                  if (logoutError) throw logoutError;
                  setUser(null);
                  setView('welcome');
                  setSuccess('Du har loggat ut.');
                  break;
            case 'createJob':
                    const { email, name, ...jobData } = data; // Remove email and name from data
                    const newJob = await supabaseAPI.createJob({ 
                      customer_id: user.id,
                      ...jobData
                    });
                    setJobs(prevJobs => [...prevJobs, newJob]);
                    setSuccess('Jobbet har skapats framgångsrikt!');
                    setSelectedJob(newJob);
                    setView('jobDetails');
                    break;
            case 'acceptJob':
              const updatedJob = await supabaseAPI.acceptJob(data.jobId, user.id);
              setJobs(prevJobs => prevJobs.map(job => job.id === data.jobId ? updatedJob : job));
              setSuccess('Du har accepterat jobbet!');
              break;
            case 'startJob':
              const startedJob = await supabaseAPI.startJob(data.jobId);
              setJobs(prevJobs => prevJobs.map(job => job.id === data.jobId ? startedJob : job));
              setSuccess('Jobbet har påbörjats!');
              break;
            case 'completeJob':
              const completedJob = await supabaseAPI.completeJob(data.jobId);
              setJobs(prevJobs => prevJobs.map(job => job.id === data.jobId ? completedJob : job));
              setSuccess('Jobbet har markerats som slutfört!');
              break;
            case 'processPayment':
              const payment = await supabaseAPI.processPayment(data.jobId, data.method, data.amount);
              setPayments(prevPayments => [...prevPayments, payment]);
              setSuccess('Betalningen har påbörjats!');
              break;
            case 'completePayment':
              const completedPayment = await supabaseAPI.completePayment(data.paymentId);
              setPayments(prevPayments => prevPayments.map(p => p.id === data.paymentId ? completedPayment : p));
              setSuccess('Betalningen har slutförts!');
              break;
              case 'submitFeedback':
                try {
                  const newFeedback = await supabaseAPI.submitFeedback(data);
                  setFeedback(prevFeedback => [...prevFeedback, newFeedback]);
                  setSuccess('Feedback har skickats framgångsrikt!');
                  setView('jobDetails');
                } catch (error) {
                  console.error('Error submitting feedback:', error);
                  setError(`Failed to submit feedback: ${error.message}`);
                }
                break;
            case 'respondToFeedback':
              const updatedFeedback = await supabaseAPI.respondToFeedback(data.feedbackId, data.response);
              setFeedback(prevFeedback => prevFeedback.map(f => f.id === data.feedbackId ? updatedFeedback : f));
              setSuccess('Svar på feedback har skickats!');
              break;
            case 'initiateDispute':
              const newDispute = await supabaseAPI.initiateDispute(data);
              setDisputes(prevDisputes => [...prevDisputes, newDispute]);
              setSuccess('Tvist har initierats!');
              break;
            case 'resolveDispute':
              const resolvedDispute = await supabaseAPI.resolveDispute(data.disputeId, data.resolution);
              setDisputes(prevDisputes => prevDisputes.map(d => d.id === data.disputeId ? resolvedDispute : d));
              setSuccess('Tvisten har lösts!');
              break;
              case 'updatePreferences':
                if (user && user.id) {
                  const updatedUser = await supabaseAPI.updateUserPreferences(user.id, data);
                  setUser(prevUser => ({ ...prevUser, ...updatedUser }));
                  setSuccess('Inställningar har uppdaterats!');
                } else {
                  setError('Användarinformation saknas. Logga ut och in igen.');
                }
                break;
                case 'sendMessage':
                  if (!user) {
                    throw new Error('Du måste vara inloggad för att skicka meddelanden.');
                  }
                  if (!data.jobId) {
                    throw new Error('Inget jobb valt.');
                  }
                  const newMessage = await supabaseAPI.sendChatMessage(data);
                  setChatMessages(prevMessages => ({
                    ...prevMessages,
                    [data.jobId]: [...(prevMessages[data.jobId] || []), newMessage]
                  }));
                  setSuccess('Meddelande skickat!');
                  break;
            default:
              throw new Error('Ogiltig åtgärd');
          }
        } catch (err) {
          console.error('Error in handleAction:', err);
          setError(`Ett fel uppstod: ${err.message}`);
        }
        setLoading(false);
        console.log('handleAction completed');
      };
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
          ...prevData,
          [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: checked
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleJobFilterChange = (filterName, value) => {
    setJobFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  const handleSortChange = (sortBy) => {
    setJobFilters(prevFilters => ({
      ...prevFilters,
      sortBy,
      sortOrder: prevFilters.sortBy === sortBy && prevFilters.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prevForm => ({
      ...prevForm,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const handleDisputeChange = (e) => {
    const { name, value } = e.target;
    setDisputeForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDisputeForm(prevForm => ({
      ...prevForm,
      evidence: [...prevForm.evidence, ...files]
    }));
  };

  const handleNotificationDismiss = (notificationId) => {
    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));
  };

  const handlePreferenceChange = (preferenceName, value) => {
    setUserPreferences(prevPreferences => ({
      ...prevPreferences,
      [preferenceName]: value
    }));
    handleAction('updatePreferences', { [preferenceName]: value });
  };

  // UI Rendering Functions
  const renderWelcomeView = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-center">Välkommen till GrönGård</h2>
      <p className="text-center text-gray-600">Den ledande plattformen för trädgårdstjänster i Sverige</p>
      <div className="flex justify-center space-x-4">
        <Button onClick={() => setView('register')} className="bg-green-500 hover:bg-green-600 text-white">
          Registrera dig
        </Button>
        <Button onClick={() => setView('login')} variant="outline">
          Logga in
        </Button>
      </div>
    </div>
  );

  const renderRegisterView = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAction('register', formData); }} className="space-y-4">
      <h2 className="text-2xl font-bold">Registrera dig</h2>
      <div>
        <Label htmlFor="name">Namn</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="email">E-post</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="password">Lösenord</Label>
        <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
      </div>
      <div>
        <Label>Typ av konto</Label>
        <RadioGroup name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="customer" id="customer" />
            <Label htmlFor="customer">Kund</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="provider" id="provider" />
            <Label htmlFor="provider">Leverantör</Label>
          </div>
        </RadioGroup>
      </div>
      {formData.type === 'provider' && (
        <div>
          <Label>Specialiteter</Label>
          <div className="space-y-2">
            {['Gräsklippning', 'Trädgårdsskötsel', 'Häckklippning', 'Ogräsrensning', 'Plantering'].map(specialty => (
              <div key={specialty} className="flex items-center">
                <Checkbox 
                  id={specialty} 
                  name="specialties" 
                  value={specialty}
                  checked={formData.specialties.includes(specialty)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSelectChange('specialties', [...formData.specialties, specialty]);
                    } else {
                      handleSelectChange('specialties', formData.specialties.filter(s => s !== specialty));
                    }
                  }}
                />
                <Label htmlFor={specialty} className="ml-2">{specialty}</Label>
              </div>
            ))}
          </div>
        </div>
      )}
<Button type="submit" className="w-full">Registrera</Button>
    {success && (
      <Alert>
        <AlertTitle>Registrering lyckades!</AlertTitle>
        <AlertDescription>{success}</AlertDescription>
      </Alert>
    )}
    {error && (
      <Alert variant="destructive">
        <AlertTitle>Ett fel uppstod</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}    </form>
  );

  const renderLoginView = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAction('login', formData); }} className="space-y-4">
      <h2 className="text-2xl font-bold">Logga in</h2>
      <div>
        <Label htmlFor="email">E-post</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="password">Lösenord</Label>
        <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
      </div>
      <Button type="submit" className="w-full">Logga in</Button>
    {error && (
      <Alert variant="destructive">
        <AlertTitle>Ett fel uppstod</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )}
        </form>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Välkommen, {user.name}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Totala jobb</dt>
                <dd className="text-2xl font-semibold">{statistics.totalJobs}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slutförda jobb</dt>
                <dd className="text-2xl font-semibold">{statistics.completedJobs}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Genomsnittligt betyg</dt>
                <dd className="text-2xl font-semibold">{statistics.averageRating.toFixed(1)}</dd>
              </div>
              {user.type === 'provider' && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Totala intäkter</dt>
                  <dd className="text-2xl font-semibold">{formatCurrency(statistics.totalEarnings)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        <Card>
      <CardHeader>
        <CardTitle>Snabbåtgärder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {user?.user_type === 'customer' && (
            <Button onClick={() => setView('createJob')} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Skapa nytt jobb
            </Button>
          )}
          {user?.user_type === 'provider' && (
            <Button onClick={() => setView('findJobs')} className="w-full">
              <Search className="mr-2 h-4 w-4" /> Hitta jobb
            </Button>
          )}
          <Button onClick={() => setView('messages')} variant="outline" className="w-full">
            <MessageCircle className="mr-2 h-4 w-4" /> Meddelanden
          </Button>
        </div>
      </CardContent>
    </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notiser</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <ul className="space-y-2">
                {notifications.slice(0, 3).map(notification => (
                  <li key={notification.id} className="flex items-center justify-between">
                    <span className="text-sm">{notification.message}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleNotificationDismiss(notification.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Inga nya notiser</p>
            )}
          </CardContent>
          {notifications.length > 3 && (
            <CardFooter>
              <Button variant="link" onClick={() => setView('notifications')}>Visa alla</Button>
            </CardFooter>
          )}
        </Card>
      </div>
      {renderCurrentView()}
    </div>
  );

  const renderCustomerJobListings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Dina jobb</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.filter(job => job.customerId === user.id).map(job => (
          <div key={job.id} className="mb-2">
            <h3>{job.description}</h3>
            <p>Status: {job.status}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
  
  const renderProviderJobListings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tillgängliga jobb</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.filter(job => job.status === 'open').map(job => (
          <div key={job.id} className="mb-2">
            <h3>{job.description}</h3>
            <p>Pris: {formatCurrency(job.price)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  
  const renderCurrentView = () => {
    switch (view) {
      case 'createJob':
        return renderCreateJobView();
      case 'findJobs':
        return renderFindJobsView();
      case 'jobDetails':
        return renderJobDetailsView();
      case 'messages':
        return renderMessagesView();
      case 'notifications':
        return renderNotificationsView();
      case 'profile':
        return renderProfileView();
      case 'settings':
        return renderSettingsView();
      default:
        return null;
    }
  };

  const renderCreateJobView = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4">
      <h3 className="text-xl font-semibold">Skapa nytt jobb</h3>
      <div>
        <Label htmlFor="description">Beskrivning</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="price">Pris (SEK)</Label>
        <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="location">Plats</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
      </div>
      <div>
        <Label>Komplexitet</Label>
        <Select name="complexity" value={formData.complexity} onValueChange={(value) => handleSelectChange('complexity', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Välj komplexitet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Låg</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">Hög</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Taggar</Label>
        <div className="flex flex-wrap gap-2">
          {['gräsklippning', 'trädgård', 'häckklippning', 'plantering', 'ogräsrensning'].map(tag => (
            <label key={tag} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.tags?.includes(tag)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleSelectChange('tags', [...(formData.tags || []), tag]);
                  } else {
                    handleSelectChange('tags', formData.tags?.filter(t => t !== tag) || []);
                  }
                }}
              />
              <span>{tag}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" onClick={() => console.log('Create Job button clicked')}>
      Skapa jobb
    </Button>
    </form>
    </div>

  );

  const renderFindJobsView = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Hitta jobb</h3>
      <div className="flex flex-wrap gap-4">
        <Input 
          placeholder="Sök..."
          value={jobFilters.search}
          onChange={(e) => handleJobFilterChange('search', e.target.value)}
        />
        <Select 
          value={jobFilters.status} 
          onValueChange={(value) => handleJobFilterChange('status', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla</SelectItem>
            <SelectItem value="open">Öppna</SelectItem>
            <SelectItem value="in_progress">Pågående</SelectItem>
            <SelectItem value="completed">Avslutade</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={jobFilters.sortBy} 
          onValueChange={(value) => handleSortChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortera efter" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="created">Skapad</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="price">Pris</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => handleJobFilterChange('sortOrder', jobFilters.sortOrder === 'asc' ? 'desc' : 'asc')}>
          {jobFilters.sortOrder === 'asc' ? <ArrowUpDown /> : <ArrowDownUp />}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => (
          <Card key={job.id} className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => { setSelectedJob(job); setView('jobDetails'); }}>
            <CardHeader>
              <CardTitle>{job.description}</CardTitle>
              <CardDescription>{formatDate(job.created)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{formatCurrency(job.price)}</p>
              <p className="text-sm text-gray-500">{job.location}</p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">{formatDate(job.deadline)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Badge variant={job.status === 'open' ? 'default' : job.status === 'in_progress' ? 'secondary' : 'success'}>
                {job.status === 'open' ? 'Öppen' : job.status === 'in_progress' ? 'Pågående' : 'Avslutad'}
              </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
     </div>
  );

  const renderJobDetailsView = () => {
    
    if (!selectedJob || !user) return <div>{renderBackButton()}Ingen jobbinformation tillgänglig.</div>;

    return (
      <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">{selectedJob.description}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Jobbdetaljer</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <Badge variant={selectedJob.status === 'open' ? 'default' : selectedJob.status === 'in_progress' ? 'secondary' : 'success'}>
                      {selectedJob.status === 'open' ? 'Öppen' : selectedJob.status === 'in_progress' ? 'Pågående' : 'Avslutad'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pris</dt>
                  <dd className="text-lg font-semibold">{formatCurrency(selectedJob.price)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plats</dt>
                  <dd>{selectedJob.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Skapad</dt>
                  <dd>{formatDate(selectedJob.created)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                  <dd>{formatDate(selectedJob.deadline)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Komplexitet</dt>
                  <dd>{selectedJob.complexity}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uppskattad tid</dt>
                  <dd>{selectedJob.estimatedHours} timmar</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Åtgärder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.type === 'provider' && selectedJob.status === 'open' && (
                  <Button onClick={() => handleAction('acceptJob', { jobId: selectedJob.id })} className="w-full">
                    Acceptera jobb
                  </Button>
                )}
                {user.type === 'provider' && selectedJob.status === 'in_progress' && (
                  <Button onClick={() => handleAction('completeJob', { jobId: selectedJob.id })} className="w-full">
                    Markera som slutfört
                  </Button>
                )}
                {user.type === 'customer' && selectedJob.status === 'completed' && (
                  <Button onClick={() => setView('payment')} className="w-full">
                    Betala
                  </Button>
                )}
                <Button onClick={() => setView('messages')} variant="outline" className="w-full">
                  Meddelanden
                </Button>
                {selectedJob.status === 'completed' && (
                  <Button onClick={() => setView('feedback')} variant="outline" className="w-full">
                    Lämna feedback
                  </Button>
                )}
                <Button onClick={() => setView('dispute')} variant="destructive" className="w-full">
                  Rapportera problem
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>      
          </div>

        {selectedJob.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.filter(f => f.jobId === selectedJob.id).map(f => (
                <div key={f.id} className="border-b last:border-b-0 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarFallback>{f.fromId[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-semibold">{mockUsers.find(u => u.id === f.fromId)?.name}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < f.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(f.created)}</span>
                  </div>
                  <p className="mt-2">{f.comment}</p>
                  {f.response && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      <p className="font-semibold">Svar:</p>
                      <p>{f.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  const renderMessagesView = () => {
    const jobMessages = chatMessages[selectedJob?.id] || [];
  
    return (
      <div className="space-y-4">
        {renderBackButton()}
        <h3 className="text-xl font-semibold">Meddelanden</h3>
        <div className="border rounded-lg h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {jobMessages.map(message => (
              <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs ${message.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
                  <p>{message.content}</p>
                  <span className="text-xs mt-1 block">{formatDate(message.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              const content = e.target.message.value;
              if (content.trim() && user && selectedJob) {
                handleAction('sendMessage', { 
                  jobId: selectedJob.id, 
                  content, 
                  senderId: user.id, 
                  recipientId: selectedJob.customerId === user.id ? selectedJob.providerId : selectedJob.customerId 
                });
                e.target.message.value = '';
              }
            }}>
              <div className="flex space-x-2">
                <Input name="message" placeholder="Skriv ett meddelande..." />
                <Button type="submit" disabled={!user || !selectedJob}><Send className="w-4 h-4" /></Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderNotificationsView = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Notiser</h3>
      {notifications.length > 0 ? (
        <ul className="space-y-2">
          {notifications.map(notification => (
            <li key={notification.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <span>{notification.message}</span>
              <Button variant="ghost" size="sm" onClick={() => handleNotificationDismiss(notification.id)}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Inga notiser att visa</p>
      )}
    </div>
    </div>
  );

  const renderProfileView = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Din profil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personlig information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAction('updateProfile', formData);
            }} className="space-y-4">
              <div>
                <Label htmlFor="name">Namn</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="email">E-post</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
              </div>
              {user.type === 'provider' && (
                <div>
                  <Label>Specialiteter</Label>
                  <div className="space-y-2">
                    {['Gräsklippning', 'Trädgårdsskötsel', 'Häckklippning', 'Ogräsrensning', 'Plantering'].map(specialty => (
                      <div key={specialty} className="flex items-center">
                        <Checkbox 
                          id={specialty} 
                          name="specialties" 
                          value={specialty}
                          checked={formData.specialties.includes(specialty)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleSelectChange('specialties', [...formData.specialties, specialty]);
                            } else {
                              handleSelectChange('specialties', formData.specialties.filter(s => s !== specialty));
                            }
                          }}
                        />
                        <Label htmlFor={specialty} className="ml-2">{specialty}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit">Uppdatera profil</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Statistik och betyg</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Genomsnittligt betyg</dt>
                <dd className="text-2xl font-semibold flex items-center">
                  {statistics.averageRating.toFixed(1)}
                  <div className="ml-2 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.round(statistics.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slutförda jobb</dt>
                <dd className="text-2xl font-semibold">{statistics.completedJobs}</dd>
              </div>
              {user.type === 'provider' && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Totala intäkter</dt>
                  <dd className="text-2xl font-semibold">{formatCurrency(statistics.totalEarnings)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Medlemsdatum</dt>
                <dd>{formatDate(user.created)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );

  const renderSettingsView = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Inställningar</h3>
      <Card>
        <CardHeader>
        <CardTitle>Notifieringsinställningar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAction('updatePreferences', userPreferences);
          }} className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">E-postnotifieringar</Label>
              <Switch
                id="emailNotifications"
                checked={userPreferences.notifications.email}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', { ...userPreferences.notifications, email: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">SMS-notifieringar</Label>
              <Switch
                id="smsNotifications"
                checked={userPreferences.notifications.sms}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', { ...userPreferences.notifications, sms: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Push-notifieringar</Label>
              <Switch
                id="pushNotifications"
                checked={userPreferences.notifications.push}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', { ...userPreferences.notifications, push: checked })}
              />
            </div>
            <Button type="submit">Spara inställningar</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appinställningar</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="language">Språk</Label>
              <Select
                id="language"
                value={userPreferences.language}
                onValueChange={(value) => handlePreferenceChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj språk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sv">Svenska</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select
                id="theme"
                value={userPreferences.theme}
                onValueChange={(value) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Ljust</SelectItem>
                  <SelectItem value="dark">Mörkt</SelectItem>
                  <SelectItem value="system">Systemstandard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fontSize">Textstorlek</Label>
              <Select
                id="fontSize"
                value={userPreferences.fontSize}
                onValueChange={(value) => handlePreferenceChange('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj textstorlek" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Liten</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Stor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Säkerhet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAction('changePassword', { currentPassword: e.target.currentPassword.value, newPassword: e.target.newPassword.value });
          }} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Nuvarande lösenord</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div>
              <Label htmlFor="newPassword">Nytt lösenord</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Bekräfta nytt lösenord</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <Button type="submit">Ändra lösenord</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Kontoinställningar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" onClick={() => handleAction('exportData')}>Exportera personuppgifter</Button>
            <Button variant="destructive" onClick={() => setView('deleteAccount')}>Radera konto</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );

  const renderPaymentView = () => {
    if (!selectedJob) return null;

    return (
      <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">Betala för jobb</h3>
        <Card>
          <CardHeader>
            <CardTitle>Jobbdetaljer</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Beskrivning</dt>
                <dd>{selectedJob.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Pris</dt>
                <dd className="text-lg font-semibold">{formatCurrency(selectedJob.price)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Utförare</dt>
                <dd>{mockUsers.find(u => u.id === selectedJob.providerId)?.name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Betalningsmetod</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="swift" id="swift" />
                <Label htmlFor="swift">SWIFT</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="swish" id="swish" />
                <Label htmlFor="swish">Swish</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Kreditkort</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
        {paymentMethod === 'swift' && (
          <Card>
            <CardHeader>
              <CardTitle>SWIFT-betalning</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('processPayment', { jobId: selectedJob.id, method: 'SWIFT', amount: selectedJob.price });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="swiftCode">SWIFT-kod</Label>
                  <Input id="swiftCode" name="swiftCode" required />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Kontonummer</Label>
                  <Input id="accountNumber" name="accountNumber" required />
                </div>
                <div>
                  <Label htmlFor="bankName">Banknamn</Label>
                  <Input id="bankName" name="bankName" required />
                </div>
                <Button type="submit">Genomför betalning</Button>
              </form>
            </CardContent>
          </Card>
        )}
        {paymentMethod === 'swish' && (
          <Card>
            <CardHeader>
              <CardTitle>Swish-betalning</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('processPayment', { jobId: selectedJob.id, method: 'Swish', amount: selectedJob.price });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Telefonnummer</Label>
                  <Input id="phoneNumber" name="phoneNumber" type="tel" required />
                </div>
                <Button type="submit">Öppna Swish-app</Button>
              </form>
            </CardContent>
          </Card>
        )}
        {paymentMethod === 'card' && (
          <Card>
            <CardHeader>
              <CardTitle>Kortbetalning</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('processPayment', { jobId: selectedJob.id, method: 'Credit Card', amount: selectedJob.price });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Kortnummer</Label>
                  <Input id="cardNumber" name="cardNumber" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Utgångsdatum</Label>
                    <Input id="expiryDate" name="expiryDate" placeholder="MM/ÅÅ" required />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" name="cvv" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardholderName">Kortinnehavarens namn</Label>
                  <Input id="cardholderName" name="cardholderName" required />
                </div>
                <Button type="submit">Genomför betalning</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    );
  };

  const renderFeedbackView = () => {
    if (!selectedJob) return null;

    return (
      <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">Lämna feedback</h3>
        <Card>
          <CardHeader>
            <CardTitle>Betygsätt och kommentera</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAction('submitFeedback', async (feedbackData) => {
                try {
                  const submittedFeedback = await supabaseAPI.submitFeedback(feedbackData);
                  setFeedback(prevFeedback => [...prevFeedback, submittedFeedback]);
                  setSuccess('Feedback har skickats framgångsrikt!');
                  setView('jobDetails');
                } catch (error) {
                  console.error('Error submitting feedback:', error);
                  setError(`Failed to submit feedback: ${error.message}`);
                }
              });
            }} className="space-y-4">
              <div>
                <Label>Betyg</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`w-8 h-8 cursor-pointer ${
                        rating <= feedbackForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                      onClick={() => handleFeedbackChange({ target: { name: 'rating', value: rating } })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Kommentar</Label>
                <Textarea
                  id="comment"
                  name="comment"
                  value={feedbackForm.comment}
                  onChange={handleFeedbackChange}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit">Skicka feedback</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  };

  const renderDisputeView = () => {
    if (!selectedJob) return null;

    return (
      <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">Rapportera problem</h3>
        <Card>
          <CardHeader>
            <CardTitle>Beskriv problemet</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAction('initiateDispute', {
                jobId: selectedJob.id,
                initiatorId: user.id,
                respondentId: user.type === 'customer' ? selectedJob.providerId : selectedJob.customerId,
                ...disputeForm
              });
            }} className="space-y-4">
              <div>
                <Label htmlFor="reason">Anledning</Label>
                <Select
                  id="reason"
                  name="reason"
                  value={disputeForm.reason}
                  onValueChange={(value) => handleDisputeChange({ target: { name: 'reason', value } })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj en anledning" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incomplete_work">Ofullständigt arbete</SelectItem>
                    <SelectItem value="quality_issues">Kvalitetsproblem</SelectItem>
                    <SelectItem value="late_completion">Försenat slutförande</SelectItem>
                    <SelectItem value="communication_problems">Kommunikationsproblem</SelectItem>
                    <SelectItem value="payment_issues">Betalningsproblem</SelectItem>
                    <SelectItem value="other">Annat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Beskrivning</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={disputeForm.description}
                  onChange={handleDisputeChange}
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="evidence">Bevismaterial</Label>
                <Input
                  id="evidence"
                  name="evidence"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                />
              </div>
              <Button type="submit">Skicka rapport</Button>
            </form>
            </CardContent>
        </Card>
      </div>
      </div>
    );
  };

  const renderDisputeResolutionView = () => {
    if (!selectedDispute) return null;

    return (
      <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4">

    </form>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold">Tvistelösning</h3>
        <Card>
          <CardHeader>
            <CardTitle>Detaljer om tvisten</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Jobb</dt>
                <dd>{jobs.find(job => job.id === selectedDispute.jobId)?.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Initierad av</dt>
                <dd>{mockUsers.find(u => u.id === selectedDispute.initiatorId)?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Anledning</dt>
                <dd>{selectedDispute.reason}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Beskrivning</dt>
                <dd>{selectedDispute.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <Badge variant={selectedDispute.status === 'open' ? 'default' : selectedDispute.status === 'in_progress' ? 'secondary' : 'success'}>
                    {selectedDispute.status === 'open' ? 'Öppen' : selectedDispute.status === 'in_progress' ? 'Pågående' : 'Löst'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Bevismaterial</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedDispute.evidence.map((evidence, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{evidence}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleViewEvidence(evidence)}>
                      Visa
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {user.type === 'admin' && selectedDispute.status !== 'resolved' && (
          <Card>
            <CardHeader>
              <CardTitle>Lös tvist</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAction('resolveDispute', {
                  disputeId: selectedDispute.id,
                  resolution: e.target.resolution.value,
                  decisionDetails: e.target.decisionDetails.value,
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="resolution">Beslut</Label>
                  <Select id="resolution" name="resolution" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj beslut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_favor_of_initiator">Till förmån för initieraren</SelectItem>
                      <SelectItem value="in_favor_of_respondent">Till förmån för svaranden</SelectItem>
                      <SelectItem value="compromise">Kompromiss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="decisionDetails">Beslutdetaljer</Label>
                  <Textarea
                    id="decisionDetails"
                    name="decisionDetails"
                    rows={4}
                    required
                    placeholder="Beskriv beslutet och eventuella åtgärder som ska vidtas..."
                  />
                </div>
                <Button type="submit">Lös tvist</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    );
  };

  const renderDeleteAccountView = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-red-600">Radera konto</h3>
      <Card>
        <CardHeader>
          <CardTitle>Bekräfta kontoborttagning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Är du säker på att du vill radera ditt konto? Denna åtgärd kan inte ångras och all din data kommer att tas bort permanent.
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAction('deleteAccount', { password: e.target.password.value });
          }} className="space-y-4">
            <div>
              <Label htmlFor="password">Bekräfta med ditt lösenord</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="flex space-x-4">
              <Button type="submit" variant="destructive">Radera mitt konto</Button>
              <Button type="button" variant="outline" onClick={() => setView('settings')}>Avbryt</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div>
    {renderBackButton()}
    <form onSubmit={(e) => { 
      e.preventDefault(); 
      console.log('Form submitted. FormData:', formData);
      handleAction('createJob', formData); 
    }} className="space-y-4"></form>
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Administratörspanel</h3>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Användare</TabsTrigger>
          <TabsTrigger value="jobs">Jobb</TabsTrigger>
          <TabsTrigger value="disputes">Tvister</TabsTrigger>
          <TabsTrigger value="reports">Rapporter</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Användarhantering</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Namn</TableHead>
                    <TableHead>E-post</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.type === 'customer' ? 'Kund' : 'Leverantör'}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                          {user.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user.id)}>
                          Redigera
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleUserStatus(user.id)}>
                          {user.status === 'active' ? 'Inaktivera' : 'Aktivera'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Jobbhantering</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead>Kund</TableHead>
                    <TableHead>Leverantör</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pris</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell>{job.description}</TableCell>
                      <TableCell>{mockUsers.find(u => u.id === job.customerId)?.name}</TableCell>
                      <TableCell>{job.providerId ? mockUsers.find(u => u.id === job.providerId)?.name : 'Ej tilldelad'}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === 'open' ? 'default' : job.status === 'in_progress' ? 'secondary' : 'success'}>
                          {job.status === 'open' ? 'Öppen' : job.status === 'in_progress' ? 'Pågående' : 'Avslutad'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(job.price)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewJobDetails(job.id)}>
                          Visa detaljer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="disputes">
          <Card>
            <CardHeader>
              <CardTitle>Tvistelösning</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jobb</TableHead>
                    <TableHead>Initierad av</TableHead>
                    <TableHead>Anledning</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputes.map(dispute => (
                    <TableRow key={dispute.id}>
                      <TableCell>{jobs.find(job => job.id === dispute.jobId)?.description}</TableCell>
                      <TableCell>{mockUsers.find(u => u.id === dispute.initiatorId)?.name}</TableCell>
                      <TableCell>{dispute.reason}</TableCell>
                      <TableCell>
                        <Badge variant={dispute.status === 'open' ? 'default' : dispute.status === 'in_progress' ? 'secondary' : 'success'}>
                          {dispute.status === 'open' ? 'Öppen' : dispute.status === 'in_progress' ? 'Pågående' : 'Löst'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDisputeDetails(dispute.id)}>
                          Hantera
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Rapporter och statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold mb-2">Plattformsstatistik</h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Totala användare</dt>
                      <dd className="text-2xl font-semibold">{mockUsers.length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Totala jobb</dt>
                      <dd className="text-2xl font-semibold">{jobs.length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Aktiva tvister</dt>
                      <dd className="text-2xl font-semibold">{disputes.filter(d => d.status !== 'resolved').length}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total omsättning</dt>
                      <dd className="text-2xl font-semibold">{formatCurrency(jobs.reduce((sum, job) => sum + (job.status === 'completed' ? job.price : 0), 0))}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Toppanvändare</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Användare</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Slutförda jobb</TableHead>
                        <TableHead>Totalt värde</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.slice(0, 5).map(user => {
                        const userJobs = jobs.filter(job => job.customerId === user.id || job.providerId === user.id);
                        const completedJobs = userJobs.filter(job => job.status === 'completed');
                        const totalValue = completedJobs.reduce((sum, job) => sum + job.price, 0);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.type === 'customer' ? 'Kund' : 'Leverantör'}</TableCell>
                            <TableCell>{completedJobs.length}</TableCell>
                            <TableCell>{formatCurrency(totalValue)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );

  const handleEditUser = (userId) => {
    const userToEdit = mockUsers.find(u => u.id === userId);
    setFormData(userToEdit);
    setView('editUser');
  };

  const handleToggleUserStatus = (userId) => {
    setMockUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
  };

  const handleViewJobDetails = (jobId) => {
    setSelectedJob(jobs.find(job => job.id === jobId));
    setView('jobDetails');
  };

  const handleViewDisputeDetails = (disputeId) => {
    setSelectedDispute(disputes.find(dispute => dispute.id === disputeId));
    setView('disputeResolution');
  };

  const handleViewEvidence = (evidenceUrl) => {
    // In a real application, this would open the evidence file or image
    console.log(`Viewing evidence: ${evidenceUrl}`);
  };

  const renderEditUserView = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Redigera användare</h3>
      <Card>
        <CardHeader>
          <CardTitle>Användarinformation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAction('updateUser', formData);
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Namn</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
            </div>
            <div>
              <Label>Typ av konto</Label>
              <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj kontotyp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Kund</SelectItem>
                  <SelectItem value="provider">Leverantör</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Inaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Uppdatera användare</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderErrorBoundary = (error) => (
    <div className="text-center p-6 bg-red-100 border border-red-400 text-red-700 rounded">
      <h3 className="text-xl font-semibold mb-2">Något gick fel</h3>
      <p>{error.message}</p>
      <Button onClick={() => window.location.reload()} className="mt-4">
        Ladda om sidan
      </Button>
    </div>
  );

  // Main render function
  return (
    <ErrorBoundary fallback={renderErrorBoundary}>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white text-left w-full" style={{ paddingLeft: '3mm' }}>Boknings</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Notifikationer</h4>
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className="flex justify-between items-center">
                          <p className="text-sm">{notification.message}</p>
                          <Button variant="ghost" size="sm" onClick={() => handleNotificationDismiss(notification.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Inga nya notifikationer</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <User className="w-5 h-5 mr-2" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setView('profile')}>
                    <User className="w-4 h-4 mr-2" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Inställningar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAction('logout')}>
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logga ut</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </header>

        <main>
          {view === 'welcome' && renderWelcomeView()}
          {view === 'register' && renderRegisterView()}
          {view === 'login' && renderLoginView()}
          {view === 'dashboard' && renderDashboard()}
          {view === 'createJob' && renderCreateJobView()}
          {view === 'findJobs' && renderFindJobsView()}
          {view === 'jobDetails' && renderJobDetailsView()}
          {view === 'messages' && renderMessagesView()}
          {view === 'notifications' && renderNotificationsView()}
          {view === 'profile' && renderProfileView()}
          {view === 'settings' && renderSettingsView()}
          {view === 'payment' && renderPaymentView()}
          {view === 'feedback' && renderFeedbackView()}
          {view === 'dispute' && renderDisputeView()}
          {view === 'disputeResolution' && renderDisputeResolutionView()}
          {view === 'deleteAccount' && renderDeleteAccountView()}
          {user && user.type === 'admin' && view === 'adminDashboard' && renderAdminDashboard()}
          {view === 'editUser' && renderEditUserView()}
        </main>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>&copy; 2024 GrönGård. Alla rättigheter förbehållna.</p>
        </footer>

        <Toaster />
      </div>
    </ErrorBoundary>
  );
};


export default GronGardPlatform;