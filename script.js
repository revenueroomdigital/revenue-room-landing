document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    const stepRejection = document.getElementById('step-rejection');
    
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    const nextBtn2 = document.getElementById('nextBtn2');
    const backBtn3 = document.getElementById('backBtn3');
    
    const backToStartBtn = document.getElementById('backToStartBtn');
    const rejectedTypeSpan = document.getElementById('rejectedType');

    const submitFinal = document.getElementById('submitFinal');
    const rejectionMessageText = document.getElementById('rejectionMessageText');
    
    const fullNameInput = document.getElementById('fullNameInput');
    const emailInput = document.getElementById('emailInput');

    // Initialize intlTelInput
    const phoneInputField = document.querySelector("#mobileNumberInput");
    const phoneInput = window.intlTelInput(phoneInputField, {
        preferredCountries: ["us", "gb", "au", "pk"],
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    const allowedBusinesses = [
        'Local service business',
        'Online coach or consultant',
        'Agency or done-for-you service'
    ];

    const showInputError = (inputId, message) => {
        const errorEl = document.getElementById(`error-${inputId}`);
        const inputEl = document.getElementById(inputId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        }
        if (inputEl) {
            inputEl.classList.add('border-red-500');
            inputEl.classList.remove('border-[#2a2a2c]', 'hover:border-[#8a8a8e]');
        }
    };
    
    const clearInputErrors = () => {
        const inputs = ['fullNameInput', 'mobileNumberInput', 'emailInput'];
        inputs.forEach(id => {
            const errorEl = document.getElementById(`error-${id}`);
            const inputEl = document.getElementById(id);
            if (errorEl) {
                errorEl.classList.add('hidden');
                errorEl.textContent = '';
            }
            if (inputEl) {
                inputEl.classList.remove('border-red-500');
                inputEl.classList.add('border-[#2a2a2c]', 'hover:border-[#8a8a8e]');
            }
        });
    };

    const hideAllSteps = () => {
        clearInputErrors();
        const successView = document.getElementById('success-view');
        const steps = [step1, step2, step3, stepRejection, successView];
        steps.forEach(step => {
            if(step) {
                step.classList.remove('flex');
                step.classList.add('hidden');
            }
        });
    };

    const showRejection = (htmlMessage) => {
        rejectionMessageText.innerHTML = htmlMessage;
        hideAllSteps();
        stepRejection.classList.remove('hidden');
        stepRejection.classList.add('flex');
    };

    // Step 1 -> Step 2 or Rejection
    nextBtn.addEventListener('click', () => {
        const selectedBusiness = document.querySelector('input[name="businessType"]:checked').value;
        
        if (allowedBusinesses.includes(selectedBusiness)) {
            hideAllSteps();
            step2.classList.remove('hidden');
            step2.classList.add('flex');
        } else if (selectedBusiness === 'Low ticket product') {
            showRejection(`Sorry this offer doesn't work with low ticket products due to the workload involved. We have a full end to end agency that would love to work with you though! We work with over 300 businesses and are one of the Australias best performing end to end agency... <br><br><a href="https://revenueroomdigital.com.au/" class="text-brand-lime hover:underline font-semibold" target="_blank">Click here to visit our agency</a>`);
        } else {
            showRejection(`Sorry we don't work with <span class="text-white font-semibold">${selectedBusiness}</span> businesses. We have an agency website (<a href="https://revenueroomdigital.com.au/" class="text-brand-lime hover:underline" target="_blank">revenueroomdigital.com.au</a>) We wish you all the best!`);
        }
    });

    // Step 2 Back
    backBtn.addEventListener('click', () => {
        hideAllSteps();
        step1.classList.remove('hidden');
        step1.classList.add('flex');
    });

    // Step 2 -> Step 3
    nextBtn2.addEventListener('click', () => {
        clearInputErrors();
        let hasError = false;

        if (fullNameInput.value.trim() === '') {
            showInputError('fullNameInput', "Please enter your full name.");
            hasError = true;
        }

        if (emailInput.value.trim() === '' || !emailInput.value.includes('@')) {
            showInputError('emailInput', "Please enter a valid email address.");
            hasError = true;
        }

        if (!phoneInput.isValidNumber()) {
            showInputError('mobileNumberInput', "Please enter a valid phone number.");
            hasError = true;
        }

        if (hasError) return;

        hideAllSteps();
        step3.classList.remove('hidden');
        step3.classList.add('flex');
    });
    
    // Step 3 Back
    backBtn3.addEventListener('click', () => {
        hideAllSteps();
        step2.classList.remove('hidden');
        step2.classList.add('flex');
    });

    // Step 3 Submit (Final Submit)
    submitFinal.addEventListener('click', () => {
        document.getElementById('onboardingForm').dispatchEvent(new Event('submit'));
    });

    // Rejection Back
    backToStartBtn.addEventListener('click', () => {
        hideAllSteps();
        step1.classList.remove('hidden');
        step1.classList.add('flex');
    });

    // Prevent default form submission and transition to success view
    document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        // Add the source property specifically for this landing page
        data.source = "Landing Page";

        // Get the full formatted phone number with country code
        if (typeof phoneInput !== 'undefined' && phoneInput.getNumber) {
            data.mobileNumber = phoneInput.getNumber();
        }
        
        try {
            // Show loading state
            submitFinal.disabled = true;
            submitFinal.innerHTML = 'SUBMITTING...';

            // Post to Vercel API endpoint (which handles Make webhook)
            const response = await fetch('/api/webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                console.error('Failed to submit form to webhook');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            // Restore button state
            submitFinal.disabled = false;
            submitFinal.innerHTML = `
                SUBMIT
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            `;
            
            // Show Success UI inside the form container
            hideAllSteps();
            const successView = document.getElementById('success-view');
            successView.classList.remove('hidden');
            successView.classList.add('flex');
        }
    });
});


