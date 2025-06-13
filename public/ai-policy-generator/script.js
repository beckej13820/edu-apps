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

    // Handle conditional questions based on AI usage
    function handleConditionalQuestions() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked');
        const citationQuestion = document.getElementById('question3');
        const documentationQuestion = document.getElementById('question4');

        if (aiUsage && aiUsage.value === 'prohibited') {
            citationQuestion.classList.add('hidden');
            documentationQuestion.classList.add('hidden');
        } else {
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
                    const customText = document.getElementById('customDocumentation').value.trim();
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
        if (!policyScope) return '';
        
        const isCourse = policyScope.value === 'course';
        const context = isCourse ? 'in this course' : 'for this assignment';
        
        const header = `If you use AI ${context}, you must also:`;
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

        // Process each question and its answer
        for (let [name, value] of formData.entries()) {
            if (name === 'citation_format' && value === 'other') {
                value = formData.get('customCitationFormat');
            }
            
            const questionContainer = document.querySelector(`[data-question="${name}"]`);
            if (questionContainer && !questionContainer.classList.contains('hidden')) {
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
                } else if (name !== 'documentation') {
                    const selectedOption = questionContainer.querySelector(`input[name="${name}"]:checked`);
                    if (selectedOption) {
                        const cardContent = selectedOption.closest('.option-card').querySelector('.card-content');
                        const icon = cardContent.querySelector('i').className;
                        const answer = cardContent.querySelector('p:not(.hidden)').textContent;
                        
                        // Convert teacher-focused language to student-focused language
                        let studentText = answer;
                        if (name === 'policyScope') {
                            studentText = answer.replace('This policy will apply', 'This policy applies');
                        } else if (name === 'aiUsage') {
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
            if (section.isDocumentation) {
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
        } else if (e.target.name === 'citation_format') {
            toggleOtherCitationFormat();
        } else if (e.target.name === 'documentation') {
            toggleOtherDocumentation();
        }
        updatePolicyPreview();
    });

    // Start Over button
    startOverBtn.addEventListener('click', function() {
        form.reset();
        citationFormatContainer.classList.add('hidden');
        otherCitationFormat.classList.add('hidden');
        otherDocumentationContainer.classList.add('hidden');
        document.getElementById('question3').classList.remove('hidden');
        document.getElementById('question4').classList.remove('hidden');
        updatePolicyScope();
        toggleCitationFormat();
        handleConditionalQuestions();
        updatePolicyPreview();
    });

    // Copy button
    copyBtn.addEventListener('click', function() {
        const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
            .map(section => {
                const answer = section.querySelector('p').textContent.trim();
                return answer;
            })
            .join('\n\n');

        navigator.clipboard.writeText(policyText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Download RTF button
    downloadRTFBtn.addEventListener('click', function() {
        const policyText = Array.from(previewContainer.querySelectorAll('.policy-section'))
            .map(section => {
                const answer = section.querySelector('p').textContent.trim();
                return answer;
            })
            .join('\n\n');

        const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2639
{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}
{\\colortbl;\\red0\\green0\\blue0;}
\\paperw11900\\paperh16840\\margl1440\\margr1440\\vieww11520\\viewh8400\\viewkind0
\\pard\\tx566\\tx1133\\tx1700\\tx2267\\tx2834\\tx3401\\tx3968\\tx4535\\tx5102\\tx5669\\tx6236\\tx6803\\pardirnatural\\partightenfactor0

\\f0\\fs24 ${policyText.replace(/\n/g, '\\par ')}
}`;

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
            
            updatePolicyPreview();
        });
    });

    // Handle documentation requirements
    const documentationInputs = document.querySelectorAll('input[name="documentation"]');
    documentationInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.value === 'other') {
                const container = document.getElementById('otherDocumentationContainer');
                container.classList.toggle('hidden', !input.checked);
            }
            updatePolicyPreview();
        });
    });

    // Embed functionality
    function generateEmbedCode() {
        const currentUrl = window.location.href;
        return `<iframe 
    src="${currentUrl}" 
    style="width: 100%; border: none; min-height: 600px;"
    title="AI Policy Generator"
    allow="clipboard-write"
></iframe>`;
    }

    // Show modal
    embedBtn.addEventListener('click', function() {
        embedCode.textContent = generateEmbedCode();
        embedModal.classList.remove('hidden');
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        embedModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === embedModal) {
            embedModal.classList.add('hidden');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !embedModal.classList.contains('hidden')) {
            embedModal.classList.add('hidden');
        }
    });

    // Copy embed code
    copyEmbedBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(embedCode.textContent).then(() => {
            const originalText = copyEmbedBtn.innerHTML;
            copyEmbedBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyEmbedBtn.innerHTML = originalText;
            }, 2000);
        });
    });

    // Initialize
    updatePolicyScope();
    handleConditionalQuestions();
    toggleCitationFormat();
    toggleOtherCitationFormat();
    toggleOtherDocumentation();
    updatePolicyPreview();

    // Update iframe height on window resize
    window.addEventListener('resize', updateIframeHeight);
}); 