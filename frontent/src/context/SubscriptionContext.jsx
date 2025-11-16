import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const SubscriptionContext = createContext();

export const useSubscriptionContext = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [trialEligible, setTrialEligible] = useState(true);
    const [trialMessage, setTrialMessage] = useState("");
    const [trialData, setTrialData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);

    console.log("trialData",subscriptionData,trialData,trialEligible,trialMessage)

    // Check trial eligibility and active trial status
    const checkSubscriptionStatus = useCallback(async (userId, token) => {
        if (!userId) return;
        
        try {
            setLoading(true);
            setError(null);
            
            // Check trial eligibility
            const eligibilityResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE}/api/subscription/check-trial-eligibility/${userId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log(eligibilityResponse.data);
            setTrialEligible(eligibilityResponse.data.eligible);
            if (!eligibilityResponse.data.eligible) {
                setTrialMessage(eligibilityResponse.data.reason);
            }

            // Check for active subscription
            const subscriptionResponse = await axios.get(
                `${import.meta.env.VITE_API_BASE}/api/subscription/verify?userId=${userId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            if (subscriptionResponse.data.active && subscriptionResponse.data.planType === 'trial') {
                setTrialData({
                    endDate: new Date(subscriptionResponse.data.endDate),
                    planType: subscriptionResponse.data.planType
                });
                setSubscriptionData(subscriptionResponse.data);
            } else {
                setTrialData(null);
                setSubscriptionData(subscriptionResponse.data);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
            setError(error.response?.data?.message || "Failed to check subscription status");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch subscription data when userId and token are available
    useEffect(() => {
        if (userId && token) {
            checkSubscriptionStatus(userId, token);
        }
    }, [userId, token, checkSubscriptionStatus]);

    // Activate trial
    const activateTrial = async (userId, token) => {
        if (!userId) {
            throw new Error("User not found");
        }

        if (!trialEligible) {
            throw new Error(trialMessage || "You are not eligible for a free trial.");
        }

        try {
            setLoading(true);
            const res = await axios.post(
                `${import.meta.env.VITE_API_BASE}/api/subscription/start-trial`, 
                { userId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            // Update trial status
            setTrialEligible(false);
            setTrialMessage("Trial has been used");
            
            if (res.data.endDate) {
                setTrialData({
                    endDate: new Date(res.data.endDate),
                    planType: 'trial'
                });
                
                // Update subscription data
                setSubscriptionData({
                    active: true,
                    planType: 'trial',
                    endDate: res.data.endDate,
                    profiles: 1
                });
            }
            
            return res.data;
        } catch (error) {
            console.error('Error activating trial:', error);
            throw new Error(error.response?.data?.message || "Failed to activate trial");
        } finally {
            setLoading(false);
        }
    };

    // Calculate remaining trial days
    const getRemainingTrialDays = () => {
        if (!trialData?.endDate) return 0;

        const today = new Date();
        const end = new Date(trialData.endDate);

        // Strip time (set to midnight)
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    };

    const value = {
        // State
        subscriptionData,
        trialEligible,
        trialMessage,
        trialData,
        loading,
        error,
        
        // Functions
        checkSubscriptionStatus,
        activateTrial,
        getRemainingTrialDays,
        setUserId,
        setToken
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};
