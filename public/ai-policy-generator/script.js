document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('policyForm');
    const previewContainer = document.getElementById('previewContainer');
    const startOverBtn = document.getElementById('startOverBtn');
    const copyBtn = document.getElementById('copyBtn');
    const downloadRTFBtn = document.getElementById('downloadRTF');
    const citationFormatContainer = document.getElementById('citationFormatContainer');
    const citationFormat = document.getElementById('citationFormat');
    const otherCitationFormat = document.getElementById('otherCitationFormat');
    const customCitationFormat = document.getElementById('customCitationFormat');
    const otherDocumentationContainer = document.getElementById('otherDocumentationContainer');

    // Embed Modal Elements
    const embedBtn = document.getElementById('embedBtn');
    const embedModal = document.getElementById('embedModal');
    const closeModal = document.querySelector('.close-modal');
    const embedCode = document.getElementById('embedCode');
    const copyEmbedBtn = document.getElementById('copyEmbedBtn');

    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;

    // URL Parameter Handling
    function encodeFormState() {
        const formData = new FormData(form);
        const state = {
            // Radio buttons (single values)
            s: formData.get('policyScope'), // s for scope
            a: formData.get('aiUsage'),     // a for ai usage
            c: formData.get('citation'),    // c for citation
            
            // Checkboxes (arrays of values)
            u: Array.from(formData.getAll('useCases')),      // u for use cases
            d: Array.from(formData.getAll('documentation')), // d for documentation
            
            // Custom text inputs
            cu: document.getElementById('customUseCases')?.value || '',        // cu for custom use cases
            cd: document.getElementById('customDocumentation')?.value || '',   // cd for custom documentation
            cf: document.getElementById('customCitationFormat')?.value || ''   // cf for custom citation format
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
            
            if (state.cu && customUseCases) customUseCases.value = state.cu;
            if (state.cd && customDocumentation) customDocumentation.value = state.cd;
            if (state.cf && customCitationFormat) customCitationFormat.value = state.cf;
            
            // Update the form display
            updatePolicyScope();
            toggleCitationFormat();
            toggleOtherCitationFormat();
            toggleOtherDocumentation();
            toggleOtherUseCases();
            updatePolicyPreview();
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
                        icon: 'fas fa-plus-circle'
                    };
                }
                const cardContent = checkbox.closest('.option-card').querySelector('.card-content');
                return {
                    text: cardContent.querySelector('p:not(.hidden)').textContent,
                    icon: cardContent.querySelector('i').className
                };
            })
            .filter(item => item.text);

        if (selectedOptions.length === 0) return '';
        
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        const context = policyScope && policyScope.value === 'course' ? 'in this course' : 'for this assignment';
        
        const header = `If you use AI ${context}, you must also:`;
        const requirements = selectedOptions.map(item => 
            `<div class="requirement-item">
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            </div>`
        ).join('');

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
                        icon: 'fas fa-plus-circle'
                    };
                }
                const cardContent = checkbox.closest('.option-card').querySelector('.card-content');
                return {
                    text: cardContent.querySelector('p:not(.hidden)').textContent,
                    icon: cardContent.querySelector('i').className
                };
            })
            .filter(item => item.text);

        if (selectedOptions.length === 0) return '';
        
        const policyScope = document.querySelector('input[name="policyScope"]:checked');
        const context = policyScope && policyScope.value === 'course' ? 'in this course' : 'for this assignment';
        
        const header = `Approved use cases for AI tools ${context}:`;
        const requirements = selectedOptions.map(item => 
            `<div class="requirement-item">
                <i class="${item.icon}"></i>
                <span>${item.text}</span>
            </div>`
        ).join('');

        return `${header}\n${requirements}`;
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

            // Add documentation requirement if needed
            if (hasDocumentation) {
                if (requiresDisclosure) {
                    header += ' and additional documentation needs to be submitted';
                } else {
                    header += ', however additional documentation needs to be submitted';
                }
            }

            // Add header as first section
            policySections.push({
                text: header,
                icon: 'fas fa-info-circle',
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
                
                if (name === 'documentation' && !documentationProcessed) {
                    const selectedOptions = Array.from(document.querySelectorAll('input[name="documentation"]:checked'));
                    if (selectedOptions.length > 0) {
                        const text = getDocumentationText();
                        if (text) {
                            policySections.push({
                                text: text,
                                icon: 'fas fa-tasks',
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
                                icon: 'fas fa-check-circle',
                                isDocumentation: true
                            });
                        }
                    }
                    useCasesProcessed = true;
                } else if (name === 'citation') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption && selectedOption.value === 'required') {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const icon = cardContent.querySelector('i').className;
                        const answer = cardContent.querySelector('p:not(.hidden)').textContent;
                        
                        policySections.push({
                            text: answer,
                            icon
                        });
                    }
                } else if (name !== 'documentation' && name !== 'useCases') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const icon = cardContent.querySelector('i').className;
                        const answer = cardContent.querySelector('p:not(.hidden)').textContent;
                        
                        // Convert teacher-focused language to student-focused language
                        let studentText = answer;
                        if (name === 'aiUsage') {
                            studentText = answer.replace('AI tools are', 'You may');
                        }
                        
                        policySections.push({
                            text: studentText,
                            icon
                        });
                    }
                }
            }
        }

        // Generate policy statement
        let policyHTML = '';
        policySections.forEach(section => {
            if (section.isHeader) {
                policyHTML += `
                    <div class="policy-header">
                        <i class="${section.icon}"></i>
                        <h2>${section.text}</h2>
                    </div>
                `;
            } else if (section.isDocumentation) {
                const [header, ...requirements] = section.text.split('\n');
                policyHTML += `
                    <div class="policy-section">
                        <i class="${section.icon}"></i>
                        <div class="documentation-section">
                            <p class="documentation-header">${header}</p>
                            <div class="documentation-requirements">
                                ${requirements.join('')}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                policyHTML += `
                    <div class="policy-section">
                        <i class="${section.icon}"></i>
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
        }
        updatePolicyPreview();
        updateURL(); // Update URL when form changes
    });

    // Update URL when custom text inputs change
    ['customUseCases', 'customDocumentation', 'customCitationFormat'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                updateURL();
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
        
        // Reset all questions to their initial state
        document.getElementById('question3').classList.remove('hidden');
        document.getElementById('question4').classList.remove('hidden');
        document.getElementById('question5').classList.remove('hidden');
        
        // Reset custom inputs
        document.getElementById('customCitationFormat').value = '';
        document.getElementById('customDocumentation').value = '';
        document.getElementById('customUseCases').value = '';
        
        // Update all conditional displays
        updatePolicyScope();
        toggleCitationFormat();
        handleConditionalQuestions();
        
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
        const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
            .map(section => {
                if (section.querySelector('.documentation-section')) {
                    // Handle documentation and use cases sections
                    const header = section.querySelector('.documentation-header').textContent;
                    const requirements = Array.from(section.querySelectorAll('.requirement-item'))
                        .map(item => item.querySelector('span').textContent)
                        .join('\n');
                    return `${header}\n${requirements}`;
                } else {
                    // Handle regular policy sections
                    return section.querySelector('p').textContent.trim();
                }
            })
            .filter(text => text) // Remove any empty sections
            .join('\n\n');

        navigator.clipboard.writeText(policyText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const currentURL = window.location.href;
            navigator.clipboard.writeText(currentURL).then(() => {
                const originalHTML = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Copied!';
                setTimeout(() => {
                    shareBtn.innerHTML = originalHTML;
                }, 2000);
            }).catch(err => {
                console.error('Error copying to clipboard:', err);
            });
        });
    }

    // Download RTF button
    downloadRTFBtn.addEventListener('click', function() {
        const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
            .map(section => {
                if (section.querySelector('.documentation-section')) {
                    // Handle documentation and use cases sections
                    const header = section.querySelector('.documentation-header').textContent;
                    const requirements = Array.from(section.querySelectorAll('.requirement-item'))
                        .map(item => item.querySelector('span').textContent)
                        .join('\n');
                    return `${header}\n${requirements}`;
                } else {
                    // Handle regular policy sections
                    return section.querySelector('p').textContent.trim();
                }
            })
            .filter(text => text) // Remove any empty sections
            .join('\n\n');

        const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2639
{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}
{\\colortbl;\\red0\\green0\\blue0;}
\\paperw11900\\paperh16840\\margl1440\\margr1440\\vieww11520\\viewh8400\\viewkind0
\\pard\\tx566\\tx1133\\tx1700\\tx2267\\tx2834\\tx3401\\tx3968\\tx4535\\tx5102\\tx5669\\tx6236\\tx6803\\pardirnatural\\partightenfactor0

\\f0\\fs24 ${policyText.replace(/\n/g, '\\par ')}
}`;
        
        // Create a blob and download link
        const blob = new Blob([rtfContent], { type: 'application/rtf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-policy.rtf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});