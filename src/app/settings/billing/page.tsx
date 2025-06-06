
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, type ButtonProps } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, Loader2, CreditCard, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import type { UserSubscription, AvailablePlan, SubscriptionTier, SubscriptionStatus, InvoiceData } from '@/lib/types';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/razorpayActions';
import { addMonths, isFuture, format } from 'date-fns';
import { ALL_AVAILABLE_PLANS } from '@/lib/config';
import { cn } from '@/lib/utils';
import { generateInvoicePdf } from '@/lib/invoiceGenerator';
import { AskForNameDialog } from '@/components/AskForNameDialog'; // New Import

const NEXT_PUBLIC_RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

interface PlanDisplayInfo {
  isFree: boolean;
  isDiscounted: boolean;
  originalTotalPrice?: number;
  discountedPricePerMonth?: number;
  finalTotalPrice: number;
  priceMonthlyDirect?: number;
  durationMonths: number;
  discountPercentage?: number;
}

// Data structure to hold information needed for invoice generation
// if we have to wait for user to input their name.
interface PendingInvoiceContext {
  plan: AvailablePlan;
  paymentId: string;
  orderId: string;
  finalAmountPaid: number;
}

export default function BillingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [isAskNameDialogOpen, setIsAskNameDialogOpen] = useState(false);
  const [pendingInvoiceContext, setPendingInvoiceContext] = useState<PendingInvoiceContext | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        toast({
            title: "Razorpay Misconfiguration",
            description: "Razorpay Key ID is not properly set up. Payments may not function.",
            variant: "destructive",
            duration: 10000,
        });
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user ?? null);
        if (!session?.user) {
          setCurrentSubscription(null);
          setIsLoading(false);
        }
      }
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
       if(!user) setIsLoading(false);
    });
    return () => authListener.subscription?.unsubscribe();
  }, [toast]);

  const fetchSubscription = useCallback(async () => {
    if (!currentUser) {
      setCurrentSubscription(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { 
        throw error;
      }
      if (data) {
        setCurrentSubscription({
          ...data,
          tier: data.tier as SubscriptionTier,
          status: data.status as SubscriptionStatus,
          plan_start_date: data.plan_start_date ? new Date(data.plan_start_date) : null,
          plan_expiry_date: data.plan_expiry_date ? new Date(data.plan_expiry_date) : null,
        });
      } else {
        setCurrentSubscription(null); 
      }
    } catch (error: any) {
      toast({ title: 'Error Fetching Subscription', description: error.message, variant: 'destructive' });
      setCurrentSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser) {
        fetchSubscription();
    } else {
        setIsLoading(false);
        setCurrentSubscription(null);
    }
  }, [currentUser, fetchSubscription]);

  const calculatePlanDisplayInfo = (plan: AvailablePlan): PlanDisplayInfo => {
    if (plan.databaseTier === 'free') {
      return {
        isFree: true,
        isDiscounted: false,
        finalTotalPrice: 0,
        durationMonths: plan.durationMonths,
      };
    }
  
    const originalTotal = plan.priceMonthly * plan.durationMonths;
    let finalTotal = originalTotal;
    let discountedPerMonth;
  
    if (plan.discountPercentage && plan.discountPercentage > 0) {
      const discountAmount = originalTotal * (plan.discountPercentage / 100);
      finalTotal = originalTotal - discountAmount;
      discountedPerMonth = Math.round(finalTotal / plan.durationMonths); 
      return {
        isFree: false,
        isDiscounted: true,
        originalTotalPrice: Math.round(originalTotal),
        discountedPricePerMonth: discountedPerMonth,
        finalTotalPrice: Math.round(finalTotal),
        durationMonths: plan.durationMonths,
        discountPercentage: plan.discountPercentage,
      };
    } else {
      return {
        isFree: false,
        isDiscounted: false,
        priceMonthlyDirect: plan.priceMonthly, 
        finalTotalPrice: Math.round(originalTotal), 
        durationMonths: plan.durationMonths,
      };
    }
  };

  const proceedToGenerateInvoice = (userNameForInvoice: string, context: PendingInvoiceContext) => {
    const invoiceData: InvoiceData = {
      invoiceNumber: `INV-${format(new Date(), 'yyyyMMdd')}-${context.orderId.slice(-6)}`,
      invoiceDate: format(new Date(), 'PPP'),
      userName: userNameForInvoice,
      userEmail: currentUser?.email || 'N/A',
      planName: context.plan.name,
      planPrice: context.finalAmountPaid,
      paymentId: context.paymentId,
      orderId: context.orderId,
      companyName: "ProspectFlow Inc.",
      companyAddress: "123 Innovation Drive, Tech City, ST 54321",
      companyContact: "contact@prospectflow.com",
    };

    try {
      generateInvoicePdf(invoiceData);
      // Future: Save invoice metadata to Supabase `invoices` table here
      // For example: await supabase.from('invoices').insert({ user_id: currentUser.id, ...invoiceData });
    } catch (pdfError: any) {
      toast({
        title: 'Invoice Generation Failed',
        description: `Could not generate PDF: ${pdfError.message}. Your subscription is active. Please contact support for an invoice.`,
        variant: 'destructive',
        duration: 10000,
      });
    }
  };

  const handleNameSubmittedForInvoice = async (submittedName: string) => {
    if (!currentUser || !pendingInvoiceContext) {
      toast({ title: 'Error', description: 'User or payment context missing.', variant: 'destructive' });
      setIsAskNameDialogOpen(false);
      return;
    }

    try {
      const { data: updatedUser, error: userUpdateError } = await supabase.auth.updateUser({
        data: { full_name: submittedName }
      });

      if (userUpdateError) throw userUpdateError;

      // Refresh currentUser state or specifically update the name
      setCurrentUser(prevUser => prevUser ? {...prevUser, user_metadata: {...prevUser.user_metadata, full_name: submittedName}} : null);
      
      toast({ title: 'Name Updated', description: 'Your name has been saved to your profile.' });
      
      proceedToGenerateInvoice(submittedName, pendingInvoiceContext);

    } catch (error: any) {
      toast({ title: 'Error Updating Name', description: error.message, variant: 'destructive' });
      // Still attempt to generate invoice with email as fallback if name update fails
      proceedToGenerateInvoice(currentUser.email || 'Valued Customer', pendingInvoiceContext);
    } finally {
      setIsAskNameDialogOpen(false);
      setPendingInvoiceContext(null); // Clear pending context
    }
  };

  const handleSuccessfulPaymentAndSubscription = async (
    plan: AvailablePlan, 
    paymentId: string, 
    orderId: string,
    finalAmountPaid: number
  ) => {
    if (!currentUser) return;
    
    await fetchSubscription(); // Refresh subscription display first

    const userNameForInvoice = currentUser.user_metadata?.full_name || '';

    if (!userNameForInvoice) {
      setPendingInvoiceContext({ plan, paymentId, orderId, finalAmountPaid });
      setIsAskNameDialogOpen(true);
      toast({
          title: 'Name Required for Invoice',
          description: 'Please enter your name to include on the invoice.',
          duration: 7000,
      });
    } else {
      proceedToGenerateInvoice(userNameForInvoice, { plan, paymentId, orderId, finalAmountPaid });
    }
  };


  const handleSelectPlan = async (plan: AvailablePlan) => {
    if (!currentUser) {
      toast({ title: 'Not Logged In', description: 'Please log in to select a plan.', variant: 'destructive'});
      return;
    }
    
    const isAlreadyEffectivelyOnThisDbTier = currentSubscription?.tier === plan.databaseTier && currentSubscription?.status === 'active';

    if (plan.databaseTier === 'premium' && isAlreadyEffectivelyOnThisDbTier) {
      // Extending or changing duration of premium
    } else if (plan.databaseTier === 'free' && isAlreadyEffectivelyOnThisDbTier) {
      toast({ title: 'Plan Active', description: `You are already on the ${plan.name}.`, variant: 'default' });
      return;
    }

    setProcessingPlanId(plan.id);
    setIsProcessingPayment(true);

    try {
      let newStartDate: Date;
      let newExpiryDate: Date;

      const isUserCurrentlyOnActivePremium = 
        currentSubscription &&
        currentSubscription.tier === 'premium' && 
        currentSubscription.status === 'active' &&
        currentSubscription.plan_expiry_date &&
        isFuture(new Date(currentSubscription.plan_expiry_date));

      if (plan.databaseTier === 'premium' && isUserCurrentlyOnActivePremium) {
        newStartDate = new Date(currentSubscription!.plan_start_date!); 
        newExpiryDate = addMonths(new Date(currentSubscription!.plan_expiry_date!), plan.durationMonths);
      } else {
        newStartDate = new Date();
        newExpiryDate = addMonths(newStartDate, plan.durationMonths);
      }

      if (plan.databaseTier === 'free') {
        const { error: upsertError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: currentUser.id,
            tier: 'free',
            plan_start_date: newStartDate.toISOString(), 
            plan_expiry_date: newExpiryDate.toISOString(),
            status: 'active' as SubscriptionStatus,
            razorpay_order_id: null,
            razorpay_payment_id: null,
          }, { onConflict: 'user_id' });

        if (upsertError) throw new Error(upsertError.message || 'Failed to activate free plan.');
        toast({ title: 'Plan Activated!', description: `You are now on the ${plan.name}.` });
        await fetchSubscription();
      } else { 
        if (!NEXT_PUBLIC_RAZORPAY_KEY_ID) {
            throw new Error("Razorpay Key ID is not configured. Payment cannot proceed.");
        }
        
        const priceInfo = calculatePlanDisplayInfo(plan);
        const finalAmountForPayment = priceInfo.finalTotalPrice;

        const orderPayload = {
          amount: Math.round(finalAmountForPayment * 100), 
          currency: 'INR',
          receipt: `pf_${plan.id}_${Date.now()}`,
          notes: {
            purchaseOptionId: plan.id,
            mapsToDbTier: plan.databaseTier,
            userId: currentUser.id,
            userName: currentUser.user_metadata?.full_name || currentUser.email || 'User',
            userEmail: currentUser.email || 'N/A',
            durationMonths: plan.durationMonths
          }
        };
        const orderData = await createRazorpayOrder(orderPayload);
        
        if (!orderData || orderData.error || !orderData.order_id) {
          throw new Error(orderData?.error || 'Failed to create Razorpay order.');
        }
        
        const options = {
          key: NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "ProspectFlow",
          description: `${plan.name}`,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            setProcessingPlanId(plan.id); 
            setIsProcessingPayment(true); 
            try { 
              const verificationResult = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verificationResult.success) {
                const { error: upsertError } = await supabase
                  .from('user_subscriptions')
                  .upsert({
                    user_id: currentUser!.id, 
                    tier: 'premium',
                    plan_start_date: newStartDate.toISOString(), 
                    plan_expiry_date: newExpiryDate.toISOString(),
                    status: 'active' as SubscriptionStatus,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                  }, { onConflict: 'user_id' });

                 if (upsertError) throw new Error(upsertError.message || 'Failed to update subscription after payment.');
                toast({ title: 'Payment Successful!', description: `Your subscription to ${plan.name} is active.`});
                
                await handleSuccessfulPaymentAndSubscription(plan, response.razorpay_payment_id, response.razorpay_order_id, finalAmountForPayment);
              } else {
                toast({ title: 'Payment Verification Failed', description: verificationResult.error || 'Please contact support.', variant: 'destructive' });
              }
            } catch (handlerError: any) {
               toast({ title: 'Error Updating Subscription', description: handlerError.message || 'Could not update your subscription after payment.', variant: 'destructive' });
            } finally {
                setIsProcessingPayment(false);
                setProcessingPlanId(null);
            }
          },
          prefill: {
            name: currentUser.user_metadata?.full_name || currentUser.email,
            email: currentUser.email,
          },
          theme: {
            color: "#673AB7" 
          },
          modal: {
            ondismiss: function() {
              setIsProcessingPayment(false);
              setProcessingPlanId(null);
            }
          }
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            toast({
                title: 'Payment Failed',
                description: `Code: ${response.error.code}, Reason: ${response.error.description || response.error.reason}`,
                variant: 'destructive'
            });
            setIsProcessingPayment(false);
            setProcessingPlanId(null);
        });
        rzp.open();
        return; 
      }
    } catch (error: any) {
      toast({ title: 'Error Processing Plan', description: error.message || 'Could not process your request.', variant: 'destructive' });
    } 
    setIsProcessingPayment(false);
    setProcessingPlanId(null);
  };
  
  const displayedPlans = ALL_AVAILABLE_PLANS.map((plan) => {
    const priceInfo = calculatePlanDisplayInfo(plan);
    const isCurrentlySelectedProcessing = processingPlanId === plan.id && isProcessingPayment;

    const isUserOnActivePremium = 
        currentSubscription &&
        currentSubscription.tier === 'premium' && 
        currentSubscription.status === 'active' &&
        currentSubscription.plan_expiry_date &&
        isFuture(new Date(currentSubscription.plan_expiry_date));

    const isCardRepresentingCurrentActiveDbTier = currentSubscription?.tier === plan.databaseTier && currentSubscription?.status === 'active';

    let ctaTextParts: React.ReactNode[] = [];
    let finalButtonIsDisabled = isCurrentlySelectedProcessing;
    let finalButtonVariant: ButtonProps['variant'] = (plan.isPopular && plan.databaseTier === 'premium') ? 'default' : 'secondary';

    if (plan.databaseTier === 'free') {
        if (isUserOnActivePremium) { 
            ctaTextParts.push(<span key="text" className="font-bold">Premium Active</span>);
            finalButtonIsDisabled = true;
            finalButtonVariant = 'outline';
        } else if (isCardRepresentingCurrentActiveDbTier) { 
            ctaTextParts.push(<span key="text" className="font-bold">Current Plan</span>);
            finalButtonIsDisabled = true;
            finalButtonVariant = 'outline';
        } else { 
            ctaTextParts.push(<span key="text" className="font-bold">Switch to Free</span>);
            finalButtonVariant = 'secondary';
        }
    } else { 
        if (isUserOnActivePremium) {
            ctaTextParts.push(<span key="action" className="font-bold">Extend for</span>);
        } else { 
            ctaTextParts.push(<span key="action" className="font-bold">Buy for</span>);
        }
        
        if (isCardRepresentingCurrentActiveDbTier) {
             finalButtonVariant = 'outline'; 
        } else if (plan.isPopular) {
            finalButtonVariant = 'default';
        } else {
            finalButtonVariant = 'secondary';
        }
        
        if (priceInfo.isDiscounted && priceInfo.originalTotalPrice) {
           ctaTextParts.push(
                <s key="s" className="text-inherit opacity-70 ml-1.5">
                    <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span>
                    <span className="font-bold">{priceInfo.originalTotalPrice}</span>
                </s>
            );
        }
        ctaTextParts.push(
            <span key="final" className="ml-1">
                 <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span>
                 <span className="font-bold">{priceInfo.finalTotalPrice}</span>
            </span>
        );
    }
    
    const finalCtaButtonContent = <>{ctaTextParts}</>;

    return {
      ...plan,
      priceInfo,
      isCardRepresentingCurrentActiveDbTier: isCardRepresentingCurrentActiveDbTier,
      finalButtonIsDisabled: finalButtonIsDisabled,
      ctaButtonContent: finalCtaButtonContent,
      finalButtonVariant: finalButtonVariant,
    };
  });

  let currentPlanDisplayTitle = "N/A";
  let currentPlanStatus = "N/A";
  if (currentSubscription) {
      if (currentSubscription.tier === 'premium') {
          currentPlanDisplayTitle = "Premium"; 
      } else {
          currentPlanDisplayTitle = "Free Tier";
      }
      currentPlanStatus = currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1);
  } else if (!isLoading) { 
      currentPlanDisplayTitle = "Free Tier"; 
      currentPlanStatus = "Active";
  }

  if (isLoading && !currentUser) { 
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <CreditCard className="mr-3 h-7 w-7 text-primary" />
            Billing & Plan
          </h2>
          <p className="text-muted-foreground">Manage your subscription and billing details.</p>
        </div>

        {isLoading && !currentSubscription ? (
             <Card className="shadow-lg">
                <CardHeader><CardTitle className="font-headline text-xl text-primary">Loading current plan...</CardTitle></CardHeader>
                <CardContent><Loader2 className="h-6 w-6 animate-spin text-primary" /></CardContent>
             </Card>
        ): (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-primary">Your Current Plan: {currentPlanDisplayTitle}</CardTitle>
              {currentSubscription && (
                <CardDescription>
                    Status: <span className={`font-semibold ${currentSubscription.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {currentPlanStatus}
                    </span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {currentSubscription?.plan_start_date && (
                <p>Valid From: {format(new Date(currentSubscription.plan_start_date), 'PPP')}</p>
              )}
              {currentSubscription?.plan_expiry_date && currentSubscription?.status === 'active' && currentSubscription.tier === 'premium' && (
                <p>Valid Until: {format(new Date(currentSubscription.plan_expiry_date), 'PPP')}</p>
              )}
               {currentSubscription?.razorpay_order_id && (
                <p className="text-xs text-muted-foreground">Last Order ID: {currentSubscription.razorpay_order_id}</p>
              )}
               {!currentSubscription && !isLoading && ( 
                 <p className="text-sm text-muted-foreground">You are currently on the Free Tier.</p>
               )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {displayedPlans.map((plan) => {
            const { priceInfo } = plan;
            
            return (
            <Card key={plan.id} className={cn(
                "flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300 relative", 
                plan.isPopular && plan.databaseTier === 'premium' ? 'border-primary border-2' : ''
            )}>
              {plan.isPopular && plan.databaseTier === 'premium' && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-full shadow-md">
                    Most Popular
                    </div>
                </div>
              )}
              <CardHeader className={cn("pb-4", plan.isPopular && plan.databaseTier === 'premium' && "pt-7")}>
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1">
                <div className="text-4xl font-bold mb-1 min-h-[3rem] flex items-baseline">
                  {priceInfo.isFree ? (
                    "Free"
                  ) : priceInfo.isDiscounted && priceInfo.discountedPricePerMonth ? (
                    <div className="flex items-baseline flex-wrap gap-x-1.5">
                      <div className="flex items-baseline">
                        <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span>
                        <span className="font-bold">{priceInfo.discountedPricePerMonth}</span>
                        <span className="text-base font-normal text-muted-foreground self-end">/mo</span>
                      </div>
                      {priceInfo.discountPercentage && (
                        <span className="text-sm font-semibold text-green-600">
                          ({priceInfo.discountPercentage}% off)
                        </span>
                      )}
                    </div>
                  ) : ( 
                    priceInfo.priceMonthlyDirect && (
                        <div className="flex items-baseline">
                        <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span>
                        <span className="font-bold">{priceInfo.priceMonthlyDirect}</span>
                        <span className="text-base font-normal text-muted-foreground self-end">/mo</span>
                        </div>
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground min-h-[1.5em]">
                  {!priceInfo.isFree ? 
                   ( <>Total: <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span><span className="font-bold">{priceInfo.finalTotalPrice}</span> for {priceInfo.durationMonths} month{priceInfo.durationMonths > 1 ? 's' : ''}</> )
                   : ""
                  }
                </p>

                <ul className="space-y-2 text-sm pt-3"> 
                  {plan.features.map((feature, index) => (
                    <li key={index} className={`flex items-center ${feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                      {feature.included ? <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" /> : <Circle className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />}
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.finalButtonIsDisabled || (isProcessingPayment && processingPlanId === plan.id)}
                  variant={plan.finalButtonVariant}
                >
                  {(isProcessingPayment && processingPlanId === plan.id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {plan.ctaButtonContent}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
        </div>
         <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-primary"/>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p><strong>How do I cancel my subscription?</strong> Currently, plan cancellation is not self-serve. Please contact support for assistance.</p>
                <p><strong>What happens when my plan expires?</strong> Your plan will automatically revert to the Free Tier, and premium features/limits will no longer apply.</p>
                 <p><strong>Can I upgrade or downgrade my plan?</strong> Choosing a new premium purchase option while on an active premium plan will extend your premium status. If you are on Free, it will start a new premium subscription.</p>
            </CardContent>
        </Card>
      </div>
      {currentUser && (
        <AskForNameDialog
            isOpen={isAskNameDialogOpen}
            onOpenChange={setIsAskNameDialogOpen}
            onSubmitName={handleNameSubmittedForInvoice}
            currentEmail={currentUser.email}
        />
      )}
    </AppLayout>
  );
}
