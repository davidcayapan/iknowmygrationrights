import React from 'react';
import { Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: [
      'Access to basic rights information',
      'Document storage up to 100MB',
      'Email support',
      'Chat assistance in English & Spanish'
    ]
  },
  {
    name: 'Pro',
    price: 19.99,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Priority support',
      'Document storage up to 1GB',
      'Advanced analytics',
      'Custom document templates',
      'Priority chat assistance'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 49.99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Dedicated support manager',
      'Custom AI training',
      'API access',
      'Bulk document processing',
      'Custom analytics dashboard'
    ]
  }
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = (planName: string) => {
    // This will be implemented when we add Stripe integration
    console.log(`Subscribe to ${planName} plan`);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600">
          Get the support you need with our flexible pricing options
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-lg shadow-lg bg-white overflow-hidden ${
              plan.popular ? 'ring-2 ring-indigo-600 scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="bg-indigo-600 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600 ml-2">/{plan.interval}</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-md text-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Subscribe Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. No credit card required.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="text-indigo-600 hover:text-indigo-800 font-medium">
            Compare Plans
          </button>
          <span className="text-gray-300">|</span>
          <button className="text-indigo-600 hover:text-indigo-800 font-medium">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;