const reviewsData = [
    {
        "name": "Rachel W.",
        "role": "Marketing Director",
        "text": "No fluff, just results. They built our landing page, ran the ads, and brought the leads straight to us.",
        "image": "https://randomuser.me/api/portraits/women/28.jpg"
    },
    {
        "name": "Brittany T.",
        "role": "Consultant",
        "text": "The /wk offer is insane for the amount of work they do. Our calendars are packed.",
        "image": "https://randomuser.me/api/portraits/women/67.jpg"
    },
    {
        "name": "Emily G.",
        "role": "Fitness Coach",
        "text": "Finally, an agency that actually cares about ROI. We scaled from  to  a month in 60 days.",
        "image": "https://randomuser.me/api/portraits/women/67.jpg"
    },
    {
        "name": "Michelle R.",
        "role": "Real Estate Agent",
        "text": "The /wk offer is insane for the amount of work they do. Our calendars are packed.",
        "image": "https://randomuser.me/api/portraits/women/8.jpg"
    },
    {
        "name": "Lauren H.",
        "role": "Fitness Coach",
        "text": "Our lead volume tripled in the first month. The lack of long contracts gave me the confidence to try them out, and I am glad I did.",
        "image": "https://randomuser.me/api/portraits/women/34.jpg"
    },
    {
        "name": "Michael L.",
        "role": "Real Estate Agent",
        "text": "The leads just keep coming. Not only are they sending us highly qualified appointments, but they built out the entire funnel.",
        "image": "https://randomuser.me/api/portraits/men/57.jpg"
    },
    {
        "name": "Stephanie P.",
        "role": "Agency Owner",
        "text": "They took our struggling ad account and turned it into a predictable revenue machine.",
        "image": "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        "name": "Crystal M.",
        "role": "SaaS Founder",
        "text": "The leads just keep coming. Not only are they sending us highly qualified appointments, but they built out the entire funnel.",
        "image": "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
        "name": "John D.",
        "role": "Fitness Coach",
        "text": "Most agencies promise the world and deliver nothing. Revenue Room actually built a system that works.",
        "image": "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
        "name": "Heather T.",
        "role": "SaaS Founder",
        "text": "Best agency decision we have made. Consistent  months now thanks to their ad strategy.",
        "image": "https://randomuser.me/api/portraits/women/11.jpg"
    },
    {
        "name": "Christopher J.",
        "role": "Business Coach",
        "text": "Best agency decision we have made. Consistent  months now thanks to their ad strategy.",
        "image": "https://randomuser.me/api/portraits/men/85.jpg"
    },
    {
        "name": "Megan D.",
        "role": "Fitness Coach",
        "text": "We stopped all other marketing efforts because Revenue Room brings in more than enough business on its own.",
        "image": "https://randomuser.me/api/portraits/women/98.jpg"
    },
    {
        "name": "Charles J.",
        "role": "Business Coach",
        "text": "They took our struggling ad account and turned it into a predictable revenue machine.",
        "image": "https://randomuser.me/api/portraits/men/90.jpg"
    },
    {
        "name": "Michael G.",
        "role": "Local Service Owner",
        "text": "I was skeptical at first, but the results speak for themselves. We are fully booked 3 weeks out.",
        "image": "https://randomuser.me/api/portraits/men/91.jpg"
    },
    {
        "name": "Rachel A.",
        "role": "Real Estate Agent",
        "text": "Revenue Room completely revamped our offer and ads. We are seeing a 4x ROAS consistently.",
        "image": "https://randomuser.me/api/portraits/women/18.jpg"
    },
    {
        "name": "Joshua J.",
        "role": "SaaS Founder",
        "text": "Best agency decision we have made. Consistent  months now thanks to their ad strategy.",
        "image": "https://randomuser.me/api/portraits/men/87.jpg"
    },
    {
        "name": "Jennifer A.",
        "role": "Real Estate Agent",
        "text": "If you are on the fence, just do it. The ROI is undeniable and the team is super responsive.",
        "image": "https://randomuser.me/api/portraits/women/47.jpg"
    },
    {
        "name": "Steven G.",
        "role": "Fitness Coach",
        "text": "They took our struggling ad account and turned it into a predictable revenue machine.",
        "image": "https://randomuser.me/api/portraits/men/18.jpg"
    },
    {
        "name": "Amanda G.",
        "role": "Real Estate Agent",
        "text": "No fluff, just results. They built our landing page, ran the ads, and brought the leads straight to us.",
        "image": "https://randomuser.me/api/portraits/women/29.jpg"
    },
    {
        "name": "Robert S.",
        "role": "Business Coach",
        "text": "Our cost per lead dropped by 60% while the quality actually improved. Phenomenal work.",
        "image": "https://randomuser.me/api/portraits/men/84.jpg"
    },
    {
        "name": "Christopher L.",
        "role": "E-Commerce Founder",
        "text": "They do not just run ads; they fix your entire sales process. Highly recommend to any business owner.",
        "image": "https://randomuser.me/api/portraits/men/66.jpg"
    },
    {
        "name": "Charles M.",
        "role": "Consultant",
        "text": "They took our struggling ad account and turned it into a predictable revenue machine.",
        "image": "https://randomuser.me/api/portraits/men/83.jpg"
    },
    {
        "name": "Kenneth J.",
        "role": "Fitness Coach",
        "text": "We stopped all other marketing efforts because Revenue Room brings in more than enough business on its own.",
        "image": "https://randomuser.me/api/portraits/men/91.jpg"
    },
    {
        "name": "Sarah T.",
        "role": "Local Service Owner",
        "text": "Revenue Room completely revamped our offer and ads. We are seeing a 4x ROAS consistently.",
        "image": "https://randomuser.me/api/portraits/women/77.jpg"
    },
    {
        "name": "Melissa J.",
        "role": "SaaS Founder",
        "text": "No fluff, just results. They built our landing page, ran the ads, and brought the leads straight to us.",
        "image": "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
        "name": "Megan L.",
        "role": "Real Estate Agent",
        "text": "The onboarding was seamless, and we saw our first leads within 48 hours. Incredible speed and quality.",
        "image": "https://randomuser.me/api/portraits/women/94.jpg"
    },
    {
        "name": "Kevin W.",
        "role": "Agency Owner",
        "text": "I was skeptical at first, but the results speak for themselves. We are fully booked 3 weeks out.",
        "image": "https://randomuser.me/api/portraits/men/74.jpg"
    },
    {
        "name": "Kevin H.",
        "role": "Real Estate Agent",
        "text": "We were burning cash on ads before Revenue Room took over. Within 30 days, they halved our CPA.",
        "image": "https://randomuser.me/api/portraits/men/7.jpg"
    },
    {
        "name": "Emily L.",
        "role": "Local Service Owner",
        "text": "Most agencies promise the world and deliver nothing. Revenue Room actually built a system that works.",
        "image": "https://randomuser.me/api/portraits/women/41.jpg"
    },
    {
        "name": "Elizabeth S.",
        "role": "SaaS Founder",
        "text": "The leads just keep coming. Not only are they sending us highly qualified appointments, but they built out the entire funnel.",
        "image": "https://randomuser.me/api/portraits/women/4.jpg"
    },
    {
        "name": "Melissa H.",
        "role": "Marketing Director",
        "text": "I have worked with 4 different agencies in the past year. Revenue Room is the only one that actually delivered.",
        "image": "https://randomuser.me/api/portraits/women/87.jpg"
    },
    {
        "name": "Michael G.",
        "role": "Agency Owner",
        "text": "Our cost per lead dropped by 60% while the quality actually improved. Phenomenal work.",
        "image": "https://randomuser.me/api/portraits/men/13.jpg"
    },
    {
        "name": "Michelle G.",
        "role": "E-Commerce Founder",
        "text": "They took our struggling ad account and turned it into a predictable revenue machine.",
        "image": "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
        "name": "Brian M.",
        "role": "Business Coach",
        "text": "Everything a  agency does, but actually affordable. Unbelievable value.",
        "image": "https://randomuser.me/api/portraits/men/37.jpg"
    },
    {
        "name": "William L.",
        "role": "SaaS Founder",
        "text": "They took our struggling ad account and turned it into a predictable revenue machine.",
        "image": "https://randomuser.me/api/portraits/men/87.jpg"
    },
    {
        "name": "Robert G.",
        "role": "E-Commerce Founder",
        "text": "I love the transparency. Cancel anytime means they actually have to perform, and boy do they perform.",
        "image": "https://randomuser.me/api/portraits/men/72.jpg"
    },
    {
        "name": "Danielle T.",
        "role": "Real Estate Agent",
        "text": "I was skeptical at first, but the results speak for themselves. We are fully booked 3 weeks out.",
        "image": "https://randomuser.me/api/portraits/women/42.jpg"
    },
    {
        "name": "Anthony W.",
        "role": "Real Estate Agent",
        "text": "No fluff, just results. They built our landing page, ran the ads, and brought the leads straight to us.",
        "image": "https://randomuser.me/api/portraits/men/61.jpg"
    },
    {
        "name": "Robert W.",
        "role": "Consultant",
        "text": "We were struggling to scale past /mo. Revenue Room helped us break the /mo mark.",
        "image": "https://randomuser.me/api/portraits/men/8.jpg"
    },
    {
        "name": "Amy W.",
        "role": "Fitness Coach",
        "text": "The /wk offer is insane for the amount of work they do. Our calendars are packed.",
        "image": "https://randomuser.me/api/portraits/women/91.jpg"
    },
    {
        "name": "Stephanie H.",
        "role": "Agency Owner",
        "text": "The leads just keep coming. Not only are they sending us highly qualified appointments, but they built out the entire funnel.",
        "image": "https://randomuser.me/api/portraits/women/77.jpg"
    },
    {
        "name": "Nicole T.",
        "role": "Marketing Director",
        "text": "They do not just run ads; they fix your entire sales process. Highly recommend to any business owner.",
        "image": "https://randomuser.me/api/portraits/women/26.jpg"
    },
    {
        "name": "Michael J.",
        "role": "Fitness Coach",
        "text": "We were struggling to scale past /mo. Revenue Room helped us break the /mo mark.",
        "image": "https://randomuser.me/api/portraits/men/46.jpg"
    },
    {
        "name": "Jennifer M.",
        "role": "Agency Owner",
        "text": "Revenue Room completely revamped our offer and ads. We are seeing a 4x ROAS consistently.",
        "image": "https://randomuser.me/api/portraits/women/74.jpg"
    },
    {
        "name": "Ronald M.",
        "role": "Business Coach",
        "text": "The leads just keep coming. Not only are they sending us highly qualified appointments, but they built out the entire funnel.",
        "image": "https://randomuser.me/api/portraits/men/48.jpg"
    },
    {
        "name": "Courtney G.",
        "role": "Consultant",
        "text": "The /wk offer is insane for the amount of work they do. Our calendars are packed.",
        "image": "https://randomuser.me/api/portraits/women/7.jpg"
    },
    {
        "name": "Amy G.",
        "role": "E-Commerce Founder",
        "text": "Our cost per lead dropped by 60% while the quality actually improved. Phenomenal work.",
        "image": "https://randomuser.me/api/portraits/women/95.jpg"
    },
    {
        "name": "Stephanie R.",
        "role": "Fitness Coach",
        "text": "Revenue Room completely revamped our offer and ads. We are seeing a 4x ROAS consistently.",
        "image": "https://randomuser.me/api/portraits/women/91.jpg"
    },
    {
        "name": "Charles H.",
        "role": "Marketing Director",
        "text": "We were burning cash on ads before Revenue Room took over. Within 30 days, they halved our CPA.",
        "image": "https://randomuser.me/api/portraits/men/83.jpg"
    },
    {
        "name": "Nicole W.",
        "role": "Agency Owner",
        "text": "The /wk offer is insane for the amount of work they do. Our calendars are packed.",
        "image": "https://randomuser.me/api/portraits/women/3.jpg"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const reviewsGrid = document.getElementById("reviews-grid");
    const loadMoreBtn = document.getElementById("loadMoreReviewsBtn");
    
    if(!reviewsGrid || !loadMoreBtn || typeof reviewsData === "undefined") return;

    let currentReviewIndex = 0;
    const reviewsPerLoad = 6;

    function renderReviews(count) {
        const endIndex = Math.min(currentReviewIndex + count, reviewsData.length);
        
        for (let i = currentReviewIndex; i < endIndex; i++) {
            const review = reviewsData[i];
            
            const reviewEl = document.createElement("div");
            reviewEl.className = "bg-[#131314] border border-[#2a2a2c] rounded-2xl p-6 relative animate-fade-up";
            
            reviewEl.innerHTML = `
                <div class="flex items-center gap-4 mb-4">
                    <img src="${review.image}" alt="${review.name}" class="w-12 h-12 rounded-full object-cover border border-[#2a2a2c]" loading="lazy">
                    <div>
                        <h4 class="text-white font-bold text-base">${review.name}</h4>
                        <p class="text-brand-gray text-xs">${review.role}</p>
                    </div>
                </div>
                <p class="text-brand-gray text-sm leading-relaxed">
                    "${review.text}"
                </p>
            `;
            
            reviewsGrid.appendChild(reviewEl);
        }
        
        currentReviewIndex = endIndex;
        
        if (currentReviewIndex >= reviewsData.length) {
            loadMoreBtn.style.display = "none";
        }
    }

    // Initial load
    renderReviews(6);

    loadMoreBtn.addEventListener("click", () => {
        renderReviews(reviewsPerLoad);
    });
});

