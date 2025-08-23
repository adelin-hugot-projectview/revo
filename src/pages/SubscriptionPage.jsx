import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

// Remplacez par votre clé publique Stripe (commence par pk_test_...)
const stripePromise = loadStripe('pk_test_51RfoRnFWG5SW3jjZJX0UoHYtvM07zGim4IlIDg3TjlJvkerEGbAp7deIFTjhfzBikIY2kMN1ZY3JprCiInlpdWx000tmVoYAXO');

const SubscriptionPage = ({ companyInfo, colors, currentUserRole }) => {
    // États pour la gestion du paiement
    const [invoices, setInvoices] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loadingPayment, setLoadingPayment] = useState(true);
    const [paymentError, setPaymentError] = useState(null);

    // Fonctions de gestion du paiement
    const handleCheckout = async () => {
        try {
            const stripe = await stripePromise;

            // Appel à votre backend pour créer une session Checkout
            const response = await fetch('http://localhost:5001/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}), // Vous pouvez passer des données ici si nécessaire
            });

            const session = await response.json();

            // Rediriger l'utilisateur vers Stripe Checkout
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                console.error(result.error.message);
                alert(`Erreur: ${result.error.message}`);
            }
        } catch (error) {
            console.error('Error during checkout:', error);
            alert('Une erreur est survenue lors de l\'initialisation du paiement.');
        }
    };

    const handleManageSubscription = async () => {
        console.log('handleManageSubscription called');
        setLoadingPayment(true);
        setPaymentError(null);
        try {
            const customerId = companyInfo?.stripe_customer_id;
            console.log('Customer ID for portal session:', customerId);
            if (!customerId) {
                setPaymentError('ID client Stripe non configuré pour cette entreprise.');
                setLoadingPayment(false);
                return;
            }

            const returnUrl = window.location.origin + '/abonnement'; // Updated return URL
            console.log('Return URL for portal session:', returnUrl);

            const response = await fetch('http://localhost:5001/create-customer-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customer_id: customerId,
                    return_url: returnUrl,
                }),
            });

            console.log('Response status from portal session creation:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();
            console.log('Portal session URL:', data.url);
            window.location.href = data.url; // Rediriger vers le portail client Stripe

        } catch (error) {
            console.error('Error managing subscription:', error);
            setPaymentError('Erreur lors de la gestion de l\'abonnement.');
        } finally {
            setLoadingPayment(false);
        }
    };

    const fetchPaymentData = async () => {
        setLoadingPayment(true);
        setPaymentError(null);
        try {
            const customerId = companyInfo?.stripe_customer_id; // Utiliser l'ID client de l'entreprise

            if (!customerId) {
                setPaymentError('ID client Stripe non configuré pour cette entreprise.');
                setLoadingPayment(false);
                return;
            }

            // Récupérer les factures
            const invoicesResponse = await fetch(`http://localhost:5001/get-invoices?customer_id=${customerId}`);
            if (!invoicesResponse.ok) {
                throw new Error(`HTTP error! status: ${invoicesResponse.status}`);
            }
            const invoicesData = await invoicesResponse.json();
            setInvoices(invoicesData);

            // Récupérer l'abonnement actuel
            const subscriptionResponse = await fetch(`http://localhost:5001/get-current-subscription?customer_id=${customerId}`);
            if (!subscriptionResponse.ok) {
                throw new Error(`HTTP error! status: ${subscriptionResponse.status}`);
            }
            const subscriptionData = await subscriptionResponse.json();
            setCurrentSubscription(subscriptionData);

        } catch (err) {
            console.error('Error fetching payment data:', err);
            setPaymentError('Erreur lors du chargement des informations de paiement.');
        } finally {
            setLoadingPayment(false);
        }
    };

    // Appeler fetchPaymentData lorsque companyInfo change et que l'utilisateur est un administrateur
    useEffect(() => {
        if (companyInfo?.id && currentUserRole === 'Administrateur') {
            fetchPaymentData();
        }
    }, [companyInfo, currentUserRole]);

    if (!companyInfo) {
        return <div>Chargement des informations de la société...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 font-['Poppins'] mb-8">Abonnement & Facturation</h1>
            
            {currentUserRole === 'Administrateur' ? (
                <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm space-y-8 w-full">
                    {/* Section Gestion de l'abonnement */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 font-['Poppins'] mb-4">Gestion de l'abonnement</h2>
                        {loadingPayment && <p>Chargement des informations de paiement...</p>}
                        {paymentError && <p className="text-red-500">{paymentError}</p>}

                        {!loadingPayment && !paymentError && (
                            <>
                                {/* Section Abonnement Actuel */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Votre abonnement actuel</h3>
                                    {currentSubscription ? (
                                        <div className="border p-4 rounded-lg">
                                            <p>Statut: <span className="font-medium">{currentSubscription.status}</span></p>
                                            <p>Plan: <span className="font-medium">{currentSubscription.items.data[0].price.product.name}</span></p>
                                            <p>Prochaine facturation: <span className="font-medium">{new Date(currentSubscription.current_period_end * 1000).toLocaleDateString()}</span></p>
                                            <button
                                                onClick={handleManageSubscription}
                                                className="mt-4 px-4 py-2 text-white font-semibold rounded-lg transition-colors"
                                                style={{ backgroundColor: colors.primary }}
                                            >
                                                Gérer mon abonnement
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="mb-4">Vous n'avez pas d'abonnement actif.</p>
                                            <button
                                                onClick={handleCheckout}
                                                className="px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                                                style={{ backgroundColor: colors.primary }}
                                            >
                                                Souscrire au Plan Pro
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Section Factures Précédentes */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 font-['Poppins'] mb-4">Vos factures précédentes</h2>
                        {loadingPayment && <p>Chargement des factures...</p>}
                        {paymentError && <p className="text-red-500">{paymentError}</p>}
                        {!loadingPayment && !paymentError && (
                            invoices.length > 0 ? (
                                <ul className="space-y-3">
                                    {invoices.map(invoice => (
                                        <li key={invoice.id} className="flex justify-between items-center border p-3 rounded-lg">
                                            <span>Facture du {new Date(invoice.created * 1000).toLocaleDateString()}</span>
                                            <span>{(invoice.amount_due / 100).toFixed(2)} €</span>
                                            {invoice.invoice_pdf && (
                                                <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voir la facture</a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">Aucune facture trouvée.</p>
                            )
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm w-full text-center text-gray-600">
                    <p>Vous n'avez pas les permissions pour accéder à cette section.</p>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;