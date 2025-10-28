document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('policyForm');
    const previewContainer = document.getElementById('previewContainer');
    const startOverBtn = document.getElementById('startOverBtn');
    const copyBtn = document.getElementById('copyBtn');
    const shareBtn = document.getElementById('shareBtn');
    const downloadRTFBtn = document.getElementById('downloadRTF');
    const citationFormatContainer = document.getElementById('citationFormatContainer');
    const citationFormat = document.getElementById('citationFormat');
    const otherCitationFormat = document.getElementById('otherCitationFormat');
    const customCitationFormat = document.getElementById('customCitationFormat');
    const otherDocumentationContainer = document.getElementById('otherDocumentationContainer');

    // Embed Modal Elements
    const embedBtn = document.getElementById('embedBtn');
    const embedModal = document.getElementById('embedModal');
    const embedCode = document.getElementById('embedCode');
    const copyEmbedBtn = document.getElementById('copyEmbedBtn');

    // Download Modal Elements
    const downloadModal = document.getElementById('downloadModal');
    const downloadHTMLBtn = document.getElementById('downloadHTML');
    const downloadMarkdownBtn = document.getElementById('downloadMarkdown');
    const downloadTextBtn = document.getElementById('downloadText');

    // Progress Indicator Elements
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Template Buttons
    const strictTemplate = document.getElementById('strictTemplate');
    const moderateTemplate = document.getElementById('moderateTemplate');
    const liberalTemplate = document.getElementById('liberalTemplate');
    const customTemplate = document.getElementById('customTemplate');

    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;

    // LocalStorage key
    const DRAFT_STORAGE_KEY = 'ai_policy_draft';

    // URL Parameter Handling
    function encodeFormState() {
        const formData = new FormData(form);
        const state = {
            // Radio buttons (single values)
            s: formData.get('policyScope'),          // s for scope
            a: formData.get('aiUsage'),              // a for ai usage
            c: formData.get('citation'),             // c for citation
            cons: formData.get('consequences'),      // cons for consequences
            ack: formData.get('acknowledgment'),     // ack for acknowledgment
            cd: formData.get('contentDetail'),       // cd for content detail
            rv: formData.get('researchVerification'),// rv for research verification
            ex: formData.get('exceptions'),          // ex for exceptions

            // Checkboxes (arrays of values)
            u: Array.from(formData.getAll('useCases')),      // u for use cases
            d: Array.from(formData.getAll('documentation')), // d for documentation

            // Custom text inputs
            cu: document.getElementById('customUseCases')?.value || '',          // cu for custom use cases
            cud: document.getElementById('customDocumentation')?.value || '',    // cud for custom documentation
            cf: document.getElementById('customCitationFormat')?.value || '',    // cf for custom citation format
            ccons: document.getElementById('customConsequences')?.value || '',   // ccons for custom consequences
            hc: document.getElementById('honorCodeURL')?.value || ''             // hc for honor code
        };

        // Convert to base64 to make it more compact
        return btoa(JSON.stringify(state));
    }

    function decodeFormState(encodedState) {
        try {
            const state = JSON.parse(atob(encodedState));

            // Set radio buttons
            if (state.s) {
                const radio = document.querySelector(`input[name="policyScope"][value="${state.s}"]`);
                if (radio) radio.checked = true;
            }
            if (state.a) {
                const radio = document.querySelector(`input[name="aiUsage"][value="${state.a}"]`);
                if (radio) radio.checked = true;
            }
            if (state.c) {
                const radio = document.querySelector(`input[name="citation"][value="${state.c}"]`);
                if (radio) radio.checked = true;
            }
            if (state.cons) {
                const radio = document.querySelector(`input[name="consequences"][value="${state.cons}"]`);
                if (radio) radio.checked = true;
            }
            if (state.ack) {
                const radio = document.querySelector(`input[name="acknowledgment"][value="${state.ack}"]`);
                if (radio) radio.checked = true;
            }
            if (state.cd) {
                const radio = document.querySelector(`input[name="contentDetail"][value="${state.cd}"]`);
                if (radio) radio.checked = true;
            }
            if (state.rv) {
                const radio = document.querySelector(`input[name="researchVerification"][value="${state.rv}"]`);
                if (radio) radio.checked = true;
            }
            if (state.ex) {
                const radio = document.querySelector(`input[name="exceptions"][value="${state.ex}"]`);
                if (radio) radio.checked = true;
            }

            // Set checkboxes
            if (state.u) {
                state.u.forEach(value => {
                    const checkbox = document.querySelector(`input[name="useCases"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            if (state.d) {
                state.d.forEach(value => {
                    const checkbox = document.querySelector(`input[name="documentation"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            // Set custom text inputs
            const customUseCases = document.getElementById('customUseCases');
            const customDocumentation = document.getElementById('customDocumentation');
            const customCitationFormat = document.getElementById('customCitationFormat');
            const customConsequences = document.getElementById('customConsequences');
            const honorCodeURL = document.getElementById('honorCodeURL');

            if (state.cu && customUseCases) customUseCases.value = state.cu;
            if (state.cud && customDocumentation) customDocumentation.value = state.cud;
            if (state.cf && customCitationFormat) customCitationFormat.value = state.cf;
            if (state.ccons && customConsequences) customConsequences.value = state.ccons;
            if (state.hc && honorCodeURL) honorCodeURL.value = state.hc;

            // Update the form display
            updatePolicyScope();
            toggleCitationFormat();
            toggleOtherCitationFormat();
            toggleOtherDocumentation();
            toggleOtherUseCases();
            handleConditionalQuestions();
            handleConditionalFollowups();
            updatePolicyPreview();
            calculateProgress();
        } catch (e) {
            // Silently ignore invalid parameters
            console.debug('Invalid URL parameters:', e);
        }
    }

    function updateURL() {
        try {
            const encodedState = encodeFormState();
            const newURL = new URL(window.location.href);
            newURL.searchParams.set('policy', encodedState);
            window.history.replaceState({}, '', newURL);
        } catch (e) {
            console.error('Error updating URL:', e);
        }
    }

    function initializeFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);
            const encodedState = params.get('policy');
            if (encodedState) {
                decodeFormState(encodedState);
                // Force an immediate preview update after loading parameters
                setTimeout(() => {
                    updatePolicyPreview();
                    updateIframeHeight();
                }, 0);
            }
        } catch (e) {
            console.error('Error initializing from URL:', e);
        }
    }

    // Initialize from URL parameters
    initializeFromURL();

    // Load draft from localStorage if available
    loadDraft();

    // Progress Calculation
    function calculateProgress() {
        const totalQuestions = 8; // Total number of main questions
        let answered = 0;

        // Check each required question
        if (document.querySelector('input[name="policyScope"]:checked')) answered++;
        if (document.querySelector('input[name="aiUsage"]:checked')) answered++;

        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        if (aiUsage && aiUsage.value !== 'prohibited') {
            // Use cases only count if AI is not prohibited
            if (aiUsage.value === 'limited' && document.querySelectorAll('input[name="useCases"]:checked').length > 0) {
                answered++;
            } else if (aiUsage.value === 'encouraged') {
                answered++; // Auto-counted when all uses are approved
            }
        } else if (aiUsage && aiUsage.value === 'prohibited') {
            answered++; // Skip use cases for prohibited
        }

        if (document.querySelector('input[name="citation"]:checked')) answered++;
        if (document.querySelectorAll('input[name="documentation"]:checked').length > 0) answered++;
        if (document.querySelector('input[name="consequences"]:checked')) answered++;
        if (document.querySelector('input[name="acknowledgment"]:checked')) answered++;

        // Honor code URL is optional, so we don't count it for progress

        const percentage = Math.round((answered / totalQuestions) * 100);
        progressFill.style.width = percentage + '%';
        progressText.textContent = percentage + '% Complete';

        return percentage;
    }

    // Template Functions
    function applyTemplate(templateType) {
        // Clear form first
        form.reset();

        switch(templateType) {
            case 'strict':
                // Strict: AI prohibited
                document.querySelector('input[name="policyScope"][value="course"]').checked = true;
                document.querySelector('input[name="aiUsage"][value="prohibited"]').checked = true;
                document.querySelector('input[name="exceptions"][value="accessibility"]').checked = true;
                document.querySelector('input[name="consequences"][value="institutional"]').checked = true;
                document.querySelector('input[name="acknowledgment"][value="yes"]').checked = true;
                break;

            case 'moderate':
                // Moderate: Limited use with documentation
                document.querySelector('input[name="policyScope"][value="course"]').checked = true;
                document.querySelector('input[name="aiUsage"][value="limited"]').checked = true;
                document.querySelector('input[name="useCases"][value="brainstorming"]').checked = true;
                document.querySelector('input[name="useCases"][value="research"]').checked = true;
                document.querySelector('input[name="useCases"][value="grammar"]').checked = true;
                document.querySelector('input[name="citation"][value="required"]').checked = true;
                document.querySelector('input[name="documentation"][value="tools"]').checked = true;
                document.querySelector('input[name="documentation"][value="reflection"]').checked = true;
                document.querySelector('input[name="consequences"][value="graded"]').checked = true;
                document.querySelector('input[name="acknowledgment"][value="yes"]').checked = true;
                break;

            case 'liberal':
                // Liberal: AI encouraged with reflection
                document.querySelector('input[name="policyScope"][value="course"]').checked = true;
                document.querySelector('input[name="aiUsage"][value="encouraged"]').checked = true;
                document.querySelector('input[name="citation"][value="required"]').checked = true;
                document.querySelector('input[name="documentation"][value="reflection"]').checked = true;
                document.querySelector('input[name="documentation"][value="learningoutcomes"]').checked = true;
                document.querySelector('input[name="consequences"][value="educational"]').checked = true;
                document.querySelector('input[name="acknowledgment"][value="yes"]').checked = true;
                break;

            case 'custom':
                // Just reset the form
                break;
        }

        // Trigger all updates
        updatePolicyScope();
        handleConditionalQuestions();
        handleConditionalFollowups();
        updatePolicyPreview();
        calculateProgress();
        saveDraft();
    }

    // Template button event listeners
    strictTemplate.addEventListener('click', () => applyTemplate('strict'));
    moderateTemplate.addEventListener('click', () => applyTemplate('moderate'));
    liberalTemplate.addEventListener('click', () => applyTemplate('liberal'));
    customTemplate.addEventListener('click', () => applyTemplate('custom'));

    // LocalStorage Functions
    function saveDraft() {
        try {
            const formData = new FormData(form);
            const draft = {};

            // Save all form values
            for (let [name, value] of formData.entries()) {
                if (!draft[name]) {
                    draft[name] = [];
                }
                draft[name].push(value);
            }

            // Save text inputs separately
            draft.customUseCases = document.getElementById('customUseCases')?.value || '';
            draft.customDocumentation = document.getElementById('customDocumentation')?.value || '';
            draft.customConsequences = document.getElementById('customConsequences')?.value || '';
            draft.honorCodeURL = document.getElementById('honorCodeURL')?.value || '';

            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch (e) {
            console.error('Failed to save draft:', e);
        }
    }

    function loadDraft() {
        try {
            const draftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (!draftStr) return;

            const draft = JSON.parse(draftStr);

            // Don't load draft if URL parameters are present (shared link takes precedence)
            const params = new URLSearchParams(window.location.search);
            if (params.get('policy')) return;

            // Load radio buttons and checkboxes
            Object.keys(draft).forEach(name => {
                if (Array.isArray(draft[name])) {
                    draft[name].forEach(value => {
                        const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
                        if (input) {
                            input.checked = true;
                        }
                    });
                }
            });

            // Load text inputs
            if (draft.customUseCases) document.getElementById('customUseCases').value = draft.customUseCases;
            if (draft.customDocumentation) document.getElementById('customDocumentation').value = draft.customDocumentation;
            if (draft.customConsequences) document.getElementById('customConsequences').value = draft.customConsequences;
            if (draft.honorCodeURL) document.getElementById('honorCodeURL').value = draft.honorCodeURL;

            // Update UI
            updatePolicyScope();
            handleConditionalQuestions();
            handleConditionalFollowups();
            updatePolicyPreview();
            calculateProgress();
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear draft:', e);
        }
    }

    // Conditional Follow-up Questions Handler
    function handleConditionalFollowups() {
        // Content Generation Follow-up
        const contentChecked = document.querySelector('input[name="useCases"][value="content"]:checked');
        const contentFollowup = document.getElementById('contentGenerationFollowup');
        if (contentChecked) {
            contentFollowup.classList.remove('hidden');
        } else {
            contentFollowup.classList.add('hidden');
            // Clear selections
            document.querySelectorAll('input[name="contentDetail"]').forEach(input => input.checked = false);
        }

        // Research Follow-up
        const researchChecked = document.querySelector('input[name="useCases"][value="research"]:checked');
        const researchFollowup = document.getElementById('researchFollowup');
        if (researchChecked) {
            researchFollowup.classList.remove('hidden');
        } else {
            researchFollowup.classList.add('hidden');
            // Clear selections
            document.querySelectorAll('input[name="researchVerification"]').forEach(input => input.checked = false);
        }

        // Prohibited Exceptions
        const prohibited = document.querySelector('input[name="aiUsage"][value="prohibited"]:checked');
        const exceptionsFollowup = document.getElementById('prohibitedExceptions');
        if (prohibited) {
            exceptionsFollowup.classList.remove('hidden');
        } else {
            exceptionsFollowup.classList.add('hidden');
            // Clear selections
            document.querySelectorAll('input[name="exceptions"]').forEach(input => input.checked = false);
        }

        // Custom Consequences
        const customConsequences = document.querySelector('input[name="consequences"][value="custom"]:checked');
        const customConsequencesContainer = document.getElementById('customConsequencesContainer');
        if (customConsequences) {
            customConsequencesContainer.classList.remove('hidden');
        } else {
            customConsequencesContainer.classList.add('hidden');
        }

        updateIframeHeight();
    }

    // Function to send height updates to parent window
    function updateIframeHeight() {
        if (isInIframe) {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'resize', height }, '*');
        }
    }

    // Function to send policy updates to parent window
    function sendPolicyUpdate() {
        if (isInIframe) {
            const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
                .map(section => {
                    const answer = section.querySelector('p').textContent.trim();
                    return answer;
                })
                .join('\n\n');
            
            window.parent.postMessage({ 
                type: 'policyUpdate', 
                policy: policyText 
            }, '*');
        }
    }

    // Listen for messages from parent window
    window.addEventListener('message', function(event) {
        // Verify origin if needed
        // if (event.origin !== "https://trusted-domain.com") return;

        if (event.data.type === 'getPolicy') {
            const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
                .map(section => {
                    const answer = section.querySelector('p').textContent.trim();
                    return answer;
                })
                .join('\n\n');
            
            event.source.postMessage({ 
                type: 'policyResponse', 
                policy: policyText 
            }, event.origin);
        }
    });

    // Show/hide citation format selector based on citation selection
    function toggleCitationFormat() {
        const selectedOption = document.querySelector('input[name="citation"]:checked');
        if (selectedOption && selectedOption.value === 'formal') {
            citationFormatContainer.classList.remove('hidden');
        } else {
            citationFormatContainer.classList.add('hidden');
        }
        updateIframeHeight();
    }

    // Show/hide other citation format input
    function toggleOtherCitationFormat() {
        if (citationFormat.value === 'other') {
            otherCitationFormat.classList.remove('hidden');
        } else {
            otherCitationFormat.classList.add('hidden');
        }
        updateIframeHeight();
    }

    // Show/hide other documentation input
    function toggleOtherDocumentation() {
        const otherCheckbox = document.querySelector('input[name="documentation"][value="other"]');
        if (otherCheckbox && otherCheckbox.checked) {
            otherDocumentationContainer.classList.remove('hidden');
        } else {
            otherDocumentationContainer.classList.add('hidden');
        }
        updateIframeHeight();
    }

    // Show/hide other use cases input
    function toggleOtherUseCases() {
        const otherCheckbox = document.querySelector('input[name="useCases"][value="other"]');
        if (otherCheckbox && otherCheckbox.checked) {
            document.getElementById('otherUseCasesContainer').classList.remove('hidden');
        } else {
            document.getElementById('otherUseCasesContainer').classList.add('hidden');
        }
        updateIframeHeight();
    }

    // Handle conditional questions based on AI usage
    function handleConditionalQuestions() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        const useCasesQuestion = document.getElementById('question5');
        const citationQuestion = document.getElementById('question3');
        const documentationQuestion = document.getElementById('question4');

        if (!aiUsage) {
            // If no AI usage is selected yet, show all questions
            useCasesQuestion.classList.remove('hidden');
            citationQuestion.classList.remove('hidden');
            documentationQuestion.classList.remove('hidden');
            return;
        }

        if (aiUsage.value === 'prohibited') {
            useCasesQuestion.classList.add('hidden');
            citationQuestion.classList.add('hidden');
            documentationQuestion.classList.add('hidden');
            
            // Uncheck both disclosure radio buttons when AI is prohibited
            const disclosureRadios = document.querySelectorAll('input[name="citation"]');
            disclosureRadios.forEach(radio => {
                radio.checked = false;
            });
        } else if (aiUsage.value === 'encouraged') {
            // Hide use cases when AI is allowed (all uses are approved)
            useCasesQuestion.classList.add('hidden');
            citationQuestion.classList.remove('hidden');
            documentationQuestion.classList.remove('hidden');
        } else {
            // Show all questions for limited use
            useCasesQuestion.classList.remove('hidden');
            citationQuestion.classList.remove('hidden');
            documentationQuestion.classList.remove('hidden');
        }
        updateIframeHeight();
    }

    // Update text based on policy scope
    function updatePolicyScope() {
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        if (policyScope) {
            const isCourse = policyScope.value === 'course';
            document.querySelectorAll('.course-text').forEach(el => {
                el.classList.toggle('hidden', !isCourse);
            });
            document.querySelectorAll('.assignment-text').forEach(el => {
                el.classList.toggle('hidden', isCourse);
            });
        }
        updateIframeHeight();
    }

    // Get documentation text
    function getDocumentationText() {
        const selectedOptions = Array.from(document.querySelectorAll('input[name="documentation"]:checked'))
            .map(checkbox => {
                if (checkbox.value === 'other') {
                    const customText = document.getElementById('customDocumentation')?.value?.trim() || '';
                    return {
                        text: customText,
                        icon: '➕'
                    };
                }
                const cardContent = checkbox.closest('.option-card').querySelector('.card-content');
                const iconSpan = cardContent.querySelector('.icon');
                return {
                    text: cardContent.querySelector('p:not(.hidden)').textContent,
                    icon: iconSpan ? iconSpan.textContent : ''
                };
            })
            .filter(item => item.text);

        if (selectedOptions.length === 0) return '';
        
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        const context = policyScope && policyScope.value === 'course' ? 'in this course' : 'for this assignment';
        
        const header = `If you use AI ${context}, you must also:`;
        const requirements = selectedOptions.map(item => 
            `<span class="icon">${item.icon}</span> ${item.text}`
        ).join('\n');

        return `${header}\n${requirements}`;
    }

    // Get use cases text
    function getUseCasesText() {
        const selectedOptions = Array.from(document.querySelectorAll('input[name="useCases"]:checked'))
            .map(checkbox => {
                if (checkbox.value === 'other') {
                    const customText = document.getElementById('customUseCases')?.value?.trim() || '';
                    return {
                        text: customText,
                        icon: '➕'
                    };
                }
                const cardContent = checkbox.closest('.option-card').querySelector('.card-content');
                const iconSpan = cardContent.querySelector('.icon');
                return {
                    text: cardContent.querySelector('p:not(.hidden)').textContent,
                    icon: iconSpan ? iconSpan.textContent : ''
                };
            })
            .filter(item => item.text);

        if (selectedOptions.length === 0) return '';
        
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        const context = policyScope && policyScope.value === 'course' ? 'in this course' : 'for this assignment';
        
        const header = `Approved use cases for AI tools ${context}:`;
        const requirements = selectedOptions.map(item => 
            `<span class="icon">${item.icon}</span> ${item.text}`
        ).join('\n');

        return `${header}\n${requirements}`;
    }

    // Generate dynamic policy icons based on current settings
    function generatePolicyIcons() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        const requiresDisclosure = document.querySelector('input[name="citation"][value="required"]:checked') !== null;
        const hasDocumentation = document.querySelectorAll('input[name="documentation"]:checked').length > 0;
        
        const icons = [];
        
        // AI Usage icon
        if (aiUsage) {
            switch (aiUsage.value) {
                case 'encouraged':
                    icons.push('<span class="policy-icon" aria-hidden="true" title="AI Use Permitted">✅</span>');
                    break;
                case 'limited':
                    icons.push('<span class="policy-icon" aria-hidden="true" title="Some AI Use Permitted">⚠️</span>');
                    break;
                case 'prohibited':
                    icons.push('<span class="policy-icon" aria-hidden="true" title="AI Prohibited">🚫</span>');
                    break;
            }
        }
        
        // Disclosure requirement icon
        if (requiresDisclosure) {
            icons.push('<span class="policy-icon" aria-hidden="true" title="Disclosure Required">📢</span>');
        }
        
        // Documentation requirement icon
        if (hasDocumentation && aiUsage && aiUsage.value !== 'prohibited') {
            icons.push('<span class="policy-icon" aria-hidden="true" title="Additional Documentation Required">📝</span>');
        }
        
        return icons.join('');
    }

    // Update policy preview
    function updatePolicyPreview() {
        const formData = new FormData(form);
        const policySections = [];
        let documentationProcessed = false;
        let useCasesProcessed = false;

        // Get AI usage selection
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        const requiresDisclosure = document.querySelector('input[name="citation"][value="required"]:checked') !== null;
        const hasDocumentation = document.querySelectorAll('input[name="documentation"]:checked').length > 0;

        // Generate header based on selections
        let header = '';
        if (aiUsage) {
            switch (aiUsage.value) {
                case 'encouraged':
                    header = 'AI Use Permitted';
                    break;
                case 'limited':
                    header = 'Some AI Use Permitted';
                    break;
                case 'prohibited':
                    header = 'AI Prohibited';
                    break;
            }

            // Add disclosure requirement if needed
            if (requiresDisclosure) {
                header += ', however use must be disclosed';
            }

            // Add documentation requirement if needed (only when AI is not prohibited)
            if (hasDocumentation && aiUsage.value !== 'prohibited') {
                if (requiresDisclosure) {
                    header += ' and additional documentation needs to be submitted';
                } else {
                    header += ', however additional documentation needs to be submitted';
                }
            }

            // Add header as first section with dynamic icons
            policySections.push({
                text: header,
                iconHTML: generatePolicyIcons(),
                isHeader: true
            });
        }

        // Process each question and its answer
        for (let [name, value] of formData.entries()) {
            if (name === 'citation_format' && value === 'other') {
                value = formData.get('customCitationFormat');
            }

            const questionContainer = document.querySelector(`[data-question="${name}"]`);
            if (questionContainer && !questionContainer.classList.contains('hidden')) {
                // Skip the policyScope section but keep its contextual effects
                if (name === 'policyScope') {
                    continue;
                }

                // Handle conditional follow-up questions
                if (name === 'contentDetail') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const iconSpan = cardContent.querySelector('.icon');
                        const answer = cardContent.querySelector('p').textContent;
                        policySections.push({
                            text: answer,
                            iconHTML: iconSpan ? iconSpan.outerHTML : ''
                        });
                    }
                    continue;
                }

                if (name === 'researchVerification') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const iconSpan = cardContent.querySelector('.icon');
                        const answer = cardContent.querySelector('p').textContent;
                        policySections.push({
                            text: answer,
                            iconHTML: iconSpan ? iconSpan.outerHTML : ''
                        });
                    }
                    continue;
                }

                if (name === 'exceptions') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const iconSpan = cardContent.querySelector('.icon');
                        const answer = cardContent.querySelector('p').textContent;
                        policySections.push({
                            text: answer,
                            iconHTML: iconSpan ? iconSpan.outerHTML : ''
                        });
                    }
                    continue;
                }

                // Handle consequences
                if (name === 'consequences') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const iconSpan = cardContent.querySelector('.icon');
                        let answer = cardContent.querySelector('p').textContent;

                        // If custom consequences, use the custom text
                        if (selectedOption.value === 'custom') {
                            const customText = document.getElementById('customConsequences')?.value?.trim();
                            if (customText) {
                                answer = customText;
                            }
                        }

                        policySections.push({
                            text: answer,
                            iconHTML: iconSpan ? iconSpan.outerHTML : '',
                            isConsequences: true
                        });
                    }
                    continue;
                }

                // Handle acknowledgment
                if (name === 'acknowledgment') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption && selectedOption.value === 'yes') {
                        policySections.push({
                            text: 'I acknowledge that I have read and understand this AI policy. I agree to follow these guidelines and understand the consequences of violating this policy.',
                            iconHTML: '<span class="icon" aria-hidden="true">✍️</span>',
                            isAcknowledgment: true
                        });
                    }
                    continue;
                }

                if (name === 'documentation' && !documentationProcessed) {
                    const selectedOptions = Array.from(document.querySelectorAll('input[name="documentation"]:checked'));
                    if (selectedOptions.length > 0) {
                        const text = getDocumentationText();
                        if (text) {
                            policySections.push({
                                text: text,
                                iconHTML: '<span class="icon" aria-hidden="true">📝</span>',
                                isDocumentation: true
                            });
                        }
                    }
                    documentationProcessed = true;
                } else if (name === 'useCases' && !useCasesProcessed) {
                    const selectedOptions = Array.from(document.querySelectorAll('input[name="useCases"]:checked'));
                    if (selectedOptions.length > 0) {
                        const text = getUseCasesText();
                        if (text) {
                            policySections.push({
                                text: text,
                                iconHTML: '<span class="icon" aria-hidden="true">✔️</span>',
                                isDocumentation: true
                            });
                        }
                    }
                    useCasesProcessed = true;
                } else if (name === 'citation') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption && selectedOption.value === 'required') {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const iconSpan = cardContent.querySelector('.icon');
                        const answer = cardContent.querySelector('p:not(.hidden)').textContent;
                        
                        policySections.push({
                            text: answer,
                            iconHTML: iconSpan ? iconSpan.outerHTML : ''
                        });
                    }
                } else if (name !== 'documentation' && name !== 'useCases') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const iconSpan = cardContent.querySelector('.icon');
                        const answer = cardContent.querySelector('p:not(.hidden)').textContent;
                        
                        // Convert teacher-focused language to student-focused language
                        let studentText = answer;
                        if (name === 'aiUsage') {
                            studentText = answer.replace('AI tools are', 'You may');
                        }
                        
                        policySections.push({
                            text: studentText,
                            iconHTML: iconSpan ? iconSpan.outerHTML : ''
                        });
                    }
                }
            }
        }

        // Add honor code link if provided
        const honorCodeURL = document.getElementById('honorCodeURL')?.value?.trim();
        if (honorCodeURL) {
            try {
                new URL(honorCodeURL); // Validate URL
                policySections.push({
                    text: `For more information about academic integrity, please review our <a href="${honorCodeURL}" target="_blank" rel="noopener noreferrer">Academic Integrity Policy</a>.`,
                    iconHTML: '<span class="icon" aria-hidden="true">🔗</span>',
                    isHonorCode: true
                });
            } catch (e) {
                // Invalid URL, skip
            }
        }

        // Generate policy statement
        let policyHTML = '';
        policySections.forEach(section => {
            if (section.isHeader) {
                // Determine the policy class based on AI usage
                let policyClass = '';
                if (aiUsage) {
                    switch (aiUsage.value) {
                        case 'encouraged':
                            policyClass = 'policy-permitted';
                            break;
                        case 'limited':
                            policyClass = 'policy-limited';
                            break;
                        case 'prohibited':
                            policyClass = 'policy-prohibited';
                            break;
                    }
                }

                policyHTML += `
                    <div class="policy-header ${policyClass}">
                        <div class="policy-icons">
                            ${section.iconHTML}
                        </div>
                        <h2>${section.text}</h2>
                    </div>
                `;
            } else if (section.isDocumentation) {
                const [header, ...requirements] = section.text.split('\n');
                policyHTML += `
                    <div class="policy-section">
                        ${section.iconHTML}
                        <div class="documentation-section">
                            <p class="documentation-header">${header}</p>
                            <ul class="documentation-requirements policy-list">
                                ${requirements.filter(r => r.trim()).map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            } else if (section.isConsequences) {
                policyHTML += `
                    <div class="policy-section">
                        ${section.iconHTML}
                        <div>
                            <p class="documentation-header">Consequences for Policy Violations:</p>
                            <p>${section.text}</p>
                        </div>
                    </div>
                `;
            } else if (section.isAcknowledgment) {
                policyHTML += `
                    <div class="policy-section">
                        ${section.iconHTML}
                        <div>
                            <p class="documentation-header">Student Acknowledgment:</p>
                            <p>${section.text}</p>
                        </div>
                    </div>
                `;
            } else if (section.isHonorCode) {
                policyHTML += `
                    <div class="policy-section">
                        ${section.iconHTML}
                        <p>${section.text}</p>
                    </div>
                `;
            } else {
                policyHTML += `
                    <div class="policy-section">
                        ${section.iconHTML}
                        <p>${section.text}</p>
                    </div>
                `;
            }
        });

        previewContainer.innerHTML = policyHTML || '<p>Select options to generate your policy statement.</p>';
        updateIframeHeight();
        sendPolicyUpdate();
    }

    // Event Listeners
    form.addEventListener('change', function(e) {
        if (e.target.name === 'policyScope') {
            updatePolicyScope();
        } else if (e.target.name === 'aiUsage') {
            handleConditionalQuestions();
            handleConditionalFollowups();
        } else if (e.target.name === 'citation') {
            toggleCitationFormat();
            // Force immediate preview update when citation changes
            updatePolicyPreview();
        } else if (e.target.name === 'citation_format') {
            toggleOtherCitationFormat();
        } else if (e.target.name === 'documentation') {
            toggleOtherDocumentation();
        } else if (e.target.name === 'useCases') {
            toggleOtherUseCases();
            handleConditionalFollowups();
        } else if (e.target.name === 'consequences') {
            handleConditionalFollowups();
        }
        updatePolicyPreview();
        updateURL(); // Update URL when form changes
        calculateProgress(); // Update progress
        saveDraft(); // Save to localStorage
    });

    // Update URL when custom text inputs change
    ['customUseCases', 'customDocumentation', 'customCitationFormat', 'customConsequences', 'honorCodeURL'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                updateURL();
                updatePolicyPreview();
                calculateProgress();
                saveDraft();
            });
        }
    });

    // Handle citation requirements
    const citationInputs = document.querySelectorAll('input[name="citation"]');
    citationInputs.forEach(input => {
        input.addEventListener('change', () => {
            const selectedValue = input.value;
            const documentationSection = document.getElementById('question4');
            
            // Show/hide documentation section based on disclosure requirement
            if (selectedValue === 'none') {
                documentationSection.classList.add('hidden');
                // Uncheck all documentation checkboxes
                document.querySelectorAll('input[name="documentation"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
            } else {
                documentationSection.classList.remove('hidden');
            }
            
            // Force immediate preview update
            updatePolicyPreview();
            updateURL(); // Update URL when citation changes
        });
    });

    // Start Over button
    startOverBtn.addEventListener('click', function() {
        // Clear the policy preview first
        previewContainer.innerHTML = '<p>Select options to generate your policy statement.</p>';

        // Reset the form and all inputs
        form.reset();
        citationFormatContainer.classList.add('hidden');
        otherCitationFormat.classList.add('hidden');
        otherDocumentationContainer.classList.add('hidden');
        document.getElementById('otherUseCasesContainer').classList.add('hidden');
        document.getElementById('customConsequencesContainer')?.classList.add('hidden');

        // Reset all questions to their initial state
        document.getElementById('question3').classList.remove('hidden');
        document.getElementById('question4').classList.remove('hidden');
        document.getElementById('question5').classList.remove('hidden');

        // Hide conditional followups
        document.getElementById('contentGenerationFollowup')?.classList.add('hidden');
        document.getElementById('researchFollowup')?.classList.add('hidden');
        document.getElementById('prohibitedExceptions')?.classList.add('hidden');

        // Reset custom inputs
        document.getElementById('customCitationFormat').value = '';
        document.getElementById('customDocumentation').value = '';
        document.getElementById('customUseCases').value = '';
        document.getElementById('customConsequences').value = '';
        document.getElementById('honorCodeURL').value = '';

        // Update all conditional displays
        updatePolicyScope();
        toggleCitationFormat();
        handleConditionalQuestions();
        handleConditionalFollowups();

        // Reset progress
        progressFill.style.width = '0%';
        progressText.textContent = '0% Complete';

        // Clear localStorage draft
        clearDraft();

        // Force the preview to stay cleared
        setTimeout(() => {
            previewContainer.innerHTML = '<p>Select options to generate your policy statement.</p>';
        }, 0);

        // Clear URL parameters
        const newURL = new URL(window.location.href);
        newURL.searchParams.delete('policy');
        window.history.replaceState({}, '', newURL);
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        const plainText = extractPlainText();
        navigator.clipboard.writeText(plainText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Text';
            }, 2000);
        });
    });

    // Share button
    shareBtn.addEventListener('click', function() {
        // Get the current URL with policy parameters
        const currentURL = window.location.href;
        
        navigator.clipboard.writeText(currentURL).then(() => {
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copied!';
            setTimeout(() => {
                shareBtn.textContent = 'Share';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy URL:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = currentURL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const originalText = shareBtn.textContent;
            shareBtn.textContent = 'Copied!';
            setTimeout(() => {
                shareBtn.textContent = 'Share';
            }, 2000);
        });
    });

    // Function to extract clean plain text with icons
    function extractPlainText() {
        const sections = [];
        
        // Add header
        const header = previewContainer.querySelector('.policy-header h2');
        if (header) {
            sections.push(header.textContent.trim());
            sections.push(''); // Empty line for spacing
        }
        
        // Add sections with clean formatting and icons
        Array.from(previewContainer.querySelectorAll('.policy-section')).forEach(section => {
            if (section.querySelector('.documentation-section')) {
                // Handle documentation and use cases sections
                const header = section.querySelector('.documentation-header').textContent.trim();
                const requirements = Array.from(section.querySelectorAll('li'))
                    .map(item => {
                        // The icon is embedded directly in the li text
                        return item.textContent.trim();
                    })
                    .join('\n');
                sections.push(`${header}\n${requirements}`);
            } else {
                // Handle regular policy sections
                const icon = section.querySelector('.icon')?.textContent || '';
                const text = section.querySelector('p').textContent.trim();
                if (text) {
                    sections.push(`${icon} ${text}`);
                }
            }
        });
        
        return sections.join('\n\n');
    }

    // Download button - now shows format selection modal
    downloadRTFBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            downloadModal.classList.remove('hidden');
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('Failed to open download modal:', error);
        }
    });

    // Embed button (show modal)
    embedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            // Generate the embed code with current domain and policy state
            const currentDomain = window.location.origin;
            const currentPath = window.location.pathname;
            const encodedState = encodeFormState();
            
            // Create embed code that works for both WordPress and Brightspace
            const iframeHTML = `<iframe src="${currentDomain}${currentPath}?policy=${encodedState}" width="100%" height="1000px" frameborder="0" style="border:none;"></iframe>`;
            
            // Set the embed code in the modal
            embedCode.textContent = iframeHTML;

            // Show the modal
            embedModal.classList.remove('hidden');
            document.body.classList.add('modal-open');
        } catch (error) {
            console.error('Failed to open embed modal:', error);
        }
    });

    // Close buttons for both modals
    const closeButtons = document.querySelectorAll('.close-modal');

    // Add event listeners to all close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            try {
                embedModal.classList.add('hidden');
                downloadModal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            } catch (error) {
                console.error('Failed to close modal:', error);
            }
        });
    });

    // Close modals when clicking outside
    embedModal.addEventListener('click', function(e) {
        if (e.target === embedModal) {
            embedModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    });

    downloadModal.addEventListener('click', function(e) {
        if (e.target === downloadModal) {
            downloadModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            embedModal.classList.add('hidden');
            downloadModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
    });

    // Copy embed code button
    copyEmbedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            const range = document.createRange();
            range.selectNodeContents(embedCode);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();

            const originalText = copyEmbedBtn.textContent;
            copyEmbedBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyEmbedBtn.textContent = originalText;
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    });

    // Download format event listeners
    downloadHTMLBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            downloadHTML();
            downloadModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        } catch (error) {
            console.error('Download HTML failed:', error);
        }
    });

    downloadMarkdownBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            downloadMarkdown();
            downloadModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        } catch (error) {
            console.error('Download Markdown failed:', error);
        }
    });

    downloadTextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            downloadPlainText();
            downloadModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        } catch (error) {
            console.error('Download Text failed:', error);
        }
    });

    // Download functions
    function downloadHTML() {
        const htmlContent = generateFormattedHTML();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_policy_statement.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadMarkdown() {
        const markdownContent = generateMarkdown();
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_policy_statement.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function downloadPlainText() {
        const plainText = extractPlainText();
        const blob = new Blob([plainText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_policy_statement.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Generate formatted HTML
    function generateFormattedHTML() {
        const sections = [];
        
        // Get AI usage for dynamic styling
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        let policyClass = '';
        if (aiUsage) {
            switch (aiUsage.value) {
                case 'encouraged':
                    policyClass = 'policy-permitted';
                    break;
                case 'limited':
                    policyClass = 'policy-limited';
                    break;
                case 'prohibited':
                    policyClass = 'policy-prohibited';
                    break;
            }
        }
        
        // Add header
        const header = previewContainer.querySelector('.policy-header h2');
        if (header) {
            sections.push(`<div class="policy-header ${policyClass}">
                <div class="policy-icons">
                    ${generatePolicyIcons()}
                </div>
                <h2>${header.textContent.trim()}</h2>
            </div>`);
        }
        
        // Add sections
        Array.from(previewContainer.querySelectorAll('.policy-section')).forEach(section => {
            if (section.querySelector('.documentation-section')) {
                const header = section.querySelector('.documentation-header').textContent.trim();
                // For each li, wrap the icon in <span class="icon">...</span>
                const requirements = Array.from(section.querySelectorAll('li'))
                    .map(item => {
                        // Extract icon and text
                        const iconMatch = item.textContent.trim().match(/^([\p{Emoji}\p{Symbol}\p{P}]+)\s+/u);
                        let icon = '';
                        let text = item.textContent.trim();
                        if (iconMatch) {
                            icon = iconMatch[1];
                            text = item.textContent.trim().slice(icon.length).trim();
                        }
                        return `<li><span class="icon">${icon}</span> ${text}</li>`;
                    })
                    .join('');
                const icon = section.querySelector('.icon')?.textContent || '';
                sections.push(`<div class="policy-section">
                    <span class="icon" aria-hidden="true">${icon}</span>
                    <div class="documentation-section">
                        <p class="documentation-header">${header}</p>
                        <ul class="documentation-requirements policy-list">
                            ${requirements}
                        </ul>
                    </div>
                </div>`);
            } else {
                const icon = section.querySelector('.icon')?.textContent || '';
                const text = section.querySelector('p').textContent.trim();
                if (text) {
                    sections.push(`<div class="policy-section">
                        <span class="icon" aria-hidden="true">${icon}</span>
                        <p>${text}</p>
                    </div>`);
                }
            }
        });
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Policy Statement</title>
    <style>
        .policy-statement .icon {
            font-size: 1.5em;
            vertical-align: middle;
            margin-right: 0.5em;
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            margin: 2rem; 
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            color: #333;
        }
        h1 { 
            color: #0066cc; 
            border-bottom: 2px solid #0066cc; 
            padding-bottom: 0.5rem; 
            margin-bottom: 2rem;
        }
        h2 { 
            color: #2c3e50; 
            margin-top: 2rem; 
            margin-bottom: 1rem;
        }
        ul { 
            margin-left: 1.5rem; 
            margin-bottom: 1.5rem;
        }
        li { 
            margin-bottom: 0.5rem; 
        }
        .policy-header {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .policy-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #2c3e50;
            font-weight: 600;
        }
        .policy-header .icon {
            font-size: 1.25rem;
            color: #007bff;
        }
        .policy-section {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1rem;
            width: 100%;
        }
        .policy-section .icon {
            font-size: 1.5em;
            vertical-align: middle;
            margin-right: 0.25em;
            flex-shrink: 0;
            margin-top: 0.25rem;
        }
        .policy-section p {
            margin: 0;
            flex: 1;
            font-size: 0.9rem;
        }
        .documentation-section {
            width: 100%;
        }
        .documentation-header {
            font-weight: bold;
            margin-bottom: 0.75rem;
            font-size: 1.1rem;
        }
        .documentation-requirements {
            margin-left: 0;
            padding-left: 0;
        }
        .documentation-requirements li {
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
        }
        .policy-list {
            list-style: none;
            padding-left: 0;
        }
        @media print {
            body { margin: 1rem; }
            .policy-header { break-inside: avoid; }
            .policy-section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <h1>AI Policy Statement</h1>
    <div class="policy-statement">
        ${sections.join('\n')}
    </div>
</body>
</html>`;
    }

    // Generate Markdown
    function generateMarkdown() {
        const sections = [];
        
        // Add header
        const header = previewContainer.querySelector('.policy-header h2');
        if (header) {
            sections.push(`# ${header.textContent.trim()}\n`);
        }
        
        // Add sections
        Array.from(previewContainer.querySelectorAll('.policy-section')).forEach(section => {
            if (section.querySelector('.documentation-section')) {
                const header = section.querySelector('.documentation-header').textContent.trim();
                const icon = section.querySelector('.icon')?.textContent || '';
                sections.push(`## ${icon} ${header}\n`);
                
                const requirements = Array.from(section.querySelectorAll('li'))
                    .map(item => `- ${item.textContent.trim()}`)
                    .join('\n');
                sections.push(requirements + '\n');
            } else {
                const icon = section.querySelector('.icon')?.textContent || '';
                const text = section.querySelector('p').textContent.trim();
                if (text) {
                    sections.push(`${icon} ${text}\n`);
                }
            }
        });
        
        return sections.join('\n');
    }

    // Add event delegation as fallback for WordPress iframe environments
    document.addEventListener('click', function(e) {
        // Handle modal opening buttons
        if (e.target.closest('#downloadRTF')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                downloadModal.classList.remove('hidden');
                document.body.classList.add('modal-open');
            } catch (error) {
                console.error('Failed to open download modal (delegated):', error);
            }
            return;
        }

        if (e.target.closest('#embedBtn')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                // Generate the embed code with current domain and policy state
                const currentDomain = window.location.origin;
                const currentPath = window.location.pathname;
                const encodedState = encodeFormState();
                
                // Create embed code that works for both WordPress and Brightspace
                const iframeHTML = `<iframe src="${currentDomain}${currentPath}?policy=${encodedState}" width="100%" height="1000px" frameborder="0" style="border:none;"></iframe>`;
                
                // Set the embed code in the modal
                embedCode.textContent = iframeHTML;

                // Show the modal
                embedModal.classList.remove('hidden');
                document.body.classList.add('modal-open');
            } catch (error) {
                console.error('Failed to open embed modal (delegated):', error);
            }
            return;
        }

        // Handle close modal buttons
        if (e.target.closest('.close-modal')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                embedModal.classList.add('hidden');
                downloadModal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            } catch (error) {
                console.error('Failed to close modal (delegated):', error);
            }
            return;
        }

        // Handle download buttons
        if (e.target.closest('#downloadHTML')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                downloadHTML();
                downloadModal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            } catch (error) {
                console.error('Download HTML failed (delegated):', error);
            }
            return;
        }

        if (e.target.closest('#downloadMarkdown')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                downloadMarkdown();
                downloadModal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            } catch (error) {
                console.error('Download Markdown failed (delegated):', error);
            }
            return;
        }

        if (e.target.closest('#downloadText')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                downloadPlainText();
                downloadModal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            } catch (error) {
                console.error('Download Text failed (delegated):', error);
            }
            return;
        }

        // Handle copy embed button
        if (e.target.closest('#copyEmbedBtn')) {
            e.preventDefault();
            e.stopPropagation();
            try {
                const range = document.createRange();
                range.selectNodeContents(embedCode);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                selection.removeAllRanges();

                const originalText = copyEmbedBtn.textContent;
                copyEmbedBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyEmbedBtn.textContent = originalText;
                }, 2000);
            } catch (error) {
                console.error('Copy failed (delegated):', error);
            }
            return;
        }
    });
});