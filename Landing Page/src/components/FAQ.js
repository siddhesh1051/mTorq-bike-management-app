import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: 'Is mTorq really free?',
      answer: 'Yes! mTorq is completely free with no hidden costs or premium tiers.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level security with JWT authentication and encrypted storage.',
    },
    {
      question: 'How does the timeline feature work?',
      answer: 'Every expense with an odometer reading creates a timeline entry, showing your trip mileage and associated costs.',
    },
    {
      question: 'How many bikes can I add?',
      answer: 'Unlimited! Track as many motorcycles as you own with separate timelines for each.',
    },
    {
      question: 'What types of documents can I store?',
      answer: 'RC certificates, insurance policies, PUC certificates, service records, warranties, and more.',
    },
  ];

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-[900px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-white/85">
            Everything you need to know about mTorq
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="glass-card p-8 md:p-12">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-white/10 pb-4"
              >
                <AccordionTrigger className="text-left text-lg md:text-xl font-semibold text-white hover:text-[#ccfbf1] transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/70 text-base md:text-lg leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;